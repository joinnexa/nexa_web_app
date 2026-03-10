import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { adminApi } from '../../services/adminApi'

interface TransactionReceiptData {
  id: string
  reference: string
  type: string
  amount: number
  fee?: number
  status: string
  created_at: string
  sender_user_id?: string | null
  sender_phone?: string | null
  sender_name?: string | null
  receiver_user_id?: string | null
  receiver_phone?: string | null
  receiver_name?: string | null
  failure_reason?: string | null
  idempotency_key?: string | null
}

export default function TransactionReceipt() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tx, setTx] = useState<TransactionReceiptData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) fetchTransaction(id)
  }, [id])

  const fetchTransaction = async (txId: string) => {
    try {
      setIsLoading(true)
      const response = await adminApi.getTransaction(txId)
      const data = response.data?.data ?? response.data
      setTx(data ?? null)
    } catch (error) {
      console.error('Error fetching transaction:', error)
      setTx(null)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

  const handlePrint = () => {
    window.print()
  }

  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' => {
    const map: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      COMPLETED: 'success',
      PENDING: 'warning',
      FAILED: 'danger',
      REVERSED: 'default',
    }
    return map[status] ?? 'default'
  }

  if (isLoading && !tx) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!tx) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/pay/transactions')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transactions
        </button>
        <Card className="p-6 text-center text-gray-500">Transaction not found</Card>
      </div>
    )
  }

  const fromLabel = tx.sender_name || tx.sender_phone || tx.sender_user_id || '—'
  const toLabel = tx.receiver_name || tx.receiver_phone || tx.receiver_user_id || '—'

  return (
    <div className="p-6 space-y-6 print:p-0">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => navigate('/pay/transactions')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transactions
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
        >
          <Printer className="h-4 w-4" />
          Print receipt
        </button>
      </div>

      <Card className="max-w-xl mx-auto overflow-hidden print:shadow-none print:border print:max-w-full" id="receipt">
        <div className="bg-primary-600 text-white px-6 py-4 print:bg-gray-800">
          <h1 className="text-lg font-semibold">Transaction Receipt</h1>
          <p className="text-primary-100 text-sm">Nexa Pay</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
            <span className="text-sm text-gray-500">Reference</span>
            <span className="font-mono text-sm">{tx.reference}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm">{new Date(tx.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
            <span className="text-sm text-gray-500">Type</span>
            <span className="font-medium">{tx.type}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
            <span className="text-sm text-gray-500">Status</span>
            <Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
            <span className="text-sm text-gray-500">From</span>
            <span className="text-sm font-medium text-right max-w-[60%] truncate" title={String(fromLabel)}>
              {fromLabel}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
            <span className="text-sm text-gray-500">To</span>
            <span className="text-sm font-medium text-right max-w-[60%] truncate" title={String(toLabel)}>
              {toLabel}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="text-xl font-bold">{formatAmount(tx.amount)}</span>
          </div>
          {tx.fee != null && tx.fee > 0 && (
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-sm text-gray-500">Fee</span>
              <span className="text-sm">{formatAmount(tx.fee)}</span>
            </div>
          )}
          {tx.failure_reason && (
            <div className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-sm text-gray-500">Failure reason</span>
              <span className="text-sm text-red-600 dark:text-red-400">{tx.failure_reason}</span>
            </div>
          )}
          <div className="pt-2">
            <span className="text-xs text-gray-400">Transaction ID</span>
            <p className="font-mono text-xs break-all mt-0.5">{tx.id}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
