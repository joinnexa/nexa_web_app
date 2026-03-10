import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Wallet, ImageIcon, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { PermissionGuard } from '../../components/PermissionGuard'
import { Permission } from '../../types/roles'
import { Badge } from '../../components/ui/Badge'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { adminApi } from '../../services/adminApi'

interface UserData {
  id: string
  phone_number: string
  full_name: string | null
  email: string | null
  date_of_birth?: string | null
  nationality?: string | null
  account_type?: string
  linked_user_id?: string | null
  linked_user?: { id: string; full_name: string | null; phone_number: string } | null
  kyc_status: string
  account_status: string
  wallet_id: string | null
  balance: number
  risk_score: number
  created_at: string
  last_login_at: string | null
}

interface Tx {
  id: string
  type: string
  amount: number
  status: string
  sender_phone?: string
  receiver_phone?: string
  created_at: string
}

interface KycProfileData {
  document_front_url?: string | null
  document_back_url?: string | null
  selfie_url?: string | null
  status?: string
  full_name?: string | null
  email?: string | null
  date_of_birth?: string | null
  nationality?: string | null
  national_id_number?: string | null
  national_id_number_extracted?: string | null
  document_type?: string | null
  document_country?: string | null
}

/** Extract filename from relative path like "userId/document_front.jpg" */
function filenameFromPath(path: string | null | undefined): string | null {
  if (!path || typeof path !== 'string') return null
  return path.split('/').filter(Boolean).pop() ?? null
}

