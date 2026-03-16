import { useEffect, useState } from 'react'
import { api } from '../api'
import type { StaysStats } from '../api/types'

export function Hosts() {
  const [stats, setStats] = useState<StaysStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.STAYS.getStats()
      .then((s) => setStats(s as StaysStats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const verified = stats?.approvedHosts ?? 0
  const pending = stats?.pendingHostVerification ?? 0
  const totalListings = stats?.totalListings ?? 0
  const approvedHosts = stats?.approvedHosts ?? 0
  const avgListingsPerHost = approvedHosts > 0 ? (totalListings / approvedHosts).toFixed(1) : '—'

  return (
    <>
      <div className="section-title">Hosts</div>
      <div className="section-sub">Host verification · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/admin/stays/hosts</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card p"><div className="stat-label">VERIFIED HOSTS</div><div className="stat-val">{loading ? '…' : verified}</div></div>
        <div className="stat-card y"><div className="stat-label">PENDING REVIEW</div><div className="stat-val">{loading ? '…' : pending}</div></div>
        <div className="stat-card g"><div className="stat-label">AVG LISTINGS/HOST</div><div className="stat-val">{loading ? '…' : avgListingsPerHost}</div></div>
      </div>
    </>
  )
}
