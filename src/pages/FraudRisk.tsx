import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { RiskAlert } from '../api/types'

export function FraudRisk() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [stats, setStats] = useState<{ critical?: number; medium?: number; resolved?: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([api.RISK.getAlerts(), api.RISK.getStats()])
      .then(([alertsRes, statsRes]) => {
        setAlerts(Array.isArray(alertsRes) ? alertsRes : (alertsRes as { items?: RiskAlert[] }).items ?? [])
        setStats(statsRes as { critical?: number; medium?: number; resolved?: number })
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const criticalCount = alerts.filter((a) => (a.status || '').toUpperCase() === 'OPEN').length

  return (
    <>
      <div className="section-title">Fraud & Risk</div>
      <div className="section-sub">Alerts from the Nexa Pay risk engine · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/risk</code></div>
      {criticalCount > 0 && (
        <div className="alert alert-r" style={{ marginBottom: 20 }}>
          <strong>{criticalCount} CRITICAL alert{criticalCount !== 1 ? 's' : ''}</strong> require immediate action.
        </div>
      )}
      {error && <div className="alert alert-r">{error}</div>}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card r"><div className="stat-label">OPEN</div><div className="stat-val">{loading ? '…' : criticalCount}</div><div className="stat-sub">Active alerts</div></div>
        <div className="stat-card y"><div className="stat-label">MEDIUM RISK</div><div className="stat-val">{loading ? '…' : (stats?.medium ?? '—')}</div><div className="stat-sub">From API stats</div></div>
        <div className="stat-card g"><div className="stat-label">RESOLVED</div><div className="stat-val">{loading ? '…' : (stats?.resolved ?? '—')}</div><div className="stat-sub">From API stats</div></div>
        <div className="stat-card b"><div className="stat-label">TOTAL IN LIST</div><div className="stat-val">{loading ? '…' : alerts.length}</div><div className="stat-sub">limit 50</div></div>
      </div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Active Fraud Alerts</div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>User</th><th>Type</th><th>Amount</th><th>Risk Score</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
              {!loading && alerts.length === 0 && <tr><td colSpan={7} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>No alerts</td></tr>}
              {!loading && alerts.map((a) => (
                <tr key={a.id}>
                  <td className="td-mono">{a.id?.slice(0, 8)}</td>
                  <td>{a.user_id?.slice(0, 8) ?? '—'}</td>
                  <td><span className="badge badge-r">{a.type || 'Alert'}</span></td>
                  <td><strong>{a.amount != null ? `${Number(a.amount).toLocaleString()} MAD` : '—'}</strong></td>
                  <td>{a.risk_score ?? '—'}</td>
                  <td><span className={`badge ${(a.status || '').toUpperCase() === 'OPEN' ? 'badge-r' : 'badge-g'}`}>{a.status || '—'}</span></td>
                  <td className="td-muted">{a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
