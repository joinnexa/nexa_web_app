import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { AuditLogEntry } from '../api/types'

export function AuditLogs() {
  const [data, setData] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.AUDIT.getLogs({ limit: 50 })
      .then((res) => {
        const items = Array.isArray(res) ? res : (res as { items?: AuditLogEntry[] }).items ?? []
        setData(items)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <>
      <div className="section-title">Audit Logs</div>
      <div className="section-sub">All admin actions — immutable log · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/audit/logs</code></div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="card">
        <div className="card-hdr"><div className="card-title">Recent Actions</div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Action</th><th>Admin</th><th>Target</th><th>IP</th><th>Time</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
              {!loading && data.length === 0 && <tr><td colSpan={5} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>No logs</td></tr>}
              {!loading && data.map((row) => (
                <tr key={row.id}>
                  <td><span className="badge badge-g">{row.action || '—'}</span></td>
                  <td>{row.admin_email ?? row.admin_id ?? '—'}</td>
                  <td>{row.target_type || row.target_id || row.details || '—'}</td>
                  <td className="td-mono">{row.ip_address || '—'}</td>
                  <td className="td-muted">{row.created_at ? new Date(row.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
