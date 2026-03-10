import { useEffect, useState } from 'react'
import { Check, X, Snowflake, Sun } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { adminApi } from '../../services/adminApi'

interface Host {
  id: string
  user_id: string
  host_verification_status: string
  listing_frozen?: boolean
  document_type?: string
  submitted_at?: string
  reviewed_at?: string
  user?: { name?: string; phone?: string; email?: string }
  created_at: string
}

export default function Hosts() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchHosts()
  }, [filter])

  const fetchHosts = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getHosts({ status: filter === 'all' ? undefined : filter, limit: 50 })
      const data = res.data?.data ?? res.data
      const items = data?.items ?? (Array.isArray(data) ? data : [])
      setHosts(items)
    } catch (err) {
      console.error(err)
      setHosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    APPROVED: 'success',
    PENDING: 'warning',
    REJECTED: 'danger',
  }

  const hostDisplayName = (h: Host) =>
    h.user?.name ?? h.user?.phone ?? h.user?.email ?? 'N/A'

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    setError(null)
    try {
      await adminApi.approveHost(id)
      await fetchHosts()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    setActionLoading(rejectTarget.id)
    setError(null)
    try {
      await adminApi.rejectHost(rejectTarget.id, rejectReason)
      setRejectTarget(null)
      setRejectReason('')
      await fetchHosts()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  const handleFreeze = async (id: string) => {
    setActionLoading(id)
    setError(null)
    try {
      await adminApi.freezeHost(id)
      await fetchHosts()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to freeze')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnfreeze = async (id: string) => {
    setActionLoading(id)
    setError(null)
    try {
      await adminApi.unfreezeHost(id)
      await fetchHosts()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to unfreeze')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hosts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Host verification queue and status</p>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
        <div className="flex gap-4 mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button
            onClick={fetchHosts}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Refresh
          </button>
        </div>

        <Table
          headers={['Host', 'Status', 'Listing', 'Document', 'Submitted', 'Reviewed', 'Created', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No hosts found"
        >
          {hosts.map((h) => (
            <TableRow key={h.id}>
              <TableCell>{hostDisplayName(h)}</TableCell>
              <TableCell><Badge variant={statusVariant[h.host_verification_status] || 'default'}>{h.host_verification_status}</Badge></TableCell>
              <TableCell>
                {h.host_verification_status === 'APPROVED' && (
                  h.listing_frozen ? (
                    <Badge variant="default" className="bg-slate-500">Frozen</Badge>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Can list</span>
                  )
                )}
                {h.host_verification_status !== 'APPROVED' && <span className="text-gray-400">—</span>}
              </TableCell>
              <TableCell>{h.document_type || '-'}</TableCell>
              <TableCell>{h.submitted_at ? new Date(h.submitted_at).toLocaleDateString() : '-'}</TableCell>
              <TableCell>{h.reviewed_at ? new Date(h.reviewed_at).toLocaleDateString() : '-'}</TableCell>
              <TableCell>{new Date(h.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {h.host_verification_status === 'PENDING' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleApprove(h.id)}
                      disabled={!!actionLoading}
                      className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded disabled:opacity-50"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setRejectTarget({ id: h.id, name: hostDisplayName(h) })}
                      disabled={!!actionLoading}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {h.host_verification_status === 'APPROVED' && (
                  <div className="flex items-center gap-1">
                    {h.listing_frozen ? (
                      <button
                        onClick={() => handleUnfreeze(h.id)}
                        disabled={!!actionLoading}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded disabled:opacity-50"
                        title="Unfreeze (allow listing again)"
                      >
                        <Sun className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFreeze(h.id)}
                        disabled={!!actionLoading}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-50"
                        title="Freeze (block new listings; host can still book)"
                      >
                        <Snowflake className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Modal
        open={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setRejectReason(''); setError(null) }}
        title={`Reject host: ${rejectTarget?.name ?? ''}`}
      >
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason (optional)
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="e.g. Document verification failed"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setRejectTarget(null); setRejectReason(''); setError(null) }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!!actionLoading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading === rejectTarget?.id ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
