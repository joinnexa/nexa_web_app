import { useEffect, useState } from 'react'
import { api } from '../api'
import type { StaysStats } from '../api/types'

export function Bookings() {
  const [stats, setStats] = useState<StaysStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.STAYS.getStats()
      .then((s) => setStats(s as StaysStats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const totalBookings = stats?.totalBookings ?? 0
  const confirmed = stats?.confirmedBookings ?? 0
  const pending = Math.max(0, totalBookings - confirmed)
  const todayBookings = stats?.todayBookings ?? 0

  return (
    <>
      <div className="section-title">Bookings</div>
      <div className="section-sub">All reservations · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/admin/stays/bookings</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card p"><div className="stat-label">BOOKINGS TODAY</div><div className="stat-val">{loading ? '…' : todayBookings}</div></div>
        <div className="stat-card g"><div className="stat-label">CONFIRMED</div><div className="stat-val">{loading ? '…' : confirmed}</div></div>
        <div className="stat-card y"><div className="stat-label">PENDING / OTHER</div><div className="stat-val">{loading ? '…' : pending}</div></div>
      </div>
    </>
  )
}
