import { useEffect, useState } from 'react'
import { api } from '../api'
import type { StaysStats } from '../api/types'

export function Listings() {
  const [stats, setStats] = useState<StaysStats | null>(null)
  const [pendingTotal, setPendingTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.STAYS.getStats().then((s) => s as StaysStats).catch(() => null),
      api.STAYS.getListings({ status: 'SUBMITTED', limit: 1 }).then((r: { total?: number }) => r?.total ?? 0).catch(() => 0),
    ])
      .then(([s, total]) => {
        setStats(s ?? null)
        setPendingTotal(total)
      })
      .finally(() => setLoading(false))
  }, [])

  const activeListings = stats?.liveListings ?? 0
  const pendingApproval = pendingTotal ?? 0
  // Backend has no "reported" status for listings; show 0 when using real data
  const reported = 0

  return (
    <>
      <div className="section-title">Listings</div>
      <div className="section-sub">All properties · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/admin/stays/listings</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card p"><div className="stat-label">ACTIVE LISTINGS</div><div className="stat-val">{loading ? '…' : activeListings}</div></div>
        <div className="stat-card y"><div className="stat-label">PENDING APPROVAL</div><div className="stat-val">{loading ? '…' : pendingApproval}</div></div>
        <div className="stat-card r"><div className="stat-label">REPORTED</div><div className="stat-val">{loading ? '…' : reported}</div></div>
      </div>
    </>
  )
}
