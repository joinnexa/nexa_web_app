import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, FileText, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { PermissionGuard } from '../components/PermissionGuard'
import { Permission } from '../types/roles'
import { adminApi } from '../services/adminApi'

interface KycCase {
  id: string
  user_id: string
  user_phone: string
  user_name: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'VERIFIED'
  level: string
  provider: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
  documents: {
    id_document: boolean
    selfie: boolean
    liveness: boolean
  }
  aml_screening: {
    status: 'PENDING' | 'CLEAR' | 'FLAGGED'
    score: number
  }
}

export default function KycQueue() {
  const [cases, setCases] = useState<KycCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')

  useEffect(() => {
    fetchKycCases()
  }, [])

  const fetchKycCases = async () => {
    try {
      const params: Record<string, string> = { source: 'PAY', status: 'all' }
      const response = await adminApi.getKycQueue(params)
      setCases(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error fetching KYC cases:', error)
      setCases([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      await adminApi.approveKyc(userId)
      fetchKycCases()
    } catch (error) {
      console.error('Error approving KYC:', error)
      alert('Failed to approve KYC case')
    }
  }

  const handleReject = async (userId: string, reason: string) => {
    if (!reason) {
      reason = prompt('Please provide a rejection reason:') || 'No reason provided'
    }
    try {
      await adminApi.rejectKyc(userId, reason)
      fetchKycCases()
    } catch (error) {
      console.error('Error rejecting KYC:', error)
      alert('Failed to reject KYC case')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const statusMatches = (s: string, f: typeof filter) =>
    f === 'all' ? true : f === 'APPROVED' ? (s === 'APPROVED' || s === 'VERIFIED') : s === f
  const filteredCases = filter === 'all' ? cases : cases.filter(c => statusMatches(c.status ?? 'PENDING', filter))

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-64" />
        <div className="card">
          <div className="card-body space-y-3">
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">KYC Review</h1>
        <p className="mt-1 text-sm text-slate-500">Compliance-grade identity verification review</p>
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="card-body">
          <nav className="flex flex-wrap gap-4">
            {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filter === status
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
                {status !== 'all' && (
                  <span className="ml-2 badge badge-neutral">
                    {cases.filter(c => statusMatches(c.status ?? 'PENDING', status)).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* KYC Cases */}
      <div className="card">
        <ul className="divide-y divide-slate-200">
          {filteredCases.length === 0 ? (
            <li className="p-6 text-center text-sm text-slate-500">No KYC applications found.</li>
          ) : (
            filteredCases.map((kycCase) => (
              <li key={kycCase.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(kycCase.status)}
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {kycCase.user_name || 'Unknown User'}
                      </div>
                      <div className="text-xs text-slate-500">{kycCase.user_phone}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        Submitted: {format(new Date(kycCase.submitted_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-slate-900">Level: {kycCase.level}</div>
                      <div className="text-xs text-slate-500">
                        AML: {kycCase.aml_screening.status} (Score: {kycCase.aml_screening.score})
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Documents: {Object.values(kycCase.documents).filter(Boolean).length}/3
                      </div>
                    </div>
                    
                    {kycCase.status === 'PENDING' && (
                      <PermissionGuard permission={Permission.APPROVE_KYC}>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(kycCase.user_id)}
                            className="btn btn-primary"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(kycCase.user_id, 'Manual review required')}
                            className="btn btn-danger"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                          <button className="btn btn-secondary">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </div>
                      </PermissionGuard>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
