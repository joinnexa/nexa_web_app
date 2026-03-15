import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

function formatVol(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(n)
}

export function GoDashboard() {
  const [stats, setStats] = useState<{
    ridesToday?: number
    deliveriesToday?: number
    driversOnline?: number
    couriersOnline?: number
    goRevenueMtd?: number
    cancellationRate?: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.GO.getStats()
      .then(setStats)
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  if (loading && !stats) return <div className="section-title">Go Dashboard</div>
  if (error && !stats) return <><div className="section-title">Go Dashboard</div><div className="alert alert-r">{error}</div></>

  return (
    <>
      <div className="section-title">Go Dashboard</div>
      <div className="section-sub">Rides + delivery overview</div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card v">
          <div className="stat-label">RIDES TODAY</div>
          <div className="stat-val">{stats?.ridesToday != null ? stats.ridesToday.toLocaleString() : '—'}</div>
          <div className="stat-sub">From API</div>
        </div>
        <div className="stat-card o">
          <div className="stat-label">DELIVERIES TODAY</div>
          <div className="stat-val">{stats?.deliveriesToday != null ? stats.deliveriesToday.toLocaleString() : '—'}</div>
        </div>
        <div className="stat-card y">
          <div className="stat-label">ACTIVE DRIVERS</div>
          <div className="stat-val">{stats?.driversOnline != null ? stats.driversOnline : '—'}</div>
          <div className="stat-sub">Online now</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">GO REVENUE MTD</div>
          <div className="stat-val">{stats?.goRevenueMtd != null ? `${formatVol(stats.goRevenueMtd)} MAD` : '—'}</div>
          <div className="stat-sub">{stats?.cancellationRate != null ? `Cancel rate ${stats.cancellationRate}%` : ''}</div>
        </div>
      </div>
    </>
  )
}
