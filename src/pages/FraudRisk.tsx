import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { RiskAlert } from '../api/types'

type RiskStats = {
  totalAlerts?: number
  highSeverity?: number
  openCases?: number
  avgRiskScore?: number
  medium?: number
  resolved?: number
  critical?: number
}

export function FraudRisk() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [stats, setStats] = useState<RiskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([api.RISK.getAlerts(), api.RISK.getStats()])
      .then(([alertsRes, statsRes]) => {
        setAlerts(Array.isArray(alertsRes) ? alertsRes : (alertsRes as { items?: RiskAlert[] }).items ?? [])
        setStats(statsRes as RiskStats)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openEscalate = (id: string) => {
    setBusy(true)
    api.RISK
      .escalate(id)
      .then(() => load())
      .catch((e) => setError(e?.response?.data?.message ?? e.message ?? 'Escalate failed'))
      .finally(() => setBusy(false))
  }

  const openFlag = (transactionId: string) => {
    const reason = window.prompt('Reason for flagging this transaction?', 'Manual review')
    if (reason === null) return
    setBusy(true)
    api.RISK
      .flagTransaction(transactionId, reason)
      .then(() => load())
      .catch((e) => setError(e?.response?.data?.message ?? e.message ?? 'Flag failed'))
      .finally(() => setBusy(false))
  }

  const openFlagAdHoc = () => {
    const tx = window.prompt('Transaction UUID to flag')
    if (!tx?.trim()) return
    openFlag(tx.trim())
  }

  const criticalCount = alerts.filter((a) => (a.status || '').toUpperCase() === 'OPEN').length
  const openStats = stats?.openCases ?? criticalCount

  return (
    <>
      <div className="section-title">Fraud & Risk</div>
      <div className="section-sub">
        Risk alerts <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/risk/*</code>
        {' · '}
        Operational fraud queue is under <strong>System → Operations → Fraud events</strong>.
      </div>
      {criticalCount > 0 && (
        <div className="alert alert-r" style={{ marginBottom: 20 }}>
          <strong>{criticalCount} open alert{criticalCount !== 1 ? 's' : ''}</strong> in this list.
        </div>
      )}
      {error && <div className="alert alert-r">{error}</div>}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card r"><div className="stat-label">OPEN (LIST)</div><div className="stat-val">{loading ? '…' : criticalCount}</div><div className="stat-sub">This page</div></div>
        <div className="stat-card y"><div className="stat-label">OPEN (API)</div><div className="stat-val">{loading ? '…' : openStats}</div><div className="stat-sub">Backend summary</div></div>
        <div className="stat-card r"><div className="stat-label">HIGH SEVERITY</div><div className="stat-val">{loading ? '…' : stats?.highSeverity ?? '—'}</div><div className="stat-sub">All time</div></div>
        <div className="stat-card g"><div className="stat-label">AVG RISK SCORE</div><div className="stat-val">{loading ? '…' : stats?.avgRiskScore != null ? Number(stats.avgRiskScore).toFixed(1) : '—'}</div><div className="stat-sub">Engine</div></div>
      </div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-hdr">
          <div className="card-title">Quick actions</div>
          <button type="button" className="btn btn-sm" onClick={openFlagAdHoc}>
            Flag transaction by ID
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Risk alerts</div></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>TXN id</th>
                <th>Details</th>
                <th>Risk</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={11} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
              {!loading && alerts.length === 0 && <tr><td colSpan={11} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>No alerts</td></tr>}
              {!loading && alerts.map((a) => (
                <tr key={a.id}>
                  <td className="td-mono" title={a.id}>{a.id?.slice(0, 8)}…</td>
                  <td className="td-mono" title={a.user_id ?? ''}>
                    {a.user_phone?.trim() || (a.user_id ? `${a.user_id.slice(0, 8)}…` : '—')}
                  </td>
                  <td><span className="badge badge-r">{a.type || 'Alert'}</span></td>
                  <td><strong>{a.amount != null && !Number.isNaN(Number(a.amount)) ? `${Number(a.amount).toLocaleString()} MAD` : '—'}</strong></td>
                  <td className="td-mono" style={{ maxWidth: 140 }} title={a.transaction_reference ?? ''}>
                    {a.transaction_reference?.trim() || '—'}
                  </td>
                  <td className="td-mono" style={{ maxWidth: 220, fontSize: 11, wordBreak: 'break-all' }} title={a.transaction_id ?? ''}>
                    {a.transaction_id?.trim() || '—'}
                  </td>
                  <td className="td-muted" style={{ maxWidth: 260, fontSize: 12 }} title={a.description ?? ''}>
                    {a.description && a.description.length > 90 ? `${a.description.slice(0, 90)}…` : (a.description || '—')}
                  </td>
                  <td>{a.risk_score ?? '—'}</td>
                  <td><span className={`badge ${(a.status || '').toUpperCase() === 'OPEN' ? 'badge-r' : 'badge-g'}`}>{a.status || '—'}</span></td>
                  <td className="td-muted">{a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busy}
                      onClick={() => openEscalate(a.id)}
                    >
                      Escalate
                    </button>
                    {a.transaction_id ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={busy}
                        style={{ marginLeft: 4 }}
                        onClick={() => openFlag(String(a.transaction_id))}
                      >
                        Flag TXN
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
