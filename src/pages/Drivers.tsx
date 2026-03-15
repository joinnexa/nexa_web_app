import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

interface DriverRow {
  id: string
  user_id?: string
  full_name?: string | null
  phone_number?: string | null
  vehicle_type?: string
  vehicle_plate?: string
  status?: string
  is_online?: boolean
  created_at?: string
}

export function Drivers() {
  const [list, setList] = useState<DriverRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.DRIVERS.getList({ page, limit: 20, status: statusFilter || undefined })
      .then((res) => {
        const data = (res?.data ?? []) as DriverRow[]
        setList(data)
        setTotal(res?.total ?? 0)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load drivers'))
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])

  const onlineCount = list.filter((d) => d.is_online).length
  const pendingCount = list.filter((d) => d.status === 'PENDING').length

  return (
    <>
      <div className="section-title">Drivers</div>
      <div className="section-sub">All taxi drivers</div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card y">
          <div className="stat-label">TOTAL DRIVERS</div>
          <div className="stat-val">{total > 0 ? total.toLocaleString() : (list.length ? list.length : '—')}</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">ONLINE (this page)</div>
          <div className="stat-val">{onlineCount}</div>
        </div>
        <div className="stat-card r">
          <div className="stat-label">PENDING APPROVAL</div>
          <div className="stat-val">{statusFilter === 'PENDING' ? list.length : pendingCount}</div>
          <div className="stat-sub">Filter by status</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Driver List</div>
          <div className="card-actions">
            <div className="tabs">
              <button type="button" className={`tab ${!statusFilter ? 'active' : ''}`} onClick={() => setStatusFilter('')}>All</button>
              <button type="button" className={`tab ${statusFilter === 'ACTIVE' ? 'active' : ''}`} onClick={() => setStatusFilter('ACTIVE')}>Active</button>
              <button type="button" className={`tab ${statusFilter === 'PENDING' ? 'active' : ''}`} onClick={() => setStatusFilter('PENDING')}>Pending</button>
            </div>
            <button type="button" className="btn btn-dark btn-sm" onClick={load} disabled={loading}>Refresh</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Vehicle</th><th>Status</th><th>Online</th></tr></thead>
            <tbody>
              {loading && list.length === 0 && <tr><td colSpan={5} className="td-muted" style={{ padding: 16 }}>Loading…</td></tr>}
              {!loading && list.length === 0 && <tr><td colSpan={5} className="td-muted" style={{ padding: 16 }}>No drivers</td></tr>}
              {list.map((d) => (
                <tr key={d.id}>
                  <td>{d.full_name ?? '—'}</td>
                  <td className="td-mono">{d.phone_number ?? '—'}</td>
                  <td>{[d.vehicle_type, d.vehicle_plate].filter(Boolean).join(' · ') || '—'}</td>
                  <td><span className={`badge badge-${d.status === 'ACTIVE' ? 'g' : d.status === 'PENDING' ? 'y' : 'r'}`}>{d.status ?? '—'}</span></td>
                  <td>{d.is_online ? <span className="badge badge-g">Online</span> : <span className="td-muted">Offline</span>}</td>
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
    </>
  )
}
