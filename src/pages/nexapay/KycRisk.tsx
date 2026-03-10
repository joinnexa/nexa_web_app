import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Eye, ImageIcon } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'
import { useNavigate } from 'react-router-dom'

interface KycProfileUrls {
  document_file_url_front?: string | null
  document_file_url_back?: string | null
  selfie_file_url?: string | null
  full_name?: string | null
  email?: string | null
  date_of_birth?: string | null
  nationality?: string | null
  national_id_number?: string | null
  national_id_number_extracted?: string | null
}

interface KycApplication {
  id: string
  /** Backend returns camelCase userId; support both for compatibility */
  userId?: string
  user_id?: string
  user_name?: string
  user_phone?: string
  account_type?: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  documents: {
    id_document?: boolean
    selfie?: boolean
  }
  kycProfile?: KycProfileUrls
  submitted_at?: string
  created_at?: string
}

interface RiskAlert {
  id: string
  user_id: string
  transaction_id?: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  type: string
  description: string
  status: 'OPEN' | 'RESOLVED' | 'ESCALATED'
  created_at: string
}

/** Extract filename from URL path like /api/v1/kyc/files/userId/document_front.jpg */
function filenameFromFileUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const path = url.split('?')[0]
  const segment = path.split('/').filter(Boolean).pop()
  return segment || null
}

