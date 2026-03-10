import { useEffect, useState } from 'react'
import { Eye, Download, RotateCcw } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'
import { useNavigate } from 'react-router-dom'

interface Transaction {
  id: string
  type: string
  status: string
  amount: number
  sender_phone?: string
  receiver_phone?: string
  reference?: string
  created_at: string
}

export default function NexaPayTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const navigate = useNavigate()

  useEffect(() => {
    fetchTransactions()
  }, [filterType, filterStatus])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const params: any = { page: 1, limit: 50 }
      if (filterType !== 'all') params.type = filterType
      if (filterStatus !== 'all') params.status = filterStatus
      if (dateRange.start) params.start_date = dateRange.start
      if (dateRange.end) params.end_date = dateRange.end

      const response = await adminApi.getTransactions(params)
      const data = response.data?.data || response.data
      setTransactions(Array.isArray(data) ? data : data?.transactions || data?.items || [])
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const params: any = {}
      if (filterType !== 'all') params.type = filterType
      if (filterStatus !== 'all') params.status = filterStatus
      if (dateRange.start) params.start_date = dateRange.start
      if (dateRange.end) params.end_date = dateRange.end

      const response = await adminApi.exportTransactions(params)
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (error) {
      console.error('Error exporting transactions:', error)
      alert('Failed to export transactions')
    }
  }

  const handleReverse = async (transactionId: string) => {
    const reason = prompt('Enter reason for reversal:')
    if (!reason) return

    try {
      await adminApi.reverseTransaction(transactionId, reason)
      alert('Transaction reversed successfully')
      fetchTransactions()
    } catch (error) {
      console.error('Error reversing transaction:', error)
      alert('Failed to reverse transaction')
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      COMPLETED: 'success',
      PENDING: 'warning',
      FAILED: 'danger',
      REVERSED: 'default',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nexa Pay Transactions</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor and manage all transactions</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="TRANSFER">Transfer</option>
            <option value="TOPUP">Top-up</option>
            <option value="WITHDRAW">Withdraw</option>
            <option value="QR_PAYMENT">QR Payment</option>
            <option value="NFC_PAYMENT">NFC Payment</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REVERSED">Reversed</option>
          </select>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="End Date"
          />
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Filter
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <Table
          headers={['ID', 'Type', 'Amount', 'Parties', 'Status', 'Date', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No transactions found"
        >
          {transactions.map((tx) => (
            <TableRow
              key={tx.id}
              onClick={() => navigate(`/pay/transactions/${tx.id}`)}
            >
              <TableCell className="font-mono text-xs">{tx.id.substring(0, 8)}...</TableCell>
              <TableCell>{tx.type}</TableCell>
              <TableCell className="font-semibold">{formatAmount(tx.amount)}</TableCell>
              <TableCell>
                <div className="text-xs">
                  {tx.sender_phone && <div>From: {tx.sender_phone}</div>}
                  {tx.receiver_phone && <div>To: {tx.receiver_phone}</div>}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(tx.status)}</TableCell>
              <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/pay/transactions/${tx.id}`)
                    }}
                    className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {tx.status === 'COMPLETED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReverse(tx.id)
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Reverse"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
