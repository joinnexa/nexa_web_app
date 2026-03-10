import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

interface RegistrationApplication {
  id: string
  role: string
  status: string
  full_name: string | null
  phone_number: string
  country_code: string
  email: string | null
  date_of_birth: string | null
  city: string | null
  address: string | null
  emergency_contact: string | null
  identity_document_type: string | null
  identity_front_path: string | null
  identity_back_path: string | null
  selfie_path: string | null
  vehicle_make?: string | null
  vehicle_model?: string | null
  vehicle_year?: number | null
  vehicle_color?: string | null
  license_plate?: string | null
  vehicle_category?: string | null
  vehicle_photos?: Record<string, string>
  drivers_license_path?: string | null
  drivers_license_expiry?: string | null
  vehicle_registration_path?: string | null
  vehicle_registration_expiry?: string | null
  insurance_path?: string | null
  insurance_expiry?: string | null
  background_check_path?: string | null
  rejection_reason?: string | null
  created_at: string
}

type StatusFilter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'all'
type RoleFilter = 'driver' | 'courier' | 'all'

interface RegistrationApplicationsProps {
  roleFilter?: RoleFilter
  title?: string
  subtitle?: string
}

export default function RegistrationApplications({
  roleFilter: roleFilterProp,
  title = 'Driver & Courier Applications',
  subtitle = 'Review and approve registration requests from the Nexa Driver app',
}: RegistrationApplicationsProps = {}) {
  const [items, setItems] = useState<RegistrationApplication[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(roleFilterProp ?? 'all')
  const [detail, setDetail] = useState<RegistrationApplication | null>(null)
  const [imageModal, setImageModal] = useState<{ url: string; title: string } | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const fetchList = useCallback(async () => {
    try {
      setIsLoading(true)
      const params: Record<string, string> = { limit: '50', offset: '0' }
      if (statusFilter !== 'all') params.status = statusFilter
      if (roleFilter !== 'all') params.role = roleFilter
      const res = await adminApi.getRegistrationApplications(params)
      const data = res.data
      const list = data?.items ?? data?.data ?? (Array.isArray(data) ? data : [])
      const t = data?.total ?? list?.length ?? 0
      setItems(Array.isArray(list) ? list : [])
      setTotal(typeof t === 'number' ? t : 0)
    } catch (err) {
      console.error('Error fetching registration applications:', err)
      setItems([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, roleFilter])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    if (roleFilterProp !== undefined) setRoleFilter(roleFilterProp)
  }, [roleFilterProp])

  useEffect(() => {
    return () => {
      if (imageModal?.url) URL.revokeObjectURL(imageModal.url)
    }
  }, [imageModal?.url])

  const loadImage = async (id: string, path: string | null, title: string) => {
    if (!path) return
    const filename = path.includes('/') ? path.split('/').pop()! : path
    try {
      const res = await adminApi.getRegistrationApplicationFile(id, filename)
      const url = URL.createObjectURL(res.data as Blob)
      setImageModal({ url, title })
    } catch (err) {
      console.error('Error loading image:', err)
    }
  }

  const handleApprove = async (id: string) => {
    if (approvingId) return
    setApprovingId(id)
    try {
      await adminApi.approveRegistrationApplication(id)
      setDetail((d) => (d?.id === id ? { ...d, status: 'APPROVED' } : d))
      setItems((prev) => prev.filter((i) => i.id !== id))
      setTotal((t) => Math.max(0, t - 1))
    } catch (err) {
      console.error('Error approving:', err)
      alert('Failed to approve')
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (rejectingId) return
    const reason = prompt('Rejection reason:') || 'Rejected by admin'
    if (!reason.trim()) return
    setRejectingId(id)
    try {
      await adminApi.rejectRegistrationApplication(id, reason)
      setDetail((d) => (d?.id === id ? { ...d, status: 'REJECTED', rejection_reason: reason } : d))
      setItems((prev) => prev.filter((i) => i.id !== id))
      setTotal((t) => Math.max(0, t - 1))
    } catch (err) {
      console.error('Error rejecting:', err)
      alert('Failed to reject')
    } finally {
      setRejectingId(null)
    }
  }

  const viewDetail = async (id: string) => {
    try {
      const res = await adminApi.getRegistrationApplication(id)
      setDetail(res.data)
    } catch (err) {
      console.error('Error fetching detail:', err)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="mt-1 block rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all">All</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          {roleFilterProp === undefined && (
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="mt-1 block rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">All</option>
                <option value="driver">Driver</option>
                <option value="courier">Courier</option>
              </select>
            </div>
          )}
          <button
            onClick={() => fetchList()}
            className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <Table
          headers={['Name', 'Phone', 'Role', 'Status', 'Date', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No applications found"
        >
          {items.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.full_name || '—'}</TableCell>
              <TableCell>{app.country_code} {app.phone_number}</TableCell>
              <TableCell>
                <Badge variant="default">{app.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    app.status === 'APPROVED'
                      ? 'success'
                      : app.status === 'REJECTED'
                        ? 'danger'
                        : 'default'
                  }
                >
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewDetail(app.id)}
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
                    <>
                      <button
                        onClick={() => handleApprove(app.id)}
                        disabled={!!approvingId}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        disabled={!!rejectingId}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      {detail && (
        <Card>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold">Application Details</h2>
            <button
              onClick={() => setDetail(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-2">1. Personal Info</h3>
              <dl className="space-y-1 text-sm">
                <div><dt className="text-gray-500">Name</dt><dd>{detail.full_name || '—'}</dd></div>
                <div><dt className="text-gray-500">Phone</dt><dd>{detail.country_code} {detail.phone_number}</dd></div>
                <div><dt className="text-gray-500">Email</dt><dd>{detail.email || '—'}</dd></div>
                <div><dt className="text-gray-500">DOB</dt><dd>{detail.date_of_birth || '—'}</dd></div>
                <div><dt className="text-gray-500">City</dt><dd>{detail.city || '—'}</dd></div>
                <div><dt className="text-gray-500">Address</dt><dd>{detail.address || '—'}</dd></div>
                <div><dt className="text-gray-500">Emergency contact</dt><dd>{detail.emergency_contact || '—'}</dd></div>
              </dl>
            </div>
            <div>
              <h3 className="font-medium mb-2">2. Identity Verification</h3>
              <dl className="space-y-1 text-sm mb-2">
                <div><dt className="text-gray-500">Document type</dt><dd>{detail.identity_document_type === 'id' ? 'ID Card' : detail.identity_document_type || '—'}</dd></div>
              </dl>
              <div className="flex flex-wrap gap-2">
                {detail.identity_front_path && (
                  <button onClick={() => loadImage(detail.id, detail.identity_front_path, 'ID Front')} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200">ID Front</button>
                )}
                {detail.identity_back_path && (
                  <button onClick={() => loadImage(detail.id, detail.identity_back_path, 'ID Back')} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200">ID Back</button>
                )}
                {detail.selfie_path && (
                  <button onClick={() => loadImage(detail.id, detail.selfie_path, 'Selfie')} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200">Selfie</button>
                )}
              </div>
              {detail.role === 'driver' && (
                <>
                  <h3 className="font-medium mt-4 mb-2">3. Vehicle Info</h3>
                  <dl className="space-y-1 text-sm">
                    <div><dt className="text-gray-500">Make/Model</dt><dd>{[detail.vehicle_make, detail.vehicle_model].filter(Boolean).join(' ') || '—'}</dd></div>
                    <div><dt className="text-gray-500">Year</dt><dd>{detail.vehicle_year || '—'}</dd></div>
                    <div><dt className="text-gray-500">Color</dt><dd>{detail.vehicle_color || '—'}</dd></div>
                    <div><dt className="text-gray-500">Plate</dt><dd>{detail.license_plate || '—'}</dd></div>
                    <div><dt className="text-gray-500">Category</dt><dd>{detail.vehicle_category || '—'}</dd></div>
                  </dl>
                  <h3 className="font-medium mt-4 mb-2">4. Vehicle Photos</h3>
                  <div className="flex flex-wrap gap-2">
                    {detail.vehicle_photos && Object.entries(detail.vehicle_photos).map(([key, path]) => (
                      <button key={key} onClick={() => loadImage(detail.id, path, `Vehicle photo ${key}`)} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200">Photo {key.replace('photo_', '')}</button>
                    ))}
                    {(!detail.vehicle_photos || Object.keys(detail.vehicle_photos).length === 0) && <span className="text-gray-500 text-sm">—</span>}
                  </div>
                  <h3 className="font-medium mt-4 mb-2">5. Driver Documents</h3>
                  <dl className="space-y-1 text-sm mb-2">
                    {detail.drivers_license_expiry && <div><dt className="text-gray-500">License expiry</dt><dd>{detail.drivers_license_expiry}</dd></div>}
                    {detail.vehicle_registration_expiry && <div><dt className="text-gray-500">Registration expiry</dt><dd>{detail.vehicle_registration_expiry}</dd></div>}
                    {detail.insurance_expiry && <div><dt className="text-gray-500">Insurance expiry</dt><dd>{detail.insurance_expiry}</dd></div>}
                  </dl>
                  <div className="flex flex-wrap gap-2">
                    {detail.drivers_license_path && <button onClick={() => loadImage(detail.id, detail.drivers_license_path!, 'Driver License')} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200">License</button>}
                    {detail.vehicle_registration_path && <button onClick={() => loadImage(detail.id, detail.vehicle_registration_path!, 'Vehicle Registration')} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200">Registration</button>}
                    {detail.insurance_path && <button onClick={() => loadImage(detail.id, detail.insurance_path!, 'Insurance')} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200">Insurance</button>}
                    {detail.background_check_path && <button onClick={() => loadImage(detail.id, detail.background_check_path!, 'Background Check')} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200">Background Check</button>}
                  </div>
                </>
              )}
            </div>
            <div>
              <h3 className="font-medium mb-2">6. Review & Actions</h3>
              {(detail.status === 'PENDING' || detail.status === 'UNDER_REVIEW') && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(detail.id)}
                    disabled={!!approvingId}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(detail.id)}
                    disabled={!!rejectingId}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
              {detail.rejection_reason && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">Rejected: {detail.rejection_reason}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {imageModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setImageModal(null)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-2 font-medium">{imageModal.title}</div>
            <img src={imageModal.url} alt={imageModal.title} className="w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
