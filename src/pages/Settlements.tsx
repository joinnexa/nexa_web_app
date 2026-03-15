import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

function formatAmount(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(Math.round(n))
}

export function Settlements() {
  const [summary, setSummary] = useState<{
    pendingPayoutsAmount?: number
    settledThisWeekAmount?: number
    recipientsCount?: number
    nextBatchDate?: string
  } | null>(null)
  const [payouts, setPayouts] = useState<Array<{ id: string; driver_name?: string; pending_balance?: number; status?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.FINANCE.getSettlementsSummary().catch(() => null),
      api.FINANCE.getDriverPayouts().catch(() => []),
    ])
      .then(([sum, list]) => {
        if (sum) setSummary(sum)
        setPayouts(Array.isArray(list) ? list.slice(0, 20) : (list as { data?: unknown[] })?.data?.slice(0, 20) ?? [])
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  if (loading && !summary) return <div className="section-title">Settlements</div>
  if (error && !summary) return <><div className="section-title">Settlements</div><div className="alert alert-r">{error}</div></>

  return (
    <>
      <div className="section-title">Settlements</div>
      <div className="section-sub">Driver, courier, and merchant payouts</div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card y">
          <div className="stat-label">PENDING PAYOUTS</div>
          <div className="stat-val">{summary?.pendingPayoutsAmount != null ? `${formatAmount(summary.pendingPayoutsAmount)} MAD` : '—'}</div>
          <div className="stat-sub">Next batch: {summary?.nextBatchDate ?? '—'}</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">SETTLED THIS WEEK</div>
          <div className="stat-val">{summary?.settledThisWeekAmount != null ? `${formatAmount(summary.settledThisWeekAmount)} MAD` : '—'}</div>
        </div>
        <div className="stat-card v">
          <div className="stat-label">RECIPIENTS</div>
          <div className="stat-val">{summary?.recipientsCount != null ? summary.recipientsCount.toLocaleString() : '—'}</div>
          <div className="stat-sub">With pending balance</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Driver & Courier Payouts (sample)</div><button type="button" className="btn btn-dark btn-sm" onClick={load}>Refresh</button></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Driver / Courier</th><th>Pending</th><th>Status</th></tr></thead>
            <tbody>
              {payouts.length === 0 && <tr><td colSpan={3} className="td-muted" style={{ padding: 16 }}>No payouts</td></tr>}
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td>{p.driver_name ?? p.id}</td>
                  <td>{p.pending_balance != null ? `${Number(p.pending_balance).toFixed(2)} MAD` : '—'}</td>
                  <td><span className={`badge ${p.status === 'PENDING' ? 'badge-y' : 'badge-g'}`}>{p.status ?? '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
