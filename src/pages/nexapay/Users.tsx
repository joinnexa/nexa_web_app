import { useEffect, useState } from 'react'
import { Search, Eye, Lock, Unlock } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  phone_number: string
  full_name: string | null
  email: string | null
  account_type?: string
  linked_user_id?: string | null
  kyc_status: string
  account_status: string
  created_at: string
  last_login_at: string | null
}

export default function NexaPayUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterKyc, setFilterKyc] = useState<string>('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [filterStatus, filterKyc])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const params: Record<string, string> = {}
      if (filterStatus !== 'all') params.status = filterStatus
      if (filterKyc !== 'all') params.kyc = filterKyc
      if (searchTerm) params.search = searchTerm
      params.account_type = 'CONSUMER'

      const response = await adminApi.getUsers(params)
      const raw = response.data?.data ?? response.data
      const list = Array.isArray(raw) ? raw : raw?.users ?? raw?.items ?? []
      setUsers(list)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Auth error handled by interceptor
      }
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    fetchUsers()
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      ACTIVE: 'success',
      INACTIVE: 'default',
      SUSPENDED: 'warning',
      FROZEN: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getKycBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      APPROVED: 'success',
      VERIFIED: 'success',
      PENDING: 'warning',
      REJECTED: 'danger',
      UNVERIFIED: 'default',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const handleFreeze = async (userId: string) => {
    if (!confirm('Are you sure you want to freeze this user?')) return
    try {
      await adminApi.freezeUser(userId)
      fetchUsers()
    } catch (error) {
      console.error('Error freezing user:', error)
      alert('Failed to freeze user')
    }
  }

  const handleUnfreeze = async (userId: string) => {
    if (!confirm('Are you sure you want to unfreeze this user?')) return
    try {
      await adminApi.unfreezeUser(userId)
      fetchUsers()
    } catch (error) {
      console.error('Error unfreezing user:', error)
      alert('Failed to unfreeze user')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nexa Pay Users</h1>
        <p className="text-sm text-gray-500 mt-1">Consumer wallets only</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by phone, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="FROZEN">Frozen</option>
          </select>
          <select
            value={filterKyc}
            onChange={(e) => setFilterKyc(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All KYC</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Search
          </button>
        </div>

        <Table
          headers={['User', 'Phone', 'KYC Status', 'Account Status', 'Last Login', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No users found"
        >
          {users.map((user) => (
            <TableRow
              key={user.id}
              onClick={() => navigate(`/pay/users/${user.id}`)}
            >
              <TableCell>
                <div>
                  <div className="font-medium">{user.full_name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{user.email || 'No email'}</div>
                </div>
              </TableCell>
              <TableCell>{user.phone_number}</TableCell>
              <TableCell>{getKycBadge(user.kyc_status)}</TableCell>
              <TableCell>{getStatusBadge(user.account_status)}</TableCell>
              <TableCell>
                {user.last_login_at
                  ? new Date(user.last_login_at).toLocaleDateString()
                  : 'Never'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/pay/users/${user.id}`)
                    }}
                    className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {user.account_status === 'FROZEN' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnfreeze(user.id)
                      }}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Unfreeze"
                    >
                      <Unlock className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFreeze(user.id)
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Freeze"
                    >
                      <Lock className="h-4 w-4" />
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
