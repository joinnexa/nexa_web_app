import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, ImageIcon, RefreshCw, Bug } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'
import { api } from '../../services/api'
import { endpoints } from '../../services/endpoints'

const IS_DEV = import.meta.env.DEV

interface KycCase {
  id: string
  user_id?: string
  userId?: string
  user_phone: string
  user_name: string | null
  is_host?: boolean
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'VERIFIED'
  level: string
  provider: string | null
  submitted_at: string
  documents: {
    id_document?: boolean
    selfie?: boolean
    liveness?: boolean
  }
  kycProfile?: {
    document_file_url_front?: string
    document_file_url_back?: string
    selfie_file_url?: string
    full_name?: string
    email?: string
    date_of_birth?: string
    nationality?: string
    national_id_number?: string
    national_id_number_extracted?: string
  }
}

function filenameFromFileUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const segment = url.split('/').filter(Boolean).pop()
  return segment ?? null
}

export default function KycQueue() {
  const [cases, setCases] = useState<KycCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [staysRoleFilter, setStaysRoleFilter] = useState<'all' | 'USER' | 'HOST'>('all')
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null)
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null)
  const [imageModal, setImageModal] = useState<{ url: string; title: string } | null>(null)
  const [imageLoading, setImageLoading] = useState(false)

  useEffect(() => {
    fetchKycCases()
  }, [staysRoleFilter])

  useEffect(() => {
    return () => {
      if (imageModal?.url) URL.revokeObjectURL(imageModal.url)
    }
  }, [imageModal?.url])

  const fetchKycCases = async (cacheBust = false) => {
    try {
      const params: Record<string, string> = {
        source: 'STAYS',
        page: '1',
        limit: '100',
        status: 'all',
      }
      if (staysRoleFilter !== 'all') params.stays_role = staysRoleFilter
      if (cacheBust) params._t = String(Date.now())
      const response = await adminApi.getKycQueue(params)
      const raw = response.data?.data ?? response.data
      setCases(Array.isArray(raw) ? raw : [])
    } catch (error) {
      console.error('Error fetching KYC cases:', error)
      setCases([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    if (!userId || approvingUserId) return
    setApprovingUserId(userId)
    try {
      await adminApi.approveKyc(userId)
      setCases((prev) => prev.filter((c) => (c.user_id ?? c.userId) !== userId))
    } catch (error: unknown) {
      console.error('Error approving KYC:', error)
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string }; status?: number } }).response?.data?.message ??
            `Failed (${(error as { response?: { status?: number } }).response?.status ?? 'error'})`
          : 'Failed to approve KYC'
      alert(msg)
      fetchKycCases()
    } finally {
      setApprovingUserId(null)
    }
  }

  const handleReject = async (userId: string) => {
    if (!userId || rejectingUserId) return
    const reason = prompt('Please provide a rejection reason:') || 'No reason provided'
    if (!reason) return
    setRejectingUserId(userId)
    try {
      await adminApi.rejectKyc(userId, reason)
      setCases((prev) => prev.filter((c) => (c.user_id ?? c.userId) !== userId))
    } catch (error: unknown) {
      console.error('Error rejecting KYC:', error)
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string }; status?: number } }).response?.data?.message ??
            `Failed (${(error as { response?: { status?: number } }).response?.status ?? 'error'})`
          : 'Failed to reject KYC'
      alert(msg)
      fetchKycCases()
    } finally {
      setRejectingUserId(null)
    }
  }

  const viewKycImage = useCallback(
    async (userId: string, fileUrl: string | null | undefined, title: string) => {
      const filename = filenameFromFileUrl(fileUrl)
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
        alert('Failed to load image. It may have been deleted or you may not have access.')
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

  const getStatus = (c: KycCase) => c.status ?? (c as { kycProfile?: { status?: string } }).kycProfile?.status ?? 'PENDING'
  const statusMatches = (s: string, f: typeof filter) =>
    f === 'all' ? true : f === 'APPROVED' ? (s === 'APPROVED' || s === 'VERIFIED') : s === f
  const filteredCases = filter === 'all' ? cases : cases.filter((c) => statusMatches(getStatus(c), filter))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">KYC Review</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Identity verification for Nexa Stays users
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsLoading(true)
            fetchKycCases(true)
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 space-y-2">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User type</div>
        <nav className="flex flex-wrap gap-2">
          {(['all', 'USER', 'HOST'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setStaysRoleFilter(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                staysRoleFilter === t
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t === 'all' ? 'All' : t === 'USER' ? 'User' : 'Host'}
            </button>
          ))}
        </nav>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                filter === status
                  ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
              {status !== 'all' && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-600">
                  {cases.filter((c) => statusMatches(getStatus(c), status)).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <Card>
        <Table
          headers={['User', 'Documents', 'Status', 'Submitted', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No KYC applications from Nexa Stays"
        >
          {filteredCases.map((app) => {
            const appUserId = app.user_id ?? app.userId ?? ''
            const profile = app.kycProfile
            const status = getStatus(app)
            return (
              <TableRow key={app.id}>
                <TableCell className="whitespace-normal">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{profile?.full_name || app.user_name || 'N/A'}</span>
                      {app.is_host !== undefined && (
                        <Badge variant="default" className="text-xs">
                          {app.is_host ? 'Host' : 'User'}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{app.user_phone || 'N/A'}</div>
                    {profile?.email && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{profile.email}</div>
                    )}
                    {(profile?.date_of_birth || profile?.nationality || profile?.national_id_number) && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-2">
                        {profile?.date_of_birth && <span>DOB: {profile.date_of_birth}</span>}
                        {profile?.nationality && (
                          <span>{profile.nationality === 'MA' ? 'Moroccan' : profile.nationality}</span>
                        )}
                        {profile?.national_id_number && (
                          <span className="font-mono">ID: {profile.national_id_number}</span>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="text-xs space-y-1">
                    <div className={app.documents?.id_document ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                      ID: {app.documents?.id_document ? '✓' : '✗'}
                    </div>
                    <div className={app.documents?.selfie ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                      Selfie: {app.documents?.selfie ? '✓' : '✗'}
                    </div>
                  </div>
                  {appUserId && profile && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.document_file_url_front && (
                        <button
                          type="button"
                          onClick={() => viewKycImage(appUserId, profile.document_file_url_front, 'ID (front)')}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="View ID front"
                        >
                          <ImageIcon className="h-3 w-3" />
                          ID front
                        </button>
                      )}
                      {profile.document_file_url_back && (
                        <button
                          type="button"
                          onClick={() => viewKycImage(appUserId, profile.document_file_url_back, 'ID (back)')}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="View ID back"
                        >
                          <ImageIcon className="h-3 w-3" />
                          ID back
                        </button>
                      )}
                      {profile.selfie_file_url && (
                        <button
                          type="button"
                          onClick={() => viewKycImage(appUserId, profile.selfie_file_url, 'Selfie')}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="View selfie"
                        >
                          <ImageIcon className="h-3 w-3" />
                          Selfie
                        </button>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      status === 'PENDING'
                        ? 'warning'
                        : status === 'APPROVED' || status === 'VERIFIED'
                          ? 'success'
                          : 'danger'
                    }
                  >
                    {status === 'VERIFIED' ? 'APPROVED' : status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => appUserId && handleApprove(appUserId)}
                      className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Approve"
                      disabled={!appUserId || approvingUserId === appUserId || status !== 'PENDING'}
                    >
                      {approvingUserId === appUserId ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => appUserId && handleReject(appUserId)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Reject"
                      disabled={!appUserId || rejectingUserId === appUserId || status !== 'PENDING'}
                    >
                      {rejectingUserId === appUserId ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </Table>
      </Card>

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

      {IS_DEV && (
        <details className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-3 text-xs">
          <summary className="cursor-pointer flex items-center gap-2 font-medium text-amber-800 dark:text-amber-200">
            <Bug className="h-4 w-4" />
            Debug (dev only)
          </summary>
          <dl className="mt-2 space-y-1 font-mono text-slate-600 dark:text-slate-400">
            <div>
              <dt className="text-amber-700 dark:text-amber-300">API_BASE_URL</dt>
              <dd className="break-all">
                {api.defaults.baseURL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000/api/v1'}
              </dd>
            </div>
            <div>
              <dt className="text-amber-700 dark:text-amber-300">Admin token</dt>
              <dd>
                {typeof window !== 'undefined' && localStorage.getItem('admin_access_token') ? 'present' : 'missing'}
              </dd>
            </div>
          </dl>
        </details>
      )}
    </div>
  )
}
