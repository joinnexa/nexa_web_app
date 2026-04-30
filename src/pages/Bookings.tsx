import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { StaysStats } from '../api/types'

type BookingRow = {
  id?: string
  status?: string
  total_paid?: number
  created_at?: string
  listing?: { title?: string }
  guest?: { full_name?: string; phone_number?: string }
}

function unwrapBookings(res: unknown): { rows: BookingRow[]; total: number } {
  if (res != null && typeof res === 'object' && 'items' in res && Array.isArray((res as { items: unknown }).items)) {
    const o = res as { items: BookingRow[]; total?: number }
    return { rows: o.items, total: o.total ?? o.items.length }
  }
  return { rows: [], total: 0 }
}

export function Bookings() {
  const [stats, setStats] = useState<StaysStats | null>(null)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.STAYS.getStats().then((s) => setStats(s as StaysStats)).catch(() => setStats(null)),
      api.STAYS.getBookings({ limit: 40, offset: 0 }).then((r) => setBookings(unwrapBookings(r).rows)).catch((e) => {
        setBookings([])
        setError(e?.response?.data?.message ?? e.message)
      }),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalBookings = stats?.totalBookings ?? bookings.length
  const confirmed = stats?.confirmedBookings ?? 0
  const pending = Math.max(0, totalBookings - confirmed)
  const todayBookings = stats?.todayBookings ?? 0

  return (
    <>
      <div className="section-title">Bookings</div>
      <div className="section-sub">
        Reservations from <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/stays/stats</code> and{' '}
        <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/stays/bookings</code>
      </div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card p">
          <div className="stat-label">BOOKINGS TODAY</div>
          <div className="stat-val">{loading ? '…' : todayBookings}</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">CONFIRMED (STATS)</div>
          <div className="stat-val">{loading ? '…' : confirmed}</div>
        </div>
        <div className="stat-card y">
          <div className="stat-label">PENDING / OTHER</div>
          <div className="stat-val">{loading ? '…' : pending}</div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-hdr">
          <div className="card-title">Recent bookings</div>
          <button type="button" className="btn btn-dark btn-sm" onClick={() => load()}>
            Refresh
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Listing</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>
                    No bookings
                  </td>
                </tr>
              )}
              {!loading &&
                bookings.map((b) => (
                  <tr key={b.id ?? `${b.created_at}-${b.guest?.full_name}`}>
                    <td>
                      <div className="user-name">{b.guest?.full_name || '—'}</div>
                      <div className="user-id td-muted">{b.guest?.phone_number || '—'}</div>
                    </td>
                    <td>{b.listing?.title || '—'}</td>
                    <td>
                      <span className="badge badge-b">{b.status || '—'}</span>
                    </td>
                    <td>{b.total_paid != null ? `${Number(b.total_paid).toLocaleString()} MAD` : '—'}</td>
                    <td className="td-muted">{b.created_at ? new Date(b.created_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
