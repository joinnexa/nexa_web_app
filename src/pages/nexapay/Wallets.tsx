import { useEffect, useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'
import { useNavigate } from 'react-router-dom'

interface WalletData {
  id: string
  user_id: string
  user_name?: string
  user_phone?: string
  user?: { id: string; phone_number?: string; full_name?: string } | null
  balance: number
  currency?: string
  status: string
  created_at: string
}

export default function NexaPayWallets() {
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchWallets()
  }, [])

  const fetchWallets = async () => {
    try {
      setIsLoading(true)
      const params: Record<string, string> = {}
      if (searchTerm) params.search = searchTerm

      const response = await adminApi.getWallets(params)
      const data = response.data?.data || response.data
      setWallets(Array.isArray(data) ? data : data?.wallets || data?.items || [])
    } catch (error: any) {
      console.error('Error fetching wallets:', error)
      setWallets([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatBalance = (amount: number) => {
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
        <h1 className="text-2xl font-bold text-gray-900">Nexa Pay Wallets</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage wallet balances</p>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by user phone or wallet ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWallets()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={fetchWallets}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Search
          </button>
        </div>

        <Table
          headers={['Wallet ID', 'User', 'Balance', 'Status', 'Created', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No wallets found"
        >
          {wallets.map((wallet) => (
            <TableRow
              key={wallet.id}
              onClick={() => navigate(`/pay/wallets/${wallet.id}`)}
            >
              <TableCell className="font-mono text-xs">{wallet.id.substring(0, 8)}...</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {wallet.user?.full_name || wallet.user_name || wallet.user?.phone_number || wallet.user_phone || 'N/A'}
                  </div>
                  {(wallet.user?.full_name || wallet.user_name) && (wallet.user?.phone_number || wallet.user_phone) && (
                    <div className="text-xs text-gray-500">
                      {wallet.user?.phone_number || wallet.user_phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-semibold">{formatBalance(wallet.balance)}</TableCell>
              <TableCell>
                <Badge variant={wallet.status === 'ACTIVE' ? 'success' : 'default'}>
                  {wallet.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(wallet.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/pay/wallets/${wallet.id}`)
                  }}
                  className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                  title="View Ledger"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
