import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

interface RideRow {
  id: string
  passenger_name?: string | null
  driver_name?: string | null
  pickup_location?: string | null
  dropoff_location?: string | null
  ride_type?: string | null
  fare_amount?: number
  status?: string
}

export function Rides() {
  const [stats, setStats] = useState<{ ridesToday?: number; completedRidesToday?: number; driversOnline?: number; cancellationRate?: number } | null>(null)
  const [rides, setRides] = useState<RideRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(() => {
    api.GO.getStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  const loadRides = useCallback(() => {
    setLoading(true)
    api.GO.getRides({ page, limit: 20, status: statusFilter || undefined })
      .then((res) => {
        setRides((res?.data ?? []) as RideRow[])
        setTotal(res?.total ?? 0)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load rides'))
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { loadRides() }, [loadRides])

  return (
    <>
      <div className="section-title">Rides — Nexa Go</div>
      <div className="section-sub">Live taxi operations</div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card v">
          <div className="stat-label">RIDES TODAY</div>
          <div className="stat-val">{stats?.ridesToday != null ? stats.ridesToday.toLocaleString() : '—'}</div>
          <div className="stat-sub">From API</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">COMPLETED TODAY</div>
          <div className="stat-val">{stats?.completedRidesToday != null ? stats.completedRidesToday.toLocaleString() : '—'}</div>
        </div>
        <div className="stat-card y">
          <div className="stat-label">DRIVERS ONLINE</div>
          <div className="stat-val">{stats?.driversOnline != null ? stats.driversOnline : '—'}</div>
        </div>
        <div className="stat-card r">
          <div className="stat-label">CANCELLATION RATE</div>
          <div className="stat-val">{stats?.cancellationRate != null ? `${stats.cancellationRate}%` : '—'}</div>
        </div>
      </div>
      <div className="row">
        <div className="col-2">
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Ride List</div>
              <div className="card-actions">
                <div className="tabs">
                  <button type="button" className={`tab ${!statusFilter ? 'active' : ''}`} onClick={() => setStatusFilter('')}>All</button>
                  <button type="button" className={`tab ${statusFilter === 'COMPLETED' ? 'active' : ''}`} onClick={() => setStatusFilter('COMPLETED')}>Completed</button>
                  <button type="button" className={`tab ${statusFilter === 'REQUESTED' ? 'active' : ''}`} onClick={() => setStatusFilter('REQUESTED')}>Requested</button>
                  <button type="button" className={`tab ${statusFilter === 'CANCELLED' ? 'active' : ''}`} onClick={() => setStatusFilter('CANCELLED')}>Cancelled</button>
                </div>
                <button type="button" className="btn btn-dark btn-sm" onClick={() => loadRides()} disabled={loading}>Refresh</button>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Ride ID</th><th>Passenger</th><th>Driver</th><th>Route</th><th>Type</th><th>Fare</th><th>Status</th></tr></thead>
                <tbody>
                  {loading && rides.length === 0 && <tr><td colSpan={7} className="td-muted" style={{ padding: 16 }}>Loading…</td></tr>}
                  {!loading && rides.length === 0 && <tr><td colSpan={7} className="td-muted" style={{ padding: 16 }}>No rides</td></tr>}
                  {rides.map((r) => (
                    <tr key={r.id}>
                      <td className="td-mono">{r.id.slice(0, 8)}…</td>
                      <td>{r.passenger_name ?? '—'}</td>
                      <td>{r.driver_name ?? '—'}</td>
                      <td>{[r.pickup_location, r.dropoff_location].filter(Boolean).join(' → ') || '—'}</td>
                      <td><span className="badge badge-v">{r.ride_type ?? '—'}</span></td>
                      <td>{r.fare_amount != null ? `${r.fare_amount} MAD` : '—'}</td>
                      <td><span className={`badge badge-${r.status === 'COMPLETED' ? 'g' : r.status === 'CANCELLED' ? 'r' : 'y'}`}>{r.status ?? '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > 20 && (
              <div className="card-body" style={{ borderTop: '1px solid var(--surf2)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="td-muted">Total: {total}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-dark btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                  <button type="button" className="btn btn-dark btn-sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
