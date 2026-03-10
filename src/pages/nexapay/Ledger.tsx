import { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

interface LedgerEntry {
  id: string
  account_id: string
  entry_type: 'DEBIT' | 'CREDIT'
  amount: number
  created_at: string
  reference?: string
  description?: string
}

/** User with wallet_id and balance from /admin/users (balance is ledger-derived) */
interface UserWithWallet {
  id: string
  phone_number: string
  full_name: string | null
  wallet_id: string | null
  balance: number
}

export default function NexaPayLedger() {
  const [users, setUsers] = useState<UserWithWallet[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedWallet) {
      fetchLedger(selectedWallet)
    }
  }, [selectedWallet])

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getUsers({})
      const raw = response.data?.data ?? response.data
      const list = Array.isArray(raw) ? raw : raw?.users ?? raw?.items ?? []
      setUsers(list.filter((u: UserWithWallet) => u.wallet_id != null))
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    }
  }

  const fetchLedger = async (walletId: string) => {
    try {
      setIsLoading(true)
      const response = await adminApi.getWalletLedger(walletId)
      const data = response.data?.data || response.data
      const raw = Array.isArray(data) ? data : data?.entries || data?.items || []
      setLedgerEntries(raw)
    } catch (error) {
      console.error('Error fetching ledger:', error)
      setLedgerEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  // Compute running balance (oldest first) then reverse for newest-first display
  const entriesWithBalance = (() => {
    const byDate = [...ledgerEntries].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    let balance = 0
    const withBal = byDate.map((e) => {
      balance += e.entry_type === 'CREDIT' ? e.amount : -e.amount
      return { ...e, balance_after: balance }
    })
    return withBal.reverse()
  })()

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nexa Pay Ledger</h1>
        <p className="text-sm text-gray-500 mt-1">View wallet ledger entries and transaction history</p>
      </div>

      <Card>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Wallet
          </label>
          <select
            value={selectedWallet || ''}
            onChange={(e) => setSelectedWallet(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">-- Select a wallet --</option>
            {users.map((u) => (
              <option key={u.wallet_id!} value={u.wallet_id!}>
                {u.full_name || u.phone_number} — {formatAmount(u.balance)}
              </option>
            ))}
          </select>
        </div>

        {selectedWallet && (
          <Table
            headers={['Date', 'Type', 'Amount', 'Balance After', 'Description', 'Reference']}
            isLoading={isLoading}
            emptyMessage="No ledger entries found"
          >
            {entriesWithBalance.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={entry.entry_type === 'CREDIT' ? 'success' : 'danger'}>
                    {entry.entry_type}
                  </Badge>
                </TableCell>
                <TableCell className={`font-semibold ${entry.entry_type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.entry_type === 'CREDIT' ? '+' : '-'}{formatAmount(entry.amount)}
                </TableCell>
                <TableCell className="font-medium">{formatAmount((entry as any).balance_after ?? 0)}</TableCell>
                <TableCell className="text-sm text-gray-600">{entry.description || 'N/A'}</TableCell>
                <TableCell className="font-mono text-xs">{entry.reference || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}

        {!selectedWallet && (
          <div className="text-center py-12 text-gray-500">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Select a wallet to view its ledger entries</p>
          </div>
        )}
      </Card>
    </div>
  )
}
