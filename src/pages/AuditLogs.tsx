import { useEffect, useState } from 'react'
import { Search, Download } from 'lucide-react'
import { format } from 'date-fns'
import { PermissionGuard } from '../components/PermissionGuard'
import { Permission } from '../types/roles'
import { adminApi } from '../services/adminApi'

interface AuditLog {
  id: string
  user_id: string | null
  admin_user_id: string | null
  admin_email: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  ip_address: string | null
  device_id: string | null
  metadata: any
  created_at: string
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')

  useEffect(() => {
    fetchLogs()
  }, [filterAction, searchTerm])

  const fetchLogs = async () => {
    try {
      const params: any = {}
      if (filterAction !== 'all') params.action = filterAction
      if (searchTerm) params.search = searchTerm
      const response = await adminApi.getAuditLogs(params)
      setLogs(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = filterAction === 'all' || log.action === filterAction
    
    return matchesSearch && matchesAction
  })

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Compliance Logs</h1>
          <p className="mt-1 text-sm text-slate-500">Immutable audit trail of all admin actions</p>
        </div>
        <PermissionGuard permission={Permission.EXPORT_DATA}>
          <button className="btn btn-secondary">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </PermissionGuard>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by action, admin email, or entity ID..."
                  className="input pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="select"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option value="all">All Actions</option>
                <option value="WALLET_FROZEN">Wallet Frozen</option>
                <option value="WALLET_UNFROZEN">Wallet Unfrozen</option>
                <option value="KYC_APPROVED">KYC Approved</option>
                <option value="KYC_REJECTED">KYC Rejected</option>
                <option value="TRANSACTION_REVERSED">Transaction Reversed</option>
                <option value="CONFIG_CHANGED">Config Changed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="card">
        <ul className="divide-y divide-slate-200">
          {filteredLogs.length === 0 ? (
            <li className="p-6 text-center text-sm text-slate-500">No audit logs found.</li>
          ) : (
            filteredLogs.map((log) => (
              <li key={log.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-900">{log.action}</span>
                      {log.entity_type && (
                        <span className="text-xs text-slate-500">
                          ({log.entity_type}: {log.entity_id?.substring(0, 8)}...)
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      <div>Admin: {log.admin_email || 'System'}</div>
                      {log.user_id && <div>User: {log.user_id.substring(0, 8)}...</div>}
                      <div>IP: {log.ip_address || 'N/A'} | Device: {log.device_id || 'N/A'}</div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-1 text-xs text-slate-400">
                          Metadata: {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
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
