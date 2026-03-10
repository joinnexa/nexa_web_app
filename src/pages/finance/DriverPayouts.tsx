import { useEffect, useState } from 'react'
import { DollarSign } from 'lucide-react'
import { Card, KPICard } from '../../components/ui/Card'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { adminApi } from '../../services/adminApi'

interface Payout {
  id: string
  driver_id: string
  driver_name: string
  amount: number
  status: string
  period: string
  processed_at: string | null
  total_earned?: number
  total_paid?: number
  pending_balance?: number
}

export default function FinanceDriverPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPayouts()
  }, [])

  const fetchPayouts = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getDriverPayouts({})
      const data = response.data?.data || response.data
      setPayouts(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Error fetching driver payouts:', err)
      setPayouts([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const totalPending = payouts.reduce((s, p) => s + (p.pending_balance ?? p.amount ?? 0), 0)
  const totalEarned = payouts.reduce((s, p) => s + (p.total_earned ?? 0), 0)
  const totalPaid = payouts.reduce((s, p) => s + (p.total_paid ?? 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Driver Payouts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Taxi driver earnings and payout status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Pending"
          value={formatAmount(totalPending)}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KPICard title="Total Earned" value={formatAmount(totalEarned)} />
        <KPICard title="Total Paid" value={formatAmount(totalPaid)} />
      </div>

      <Card>
        <Table
          headers={['Driver', 'Total Earned', 'Total Paid', 'Pending Balance', 'Status']}
          isLoading={isLoading}
          emptyMessage="No driver payouts found"
        >
          {payouts.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.driver_name}</TableCell>
              <TableCell>{formatAmount(p.total_earned ?? 0)}</TableCell>
              <TableCell>{formatAmount(p.total_paid ?? 0)}</TableCell>
              <TableCell className="font-semibold">{formatAmount(p.pending_balance ?? p.amount ?? 0)}</TableCell>
              <TableCell>
                <span className={p.status === 'COMPLETED' ? 'text-green-600' : 'text-amber-600'}>{p.status}</span>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
