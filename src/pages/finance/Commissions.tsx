import { useEffect, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Card, KPICard } from '../../components/ui/Card'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { adminApi } from '../../services/adminApi'

export default function FinanceCommissions() {
  const [commissions, setCommissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    fetchCommissions()
  }, [])

  const fetchCommissions = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getCommissions({})
      // Backend returns { commissions: [...], summary: {...} }
      // TransformInterceptor wraps it, so structure is: response.data.commissions or response.data
      const responseData = response.data?.data || response.data || {}
      setCommissions(Array.isArray(responseData) ? responseData : responseData?.commissions || responseData?.items || [])
      setSummary(responseData?.summary || null)
    } catch (error: any) {
      console.error('Error fetching commissions:', error)
      setCommissions([])
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
        <p className="text-sm text-gray-500 mt-1">Platform fees and commission breakdown</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <KPICard
            title="Total Commissions"
            value={summary.total_commissions ? formatAmount(summary.total_commissions) : '0.00 MAD'}
            icon={<CreditCard className="h-6 w-6" />}
          />
          <KPICard
            title="From Nexa Pay"
            value={summary.nexapay_commissions ? formatAmount(summary.nexapay_commissions) : '0.00 MAD'}
          />
        </div>
      )}

      <Card>
        {commissions.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <p>No commission data available</p>
            <p className="text-sm mt-2">Commission endpoints may not be implemented yet</p>
          </div>
        )}

        <Table
          headers={['Service', 'Transaction ID', 'Amount', 'Commission Rate', 'Commission', 'Date']}
          isLoading={isLoading}
          emptyMessage="No commissions found"
        >
          {commissions.map((commission) => (
            <TableRow key={commission.id}>
              <TableCell>{commission.service || 'N/A'}</TableCell>
              <TableCell className="font-mono text-xs">{commission.transaction_id?.substring(0, 8) || 'N/A'}</TableCell>
              <TableCell>{formatAmount(commission.amount || 0)}</TableCell>
              <TableCell>{(commission.rate || 0) * 100}%</TableCell>
              <TableCell className="font-semibold">{formatAmount(commission.commission_amount || 0)}</TableCell>
              <TableCell>{new Date(commission.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