export default function NexaPayKycRisk() {
  const [activeTab, setActiveTab] = useState<'kyc' | 'risk'>('kyc')
  const [kycApplications, setKycApplications] = useState<KycApplication[]>([])
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null)
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null)
  const [imageModal, setImageModal] = useState<{ url: string; title: string } | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const navigate = useNavigate()

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

  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | 'CONSUMER' | 'MERCHANT'>('all')

  useEffect(() => {
    if (activeTab === 'kyc') {
      fetchKycQueue()
    } else {
      fetchRiskAlerts()
    }
  }, [activeTab, accountTypeFilter])

  const fetchKycQueue = async () => {
    try {
      setIsLoading(true)
      const params: Record<string, string> = { status: 'PENDING', source: 'PAY' }
      if (accountTypeFilter !== 'all') params.account_type = accountTypeFilter
      const response = await adminApi.getKycQueue(params)
      const data = response.data?.data || response.data
      setKycApplications(Array.isArray(data) ? data : data?.applications || data?.items || [])
    } catch (error) {
      console.error('Error fetching KYC queue:', error)
      setKycApplications([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRiskAlerts = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getRiskAlerts({ status: 'OPEN' })
      const data = response.data?.data || response.data
      setRiskAlerts(Array.isArray(data) ? data : data?.alerts || data?.items || [])
    } catch (error) {
      console.error('Error fetching risk alerts:', error)
      setRiskAlerts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveKyc = async (userId: string) => {
    if (approvingUserId) return
    setApprovingUserId(userId)
    try {
      await adminApi.approveKyc(userId)
      setKycApplications((prev) => prev.filter((a) => (a.userId ?? a.user_id) !== userId))
    } catch (error) {
      console.error('Error approving KYC:', error)
      alert('Failed to approve KYC')
      fetchKycQueue()
    } finally {
      setApprovingUserId(null)
    }
  }

  const handleRejectKyc = async (userId: string) => {
    if (rejectingUserId) return
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    setRejectingUserId(userId)
    try {
      await adminApi.rejectKyc(userId, reason)
      setKycApplications((prev) => prev.filter((a) => (a.userId ?? a.user_id) !== userId))
    } catch (error) {
      console.error('Error rejecting KYC:', error)
      alert('Failed to reject KYC')
      fetchKycQueue()
    } finally {
      setRejectingUserId(null)
    }
  }

  const handleEscalate = async (alertId: string) => {
    if (!confirm('Escalate this risk alert?')) return
    try {
      await adminApi.escalateCase(alertId)
      alert('Alert escalated')
      fetchRiskAlerts()
    } catch (error) {
      console.error('Error escalating alert:', error)
      alert('Failed to escalate alert')
    }
  }

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      CRITICAL: 'danger',
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'default',
    }
    return <Badge variant={variants[severity] || 'default'}>{severity}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC & Risk Management</h1>
        <p className="text-sm text-gray-500 mt-1">Review KYC applications and monitor risk alerts</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('kyc')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'kyc'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            KYC Queue
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'risk'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Risk Alerts
          </button>
        </nav>
      </div>

      {activeTab === 'kyc' && (
        <>
          <div className="border-b border-gray-200 pb-2">
            <div className="text-xs font-medium text-gray-500 uppercase">User type</div>
            <nav className="flex flex-wrap gap-2 mt-1">
              {(['all', 'CONSUMER', 'MERCHANT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setAccountTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    accountTypeFilter === t
                      ? 'bg-primary-100 text-primary-800'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'CONSUMER' ? 'Consumer' : 'Merchant'}
                </button>
              ))}
            </nav>
          </div>
        <Card>
          <Table
            headers={['User', 'Documents', 'Status', 'Submitted', 'Actions']}
            isLoading={isLoading}
            emptyMessage="No pending KYC applications"
          >
            {kycApplications.map((app) => {
              const appUserId = app.userId ?? app.user_id
              return (
              <TableRow key={app.id}>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{app.kycProfile?.full_name || app.user_name || 'N/A'}</span>
                      {app.account_type && (
                        <Badge variant="default" className="text-xs">
                          {app.account_type === 'CONSUMER' ? 'Consumer' : app.account_type === 'MERCHANT' ? 'Merchant' : app.account_type}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{app.user_phone || 'N/A'}</div>
                    {app.kycProfile?.email && (
                      <div className="text-xs text-gray-500">{app.kycProfile.email}</div>
                    )}
                    {(app.kycProfile?.date_of_birth || app.kycProfile?.nationality || app.kycProfile?.national_id_number) && (
                      <div className="text-xs text-gray-500 mt-1 space-x-2">
                        {app.kycProfile.date_of_birth && <span>DOB: {app.kycProfile.date_of_birth}</span>}
                        {app.kycProfile.nationality && (
                          <span>{app.kycProfile.nationality === 'MA' ? 'Moroccan' : app.kycProfile.nationality}</span>
                        )}
                        {app.kycProfile.national_id_number && (
                          <span className="font-mono">ID (form): {app.kycProfile.national_id_number}</span>
                        )}
                        {app.kycProfile.national_id_number_extracted && (
                          <span className="font-mono">ID (OCR): {app.kycProfile.national_id_number_extracted}</span>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-1">
                    <div className={app.documents?.id_document ? 'text-green-600' : 'text-gray-400'}>
                      ID: {app.documents?.id_document ? '✓' : '✗'}
                    </div>
                    <div className={app.documents?.selfie ? 'text-green-600' : 'text-gray-400'}>
                      Selfie: {app.documents?.selfie ? '✓' : '✗'}
                    </div>
                  </div>
                  {appUserId && app.kycProfile && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {app.kycProfile.document_file_url_front && (
                        <button
                          type="button"
                          onClick={() =>
                            viewKycImage(
                              appUserId,
                              app.kycProfile!.document_file_url_front,
                              'ID (front)'
                            )
                          }
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="View ID front"
                        >
                          <ImageIcon className="h-3 w-3" />
                          ID front
                        </button>
                      )}
                      {app.kycProfile.document_file_url_back && (
                        <button
                          type="button"
                          onClick={() =>
                            viewKycImage(
                              appUserId,
                              app.kycProfile!.document_file_url_back,
                              'ID (back)'
                            )
                          }
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="View ID back"
                        >
                          <ImageIcon className="h-3 w-3" />
                          ID back
                        </button>
                      )}
                      {app.kycProfile.selfie_file_url && (
                        <button
                          type="button"
                          onClick={() =>
                            viewKycImage(
                              appUserId,
                              app.kycProfile!.selfie_file_url,
                              'Selfie'
                            )
                          }
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
                  <Badge variant={app.status === 'PENDING' ? 'warning' : app.status === 'APPROVED' ? 'success' : 'danger'}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell>{(app.submitted_at ?? app.created_at) ? new Date((app.submitted_at ?? app.created_at)!).toLocaleDateString() : '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {appUserId && (
                      <button
                        onClick={() => navigate(`/pay/users/${appUserId}`)}
                        className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                        title="View User"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => appUserId && handleApproveKyc(appUserId)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Approve"
                      disabled={!appUserId || approvingUserId === appUserId}
                    >
                      {approvingUserId === appUserId ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => appUserId && handleRejectKyc(appUserId)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Reject"
                      disabled={!appUserId || rejectingUserId === appUserId}
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
        </>
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
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {imageModal.title}
              </h3>
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

      {activeTab === 'risk' && (
        <Card>
          <Table
            headers={['Severity', 'Type', 'Description', 'Status', 'Date', 'Actions']}
            isLoading={isLoading}
            emptyMessage="No open risk alerts"
          >
            {riskAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                <TableCell>{alert.type}</TableCell>
                <TableCell className="text-sm">{alert.description}</TableCell>
                <TableCell>
                  <Badge variant={alert.status === 'OPEN' ? 'warning' : alert.status === 'ESCALATED' ? 'danger' : 'success'}>
                    {alert.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(alert.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  {alert.status === 'OPEN' && (
                    <button
                      onClick={() => handleEscalate(alert.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Escalate
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      )}
    </div>
  )
}
