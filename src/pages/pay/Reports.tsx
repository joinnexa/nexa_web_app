import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'
import { Card, KPICard } from '../../components/ui/Card'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { adminApi } from '../../services/adminApi'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function PayReports() {
  const [revenue, setRevenue] = useState<Record<string, unknown> | null>(null)
  const [transactions, setTransactions] = useState<unknown[]>([])
  const [chartData, setChartData] = useState<{ date: string; amount: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [revRes, txRes] = await Promise.all([
        adminApi.getRevenue({}),
        adminApi.getTransactions({ limit: 100 }),
      ])
      const rev = revRes.data?.data || revRes.data || {}
      setRevenue(rev as Record<string, unknown>)

      const txs = txRes.data?.data || txRes.data || []
      const list = Array.isArray(txs) ? txs : txs?.items || []
      setTransactions(list)

      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
      })
      const byDate: Record<string, number> = {}
      last7.forEach((d) => { byDate[d] = 0 })
      list.forEach((tx: { created_at?: string; amount?: number; status?: string }) => {
        const d = tx.created_at?.split('T')[0]
        if (d && d in byDate && tx.status === 'COMPLETED') {
          byDate[d] += parseFloat(String(tx.amount || 0))
        }
      })
      setChartData(
        last7.map((d) => ({
          date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: Math.round(byDate[d] || 0),
        }))
      )
    } catch (err: unknown) {
      console.error('Error fetching reports:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 }).format(amount)

  const totalRev = (revenue?.total_revenue ?? revenue?.monthly_revenue ?? 0) as number

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Transaction and revenue reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatAmount(totalRev)}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KPICard
          title="Monthly"
          value={formatAmount((revenue?.monthly_revenue ?? 0) as number)}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KPICard title="Transactions" value={transactions.length.toString()} />
      </div>

      <Card title="Revenue Trend (7 Days)" subtitle="Daily transaction volume">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v: number) => `${formatAmount(v)}`} />
              <Line type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={2} name="Amount (MAD)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No data available
          </div>
        )}
      </Card>

      <Card title="Recent Transactions">
        <Table
          headers={['ID', 'Amount', 'Status', 'Created']}
          isLoading={isLoading}
          emptyMessage="No transactions"
        >
          {(transactions as { id?: string; amount?: number; status?: string; created_at?: string }[]).slice(0, 20).map((tx, i) => (
            <TableRow key={tx.id || `tx-${i}`}>
              <TableCell className="font-mono text-xs">{(tx.id || '').substring(0, 8)}...</TableCell>
              <TableCell className="font-medium">{formatAmount(Number(tx.amount || 0))}</TableCell>
              <TableCell>
                <span className={tx.status === 'COMPLETED' ? 'text-green-600' : 'text-amber-600'}>{tx.status || 'N/A'}</span>
              </TableCell>
              <TableCell>{tx.created_at ? new Date(tx.created_at).toLocaleString() : '—'}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
