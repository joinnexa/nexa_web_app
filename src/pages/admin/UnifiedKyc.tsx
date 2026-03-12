import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, FileText, Eye, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { PermissionGuard } from '../../components/PermissionGuard'
import { Permission } from '../../types/roles'
import { adminApi } from '../../services/adminApi'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

interface KycProfileInfo {
  full_name?: string | null
  email?: string | null
  date_of_birth?: string | null
  nationality?: string | null
  national_id_number?: string | null
  national_id_number_extracted?: string | null
  document_type?: string | null
  document_country?: string | null
  document_file_url_front?: string | null
  document_file_url_back?: string | null
  selfie_file_url?: string | null
}

interface KycCase {
  id: string
  user_id: string
  user_phone: string | null
  user_name: string | null
  status: string
  level: string
  provider: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
  documents: { id_document?: boolean; selfie?: boolean; liveness?: boolean }
  aml_screening?: { status: string; score: number }
  source?: string | null
  account_type?: string | null
  kycProfile?: KycProfileInfo
}

function filenameFromFileUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const path = url.split('?')[0]
  const segment = path.split('/').filter(Boolean).pop()
  return segment || null
}

type StatusFilter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED'
type SourceFilter = 'ALL' | 'PAY' | 'GO' | 'STAYS'

const SOURCE_LABELS: Record<SourceFilter, string> = {
  ALL: 'All Services',
  PAY: 'Nexa Pay',
  GO: 'Nexa Go',
  STAYS: 'Nexa Stay',
}

