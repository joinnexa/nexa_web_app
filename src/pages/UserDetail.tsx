import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Wallet } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { adminApi } from '../services/adminApi'

interface UserData {
  id: string
  phone_number: string
  full_name: string | null
  email: string | null
  account_type?: string
  kyc_status: string
  account_status: string
  wallet_id: string | null
  balance: number
  created_at: string
  last_login_at: string | null
}

function isValidUserId(id: string | undefined): id is string {
  return typeof id === 'string' && id.length > 0 && id !== 'undefined'
}

function getBackRoute(accountType?: string) {
  if (accountType === 'DRIVER') return { path: '/drivers', label: 'Drivers' }
  if (accountType === 'COURIER') return { path: '/couriers', label: 'Couriers' }
  if (accountType === 'MERCHANT') return { path: '/merchants', label: 'Merchants' }
  return { path: '/', label: 'Overview' }
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isValidUserId(id)) {
      setError('Invalid user')
      setIsLoading(false)
      return
    }
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    if (!isValidUserId(id)) return
    try {
      setIsLoading(true)
      setError(null)
      const response = await adminApi.getUser(id)
      const data = response.data?.data ?? response.data
      setUser(data)
    } catch (err: any) {
      console.error('Error fetching user:', err)
      setError(err.response?.status === 404 ? 'User not found' : 'Failed to load user')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 }).format(amount)

  if (!isValidUserId(id)) {
    return (
      <div className="p-6">
        <Link to="/" className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Overview
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300 font-medium">Invalid user.</p>
        </div>
      </div>
    )
  }

  if (isLoading && !user) {
    return (
      <div className="p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse mb-6" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    )
  }

  if (error || !user) {
    const back = getBackRoute()
    return (
      <div className="p-6">
        <Link
          to={back.path}
          className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {back.label}
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300 font-medium">{error ?? 'User not found'}</p>
        </div>
      </div>
    )
  }

  const back = getBackRoute(user.account_type)

  return (
    <div className="p-6 space-y-6">
      <Link
        to={back.path}
        className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {back.label}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="User">
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="font-medium">{user.full_name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Phone</dt>
              <dd className="font-mono">{user.phone_number}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
              <dd>{user.email ?? '—'}</dd>
            </div>
            {user.account_type && (
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Account type</dt>
                <dd><Badge variant="default">{user.account_type}</Badge></dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">KYC Status</dt>
              <dd>
                <Badge
                  variant={
                    user.kyc_status === 'APPROVED' || user.kyc_status === 'VERIFIED'
                      ? 'success'
                      : user.kyc_status === 'PENDING'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {user.kyc_status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Account Status</dt>
              <dd>
                <Badge variant={user.account_status === 'ACTIVE' ? 'success' : user.account_status === 'FROZEN' ? 'danger' : 'default'}>
                  {user.account_status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Last Login</dt>
              <dd>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Wallet">
          <div className="flex items-center gap-3">
            <Wallet className="h-10 w-10 text-emerald-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
              <p className="text-2xl font-bold">{formatAmount(user.balance)}</p>
              {user.wallet_id && (
                <p className="text-xs text-gray-400 font-mono mt-1">Wallet {user.wallet_id.slice(0, 8)}...</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
