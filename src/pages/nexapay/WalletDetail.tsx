import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { adminApi } from '../../services/adminApi'

interface WalletDetailData {
  id: string
  user_id: string
  currency: string
  status: string
  created_at: string
  user?: { id: string; phone_number?: string; full_name?: string } | null
  balance?: number
}

interface LedgerEntry {
  id: string
  account_id: string
  entry_type: 'DEBIT' | 'CREDIT'
  amount: number
  created_at: string
  reference?: string
  description?: string
}

export default function WalletDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<WalletDetailData | null>(null)
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [ledgerLoading, setLedgerLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchWallet(id)
      fetchLedger(id)
    }
  }, [id])

  const fetchWallet = async (walletId: string) => {
    try {
      setIsLoading(true)
      const response = await adminApi.getWallet(walletId)
      const data = response.data?.data ?? response.data
      setWallet(data ?? null)
    } catch (error) {
      console.error('Error fetching wallet:', error)
      setWallet(null)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLedger = async (walletId: string) => {
    try {
      setLedgerLoading(true)
      const response = await adminApi.getWalletLedger(walletId)
      const data = response.data?.data ?? response.data
      const raw = Array.isArray(data) ? data : data?.entries ?? data?.items ?? []
      setLedgerEntries(raw)
    } catch (error) {
      console.error('Error fetching ledger:', error)
      setLedgerEntries([])
    } finally {
      setLedgerLoading(false)
    }
  }

  const formatBalance = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet?.currency ?? 'MAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

  if (isLoading && !wallet) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/pay/wallets')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Wallets
        </button>
        <Card className="p-6 text-center text-gray-500">Wallet not found</Card>
      </div>
    )
  }

  const entriesWithBalance = (() => {
    const byDate = [...ledgerEntries].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    let balance = 0
    return byDate
      .map((e) => {
        balance += e.entry_type === 'CREDIT' ? e.amount : -e.amount
        return { ...e, balance_after: balance }
      })
      .reverse()
  })()

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate('/pay/wallets')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Wallets
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Wallet {wallet.id.substring(0, 8)}...
        </h1>
        <p className="text-sm text-gray-500 mt-1">Wallet details and ledger</p>
      </div>

      <Card className="p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Wallet ID</dt>
            <dd className="font-mono text-sm mt-1">{wallet.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">User</dt>
            <dd className="mt-1">
              {wallet.user?.full_name || wallet.user?.phone_number || 'N/A'}
              {wallet.user?.phone_number && (
                <span className="text-gray-500 text-sm block">{wallet.user.phone_number}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Balance</dt>
            <dd className="mt-1 font-semibold">{formatBalance(Number(wallet.balance ?? 0))}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={wallet.status === 'ACTIVE' ? 'success' : 'default'}>
                {wallet.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1">{new Date(wallet.created_at).toLocaleString()}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold px-4 pt-4 pb-2">Ledger entries</h2>
        <Table
          headers={['Date', 'Type', 'Amount', 'Balance after', 'Reference', 'Description']}
          isLoading={ledgerLoading}
          emptyMessage="No ledger entries"
        >
          {entriesWithBalance.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-sm">
                {new Date(entry.created_at).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge variant={entry.entry_type === 'CREDIT' ? 'success' : 'default'}>
                  {entry.entry_type}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {entry.entry_type === 'DEBIT' ? '-' : ''}
                {formatBalance(entry.amount)}
              </TableCell>
              <TableCell>{formatBalance((entry as { balance_after?: number }).balance_after ?? 0)}</TableCell>
              <TableCell className="font-mono text-xs">{entry.reference ?? '—'}</TableCell>
              <TableCell className="text-sm text-gray-600">{entry.description ?? '—'}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