export default function UnifiedKyc() {
  const [cases, setCases] = useState<KycCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('ALL')
  const [detailCase, setDetailCase] = useState<KycCase | null>(null)
  const [imageModal, setImageModal] = useState<{ url: string; title: string } | null>(null)
  const [imageLoading, setImageLoading] = useState(false)

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

  useEffect(() => {
    return () => {
      if (imageModal?.url) URL.revokeObjectURL(imageModal.url)
    }
  }, [imageModal?.url])

  const fetchCases = useCallback(async () => {
    try {
      setIsLoading(true)
      const params: Record<string, string> = {
        source: sourceFilter,
        status: statusFilter === 'all' ? 'all' : statusFilter,
        page: '1',
        limit: '100',
      }
      const res = await adminApi.getKycQueue(params)
      const data = res.data?.data ?? res.data
      setCases(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching KYC cases:', error)
      setCases([])
    } finally {
      setIsLoading(false)
    }
  }, [sourceFilter, statusFilter])

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const handleApprove = async (c: KycCase) => {
    setApprovingId(c.user_id)
    try {
      const product = (c.source || 'PAY') as 'PAY' | 'GO' | 'STAYS'
      await adminApi.approveKyc(c.user_id, product)
      setDetailCase(null)
      await fetchCases()
    } catch (error) {
      console.error('Error approving KYC:', error)
      alert('Failed to approve KYC case')
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (c: KycCase) => {
    const reason = prompt('Rejection reason:') || 'No reason provided'
    if (!reason.trim()) return
    setRejectingId(c.user_id)
    try {
      const product = (c.source || 'PAY') as 'PAY' | 'GO' | 'STAYS'
      await adminApi.rejectKyc(c.user_id, reason, product)
      setDetailCase(null)
      await fetchCases()
    } catch (error) {
      console.error('Error rejecting KYC:', error)
      alert('Failed to reject KYC case')
    } finally {
      setRejectingId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'VERIFIED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const statusMatches = (s: string, f: StatusFilter) =>
    f === 'all' ? true : f === 'APPROVED' ? (s === 'APPROVED' || s === 'VERIFIED') : s === f

  const filteredCases =
    statusFilter === 'all'
      ? cases
      : cases.filter((c) => statusMatches(c.status ?? 'PENDING', statusFilter))

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Unified KYC</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Identity verification across all Nexa services — one queue, one source of truth
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Status</p>
            <nav className="flex flex-wrap gap-2">
              {(['PENDING', 'APPROVED', 'REJECTED', 'all'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    statusFilter === s
                      ? 'bg-primary-600 text-white dark:bg-primary-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Service Source</p>
            <nav className="flex flex-wrap gap-2">
              {(['ALL', 'PAY', 'GO', 'STAYS'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSourceFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    sourceFilter === s
                      ? 'bg-violet-600 text-white dark:bg-violet-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {SOURCE_LABELS[s]}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </Card>

      {/* KYC Queue */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : filteredCases.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No KYC applications found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCases.map((c) => (
              <li key={c.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(c.status)}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {c.user_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {c.user_phone ?? '—'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="info" className="text-xs">
                          {c.source || 'PAY'}
                        </Badge>
                        {c.account_type && (
                          <Badge variant="default" className="text-xs">
                            {c.account_type}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Submitted: {format(new Date(c.submitted_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div>Level: {c.level}</div>
                      {c.aml_screening && (
                        <div className="text-gray-500 dark:text-gray-400">
                          AML: {c.aml_screening.status} (Score: {c.aml_screening.score})
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailCase(c)}
                        className="btn btn-secondary text-sm inline-flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      {c.status === 'PENDING' && (
                        <PermissionGuard permission={Permission.APPROVE_KYC}>
                          <>
                            <button
                              onClick={() => handleApprove(c)}
                              disabled={approvingId === c.user_id || rejectingId === c.user_id}
                              className="btn btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {approvingId === c.user_id ? (
                                <span className="inline-flex items-center gap-1">
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  Approving…
                                </span>
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(c)}
                              disabled={approvingId === c.user_id || rejectingId === c.user_id}
                              className="btn btn-secondary text-sm border-red-200 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {rejectingId === c.user_id ? (
                                <span className="inline-flex items-center gap-1">
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  Rejecting…
                                </span>
                              ) : (
                                'Reject'
                              )}
                            </button>
                          </>
                        </PermissionGuard>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Detail modal: user info + documents */}
      {detailCase && (
        <Modal
          open={!!detailCase}
          onClose={() => setDetailCase(null)}
          title={`KYC: ${detailCase.user_name || 'Unknown'}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Phone</span>
                <p className="font-medium">{detailCase.user_phone ?? '—'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Source</span>
                <p className="font-medium">{detailCase.source || 'PAY'}</p>
              </div>
              {(detailCase.kycProfile?.full_name ?? detailCase.user_name) && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Full name</span>
                  <p className="font-medium">{detailCase.kycProfile?.full_name ?? detailCase.user_name}</p>
                </div>
              )}
              {detailCase.kycProfile?.email && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Email</span>
                  <p className="font-medium">{detailCase.kycProfile.email}</p>
                </div>
              )}
              {detailCase.kycProfile?.date_of_birth && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Date of birth</span>
                  <p className="font-medium">{detailCase.kycProfile.date_of_birth}</p>
                </div>
              )}
              {detailCase.kycProfile?.nationality && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Nationality</span>
                  <p className="font-medium">{detailCase.kycProfile.nationality === 'MA' ? 'Moroccan' : detailCase.kycProfile.nationality}</p>
                </div>
              )}
              {detailCase.kycProfile?.national_id_number && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">ID (form)</span>
                  <p className="font-mono text-xs">{detailCase.kycProfile.national_id_number}</p>
                </div>
              )}
              {detailCase.kycProfile?.national_id_number_extracted && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">ID (extracted)</span>
                  <p className="font-mono text-xs">{detailCase.kycProfile.national_id_number_extracted}</p>
                </div>
              )}
              {(detailCase.kycProfile?.document_type || detailCase.kycProfile?.document_country) && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Document</span>
                  <p className="font-medium">
                    {[detailCase.kycProfile.document_type, detailCase.kycProfile.document_country].filter(Boolean).join(' / ') || '—'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Documents</p>
              <div className="flex flex-wrap gap-2">
                {detailCase.kycProfile?.document_file_url_front && (
                  <button
                    type="button"
                    onClick={() =>
                      viewKycImage(
                        detailCase.user_id,
                        detailCase.kycProfile!.document_file_url_front,
                        'ID (front)'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                  >
                    <ImageIcon className="h-4 w-4" />
                    ID front
                  </button>
                )}
                {detailCase.kycProfile?.document_file_url_back && (
                  <button
                    type="button"
                    onClick={() =>
                      viewKycImage(
                        detailCase.user_id,
                        detailCase.kycProfile!.document_file_url_back,
                        'ID (back)'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                  >
                    <ImageIcon className="h-4 w-4" />
                    ID back
                  </button>
                )}
                {detailCase.kycProfile?.selfie_file_url && (
                  <button
                    type="button"
                    onClick={() =>
                      viewKycImage(
                        detailCase.user_id,
                        detailCase.kycProfile!.selfie_file_url,
                        'Selfie'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Selfie
                  </button>
                )}
                {!detailCase.kycProfile?.document_file_url_front &&
                  !detailCase.kycProfile?.document_file_url_back &&
                  !detailCase.kycProfile?.selfie_file_url && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No documents available</p>
                  )}
              </div>
            </div>

            {detailCase.status === 'PENDING' && (
              <PermissionGuard permission={Permission.APPROVE_KYC}>
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleApprove(detailCase)}
                    disabled={approvingId === detailCase.user_id || rejectingId === detailCase.user_id}
                    className="btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {approvingId === detailCase.user_id ? 'Approving…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(detailCase)}
                    disabled={approvingId === detailCase.user_id || rejectingId === detailCase.user_id}
                    className="btn btn-secondary border-red-200 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {rejectingId === detailCase.user_id ? 'Rejecting…' : 'Reject'}
                  </button>
                </div>
              </PermissionGuard>
            )}
          </div>
        </Modal>
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
    </div>
  )
}
