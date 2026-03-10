import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { adminApi } from '../../services/adminApi'

export default function SupportRefunds() {
  const [refunds, setRefunds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRefunds()
  }, [])

  const fetchRefunds = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getRefunds({})
      const data = response.data?.data || response.data || {}
      setRefunds(Array.isArray(data) ? data : data?.refunds || data?.items || [])
    } catch (error: any) {
      console.error('Error fetching refunds:', error)
      setRefunds([])
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      APPROVED: 'success',
      PROCESSED: 'success',
      PENDING: 'warning',
      REJECTED: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
        <p className="text-sm text-gray-500 mt-1">Manage refund requests and processing</p>
      </div>

      <Card>
        {refunds.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <RotateCcw className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="mb-2">No refunds data available</p>
            <p className="text-sm">Refund endpoints may not be implemented yet</p>
          </div>
        )}

        <Table
          headers={['Refund ID', 'Transaction ID', 'User', 'Amount', 'Reason', 'Status', 'Created']}
          isLoading={isLoading}
          emptyMessage="No refunds found"
        >
          {refunds.map((refund) => (
            <TableRow key={refund.id}>
              <TableCell className="font-mono text-xs">{refund.id.substring(0, 8)}...</TableCell>
              <TableCell className="font-mono text-xs">{refund.transaction_id?.substring(0, 8) || 'N/A'}</TableCell>
              <TableCell>{refund.user_name || refund.user_phone || 'N/A'}</TableCell>
              <TableCell className="font-semibold">{formatAmount(refund.amount || 0)}</TableCell>
              <TableCell className="text-sm">{refund.reason || 'N/A'}</TableCell>
              <TableCell>{getStatusBadge(refund.status)}</TableCell>
              <TableCell>{new Date(refund.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
