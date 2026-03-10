import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { PermissionGuard } from '../../components/PermissionGuard'
import { Permission } from '../../types/roles'
import { adminApi } from '../../services/adminApi'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

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

  const handleApprove = async (c: KycCase) => {
    try {
      const product = (c.source || 'PAY') as 'PAY' | 'GO' | 'STAYS'
      await adminApi.approveKyc(c.user_id, product)
      fetchCases()
    } catch (error) {
      console.error('Error approving KYC:', error)
      alert('Failed to approve KYC case')
    }
  }

  const handleReject = async (c: KycCase) => {
    const reason = prompt('Rejection reason:') || 'No reason provided'
    if (!reason.trim()) return
    try {
      const product = (c.source || 'PAY') as 'PAY' | 'GO' | 'STAYS'
      await adminApi.rejectKyc(c.user_id, reason, product)
      fetchCases()
    } catch (error) {
      console.error('Error rejecting KYC:', error)
      alert('Failed to reject KYC case')
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
                    {c.status === 'PENDING' && (
                      <PermissionGuard permission={Permission.APPROVE_KYC}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(c)}
                            className="btn btn-primary text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(c)}
                            className="btn btn-secondary text-sm border-red-200 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Reject
                          </button>
                        </div>
                      </PermissionGuard>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
