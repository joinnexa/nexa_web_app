import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { DASHBOARD_KPI_POLL_MS } from '../constants/dashboardPoll'
import { useIntervalPoll } from '../hooks/useIntervalPoll'

interface StaysStats {
  activeListings?: number
  bookingsMtd?: number
  hostsPending?: number
  revenueMtd?: number
  [key: string]: unknown
}

export function StaysDashboard() {
  const [stats, setStats] = useState<StaysStats | null>(null)
  const [bookings, setBookings] = useState<unknown[]>([])
  const [hostApps, setHostApps] = useState<unknown[]>([])
  const [pendingProfiles, setPendingProfiles] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback((opts?: { background?: boolean }) => {
    const bg = opts?.background ?? false
    if (!bg) {
      setLoading(true)
      setError(null)
    }
    Promise.allSettled([
      api.STAYS.getStats(),
      api.STAYS.getBookings({ limit: 10 }),
      api.STAYS.getHostApplications({ status: 'PENDING', limit: 5 }),
      api.STAYS.getHosts({ status: 'PENDING', limit: 5 }),
    ])
      .then(([statsResult, bookingsResult, hostAppsResult, hostsPendingResult]) => {
        if (statsResult.status === 'fulfilled') {
          const s = statsResult.value as Record<string, unknown>
          setStats({
            activeListings: s?.liveListings ?? s?.activeListings,
            bookingsMtd: s?.todayBookings ?? s?.totalBookings ?? s?.bookingsMtd,
            hostsPending: s?.pendingHostVerification ?? s?.hostsPending,
            revenueMtd: s?.totalRevenue ?? s?.todayRevenue ?? s?.revenueMtd,
          } as StaysStats)
          if (!bg) setError(null)
        } else if (!bg) {
          setError(statsResult.reason?.response?.data?.message ?? statsResult.reason?.message ?? 'Failed to load stats')
        }
        if (bookingsResult.status === 'fulfilled') {
          const b = bookingsResult.value
          setBookings(Array.isArray(b) ? b : (b as { items?: unknown[] }).items ?? [])
        }
        if (hostAppsResult.status === 'fulfilled') {
          const h = hostAppsResult.value
          setHostApps(Array.isArray(h) ? h : (h as { items?: unknown[] }).items ?? [])
        }
        if (hostsPendingResult.status === 'fulfilled') {
          const hp = hostsPendingResult.value
          setPendingProfiles(Array.isArray(hp) ? hp : (hp as { items?: unknown[] }).items ?? [])
        }
      })
      .finally(() => {
        if (!bg) setLoading(false)
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useIntervalPoll(() => load({ background: true }), DASHBOARD_KPI_POLL_MS)

  if (loading && !stats) return <div className="section-title">Stays Dashboard</div>
  if (error && !stats) return <><div className="section-title">Stays Dashboard</div><div className="alert alert-r">{error}</div></>

  return (
    <>
      <div className="section-title">Nexa Stays</div>
      <div className="section-sub">Listings, bookings, hosts · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/stays/*</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card p"><div className="stat-label">ACTIVE LISTINGS</div><div className="stat-val">{stats?.activeListings ?? '—'}</div><div className="stat-sub">From API</div></div>
        <div className="stat-card g"><div className="stat-label">BOOKINGS MTD</div><div className="stat-val">{stats?.bookingsMtd ?? '—'}</div><div className="stat-sub">From API</div></div>
        <div className="stat-card y"><div className="stat-label">HOSTS PENDING</div><div className="stat-val">{stats?.hostsPending ?? hostApps.length}</div><div className="stat-sub">Verification needed</div></div>
        <div className="stat-card b"><div className="stat-label">REVENUE MTD</div><div className="stat-val">{stats?.revenueMtd != null ? `${stats.revenueMtd} MAD` : '—'}</div><div className="stat-sub">From API</div></div>
      </div>
      <div className="row">
        <div className="col-2">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Recent Bookings</div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Booking</th><th>Guest</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.length === 0 && <tr><td colSpan={4} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>No bookings</td></tr>}
                  {bookings.slice(0, 5).map((b, i) => {
                    const row = b as Record<string, unknown>
                    return (
                    <tr key={(row.id as string) || i}>
                      <td className="td-mono">{(row.id as string)?.slice(0, 8) || '—'}</td>
                      <td>{String(row.guest_id ?? row.user_id ?? '—').slice(0, 8)}</td>
                      <td><strong>{row.amount != null ? `${Number(row.amount).toLocaleString()} MAD` : '—'}</strong></td>
                      <td><span className="badge badge-g">{String(row.status ?? '—')}</span></td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-1">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-hdr">
              <div className="card-title">Host queues</div>
              <Link to="/hosts" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
                Open host review
              </Link>
            </div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>
                Verification <span className="badge badge-y">{pendingProfiles.length}</span>
              </div>
              <div className="td-muted" style={{ fontSize: 11, marginBottom: 8 }}>
                Matches &quot;HOSTS PENDING&quot; — ID / profile review
              </div>
              {pendingProfiles.length === 0 && (
                <div className="td-muted" style={{ padding: '0 0 12px', fontSize: 12 }}>None pending</div>
              )}
              {pendingProfiles.map((p, i) => {
                const row = p as Record<string, unknown>
                const u = row.user as Record<string, unknown> | undefined
                const label = String(u?.full_name ?? u?.email ?? row.user_id ?? row.id ?? 'Host').slice(0, 28)
                return (
                  <div key={(row.id as string) || i} className="feed-item">
                    <div className="feed-icon" style={{ background: 'var(--ps)' }}>✓</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="feed-text" style={{ fontWeight: 700 }}>{label}</div>
                      <div className="feed-time">Verification</div>
                    </div>
                    <button type="button" className="btn btn-g btn-sm" onClick={() => api.STAYS.approveHost(String(row.id)).then(() => load())}>
                      Approve
                    </button>
                  </div>
                )
              })}
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', margin: '16px 0 8px' }}>
                New applications <span className="badge badge-y">{hostApps.length}</span>
              </div>
              <div className="td-muted" style={{ fontSize: 11, marginBottom: 8 }}>
                Become-a-host sign-ups
              </div>
              {hostApps.length === 0 && <div className="td-muted" style={{ padding: '0 0 8px', fontSize: 12 }}>None pending</div>}
              {hostApps.map((h, i) => {
                const row = h as Record<string, unknown>
                return (
                <div key={(row.id as string) || i} className="feed-item">
                  <div className="feed-icon" style={{ background: 'var(--ps)' }}>🏠</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="feed-text" style={{ fontWeight: 700 }}>{String(row.full_name ?? row.user_id ?? row.id ?? 'Application').slice(0, 24)}</div>
                    <div className="feed-time">Application</div>
                  </div>
                  <button type="button" className="btn btn-g btn-sm" onClick={() => api.STAYS.approveHostApplication(String(row.id)).then(() => load())}>Approve</button>
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