function isValidUserId(id: string | undefined): id is string {
  return typeof id === 'string' && id.length > 0 && id !== 'undefined'
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserData | null>(null)
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [kycProfile, setKycProfile] = useState<KycProfileData | null>(null)
  const [imageModal, setImageModal] = useState<{ url: string; title: string } | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [kycActionLoading, setKycActionLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isValidUserId(id)) {
      setError('Invalid user')
      setIsLoading(false)
      return
    }
    fetchUser()
    fetchTransactions()
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

  const fetchTransactions = async () => {
    if (!isValidUserId(id)) return
    try {
      const response = await adminApi.getTransactions({ userId: id, page: 1, limit: 20 })
      const data = response.data?.data ?? response.data
      const list = Array.isArray(data) ? data : data?.transactions ?? data?.items ?? []
      setTransactions(list)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setTransactions([])
    }
  }

  const fetchKyc = useCallback(async () => {
    if (!isValidUserId(id)) return
    try {
      const response = await adminApi.getUserKyc(id)
      const data = response.data?.data ?? response.data
      setKycProfile(data)
    } catch {
      setKycProfile(null)
    }
  }, [id])

  useEffect(() => {
    if (user?.id && isValidUserId(id)) fetchKyc()
  }, [user?.id, id, fetchKyc])

  const viewKycImage = useCallback(
    async (userId: string, relativePath: string | null | undefined, title: string) => {
      const filename = filenameFromPath(relativePath)
      if (!filename || !userId) return
      setImageLoading(true)
      setImageModal(null)
      try {
        const res = await adminApi.getKycFile(userId, filename)
        const blob = res.data as Blob
        const url = URL.createObjectURL(blob)
        setImageModal({ url, title })
      } catch (err) {
        console.error('Failed to load KYC image:', err)
        alert('Failed to load image.')
      } finally {
        setImageLoading(false)
      }
    },
    []
  )

  const closeImageModal = useCallback(() => {
    setImageModal((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
  }, [])

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)

  const getStatusBadge = (s: string) => {
    const v: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      COMPLETED: 'success',
      PENDING: 'warning',
      FAILED: 'danger',
      REVERSED: 'default',
    }
    return <Badge variant={v[s] ?? 'default'}>{s}</Badge>
  }

  if (!isValidUserId(id)) {
    return (
      <div className="p-6">
        <Link
          to="/pay/users"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Invalid user. Please select a user from the list.</p>
        </div>
      </div>
    )
  }

  if (isLoading && !user) {
    return (
      <div className="p-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-6" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <Link
          to="/pay/users"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error ?? 'User not found'}</p>
        </div>
      </div>
    )
  }

  const backRoute = '/pay/users'
  const backLabel = 'Users'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={backRoute}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {backLabel}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="User">
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="font-medium">{user.full_name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="font-mono">{user.phone_number}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd>{user.email ?? '—'}</dd>
            </div>
            {user.account_type && (
              <div>
                <dt className="text-sm text-gray-500">Account type</dt>
                <dd><Badge variant="default">{user.account_type}</Badge></dd>
              </div>
            )}
            {user.linked_user && (
              <div>
                <dt className="text-sm text-gray-500">Linked consumer</dt>
                <dd className="text-sm">
                  {user.linked_user.full_name ?? user.linked_user.phone_number}{' '}
                  <span className="text-gray-500 font-mono">({user.linked_user.phone_number})</span>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-500">KYC Status</dt>
              <dd>
                <Badge variant={user.kyc_status === 'APPROVED' || user.kyc_status === 'VERIFIED' ? 'success' : user.kyc_status === 'PENDING' ? 'warning' : 'default'}>
                  {user.kyc_status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Account Status</dt>
              <dd>
                <Badge variant={user.account_status === 'ACTIVE' ? 'success' : user.account_status === 'FROZEN' ? 'danger' : 'default'}>
                  {user.account_status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Risk Score</dt>
              <dd>{user.risk_score ?? 0}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Last Login</dt>
              <dd>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Wallet">
          <div className="flex items-center gap-3">
            <Wallet className="h-10 w-10 text-primary-500" />
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-2xl font-bold">{formatAmount(user.balance)}</p>
              {user.wallet_id && (
                <p className="text-xs text-gray-400 font-mono mt-1">Wallet {user.wallet_id.slice(0, 8)}...</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {kycProfile && (
        <Card title="KYC Documents" subtitle={kycProfile.status ? `Status: ${kycProfile.status}` : undefined}>
          <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">KYC / Profile Info</h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Full name</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {kycProfile.full_name || user.full_name || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {kycProfile.email || user.email || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Date of birth</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {kycProfile.date_of_birth || user.date_of_birth || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Nationality</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {(kycProfile.nationality || user.nationality) === 'MA' ? 'Moroccan' : (kycProfile.nationality || user.nationality) || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">ID card number (manual/form)</dt>
                <dd className="font-mono text-gray-900 dark:text-gray-100">
                  {kycProfile.national_id_number || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">ID card number (extracted from document)</dt>
                <dd className="font-mono text-gray-900 dark:text-gray-100">
                  {kycProfile.national_id_number_extracted || '—'}
                </dd>
              </div>
              {(kycProfile.document_type || kycProfile.document_country) && (
                <>
                  {kycProfile.document_type && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Document type</dt>
                      <dd className="text-gray-900 dark:text-gray-100">{kycProfile.document_type}</dd>
                    </div>
                  )}
                  {kycProfile.document_country && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Document country</dt>
                      <dd className="text-gray-900 dark:text-gray-100">{kycProfile.document_country}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
            <p className="text-xs text-gray-500 mt-2">
              All data from the KYC form is stored and synced. Compare manual ID (user input) vs extracted ID (OCR from document).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {kycProfile.document_front_url && (
              <button
                type="button"
                onClick={() => viewKycImage(user.id, kycProfile!.document_front_url, 'ID (front)')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                <ImageIcon className="h-4 w-4" />
                View ID front
              </button>
            )}
            {kycProfile.document_back_url && (
              <button
                type="button"
                onClick={() => viewKycImage(user.id, kycProfile!.document_back_url, 'ID (back)')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                <ImageIcon className="h-4 w-4" />
                View ID back
              </button>
            )}
            {kycProfile.selfie_url && (
              <button
                type="button"
                onClick={() => viewKycImage(user.id, kycProfile!.selfie_url, 'Selfie')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                <ImageIcon className="h-4 w-4" />
                View selfie
              </button>
            )}
            {!kycProfile.document_front_url && !kycProfile.document_back_url && !kycProfile.selfie_url && (
              <p className="text-sm text-gray-500">No documents uploaded yet.</p>
            )}
            {user.kyc_status === 'PENDING' && (
              <PermissionGuard permission={Permission.APPROVE_KYC}>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    disabled={kycActionLoading}
                    onClick={async () => {
                      setKycActionLoading(true)
                      try {
                        await adminApi.approveKyc(user.id)
                        fetchUser()
                        fetchKyc()
                      } catch (err) {
                        console.error('Failed to approve KYC:', err)
                        alert('Failed to approve KYC')
                      } finally {
                        setKycActionLoading(false)
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve KYC
                  </button>
                  <button
                    type="button"
                    disabled={kycActionLoading}
                    onClick={async () => {
                      const reason = prompt('Rejection reason:') || 'No reason provided'
                      if (!reason) return
                      setKycActionLoading(true)
                      try {
                        await adminApi.rejectKyc(user.id, reason)
                        fetchUser()
                        fetchKyc()
                      } catch (err) {
                        console.error('Failed to reject KYC:', err)
                        alert('Failed to reject KYC')
                      } finally {
                        setKycActionLoading(false)
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject KYC
                  </button>
                </div>
              </PermissionGuard>
            )}
          </div>
        </Card>
      )}

      {imageLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg px-6 py-4 shadow-xl">
            <p className="text-gray-700 dark:text-gray-200">Loading image...</p>
          </div>
        </div>
      )}

      {imageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeImageModal}
          role="dialog"
          aria-modal="true"
          aria-label="View KYC document"
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{imageModal.title}</h3>
              <button
                type="button"
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-4rem)] flex justify-center">
              <img
                src={imageModal.url}
                alt={imageModal.title}
                className="max-w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      <Card title="Recent Transactions" subtitle="Last 20">
        <Table
          headers={['ID', 'Type', 'Amount', 'Parties', 'Status', 'Date']}
          isLoading={false}
          emptyMessage="No transactions"
        >
          {transactions.map((tx) => (
            <TableRow
              key={tx.id}
              onClick={() => navigate(`/pay/transactions`)}
              className="cursor-pointer"
            >
              <TableCell className="font-mono text-xs">{tx.id.slice(0, 8)}...</TableCell>
              <TableCell>{tx.type}</TableCell>
              <TableCell className="font-semibold">{formatAmount(tx.amount)}</TableCell>
              <TableCell className="text-xs">
                {tx.sender_phone && <div>From: {tx.sender_phone}</div>}
                {tx.receiver_phone && <div>To: {tx.receiver_phone}</div>}
              </TableCell>
              <TableCell>{getStatusBadge(tx.status)}</TableCell>
              <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
