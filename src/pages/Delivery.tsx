import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

interface OrderRow {
  id: string
  customer_name?: string | null
  merchant_name?: string | null
  status?: string
  total_amount?: number | null
  created_at?: string
}

export function Delivery() {
  const [stats, setStats] = useState<{ deliveriesToday?: number; activeOrdersToday?: number; couriersOnline?: number } | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(() => {
    api.GO.getStats().then(setStats).catch(() => setStats(null))
  }, [])

  const loadOrders = useCallback(() => {
    setLoading(true)
    setError(null)
    api.GO.getDeliveryOrders({ page, limit: 20, status: statusFilter || undefined })
      .then((res) => {
        setOrders((res?.data ?? []) as OrderRow[])
        setTotal(res?.total ?? 0)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load orders'))
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { loadOrders() }, [loadOrders])

  return (
    <>
      <div className="section-title">Delivery Operations</div>
      <div className="section-sub">Food & parcel deliveries</div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card o">
          <div className="stat-label">ACTIVE ORDERS TODAY</div>
          <div className="stat-val">{stats?.activeOrdersToday != null ? stats.activeOrdersToday.toLocaleString() : '—'}</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">COMPLETED TODAY</div>
          <div className="stat-val">{stats?.deliveriesToday != null ? stats.deliveriesToday.toLocaleString() : '—'}</div>
        </div>
        <div className="stat-card v">
          <div className="stat-label">COURIERS ONLINE</div>
          <div className="stat-val">{stats?.couriersOnline != null ? stats.couriersOnline : '—'}</div>
        </div>
        <div className="stat-card y">
          <div className="stat-label">ORDERS (this page)</div>
          <div className="stat-val">{orders.length}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Delivery Orders</div>
          <div className="card-actions">
            <div className="tabs">
              <button type="button" className={`tab ${!statusFilter ? 'active' : ''}`} onClick={() => setStatusFilter('')}>All</button>
              <button type="button" className={`tab ${statusFilter === 'DELIVERED' ? 'active' : ''}`} onClick={() => setStatusFilter('DELIVERED')}>Delivered</button>
              <button type="button" className={`tab ${statusFilter === 'CREATED' ? 'active' : ''}`} onClick={() => setStatusFilter('CREATED')}>Created</button>
            </div>
            <button type="button" className="btn btn-dark btn-sm" onClick={loadOrders} disabled={loading}>Refresh</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Merchant</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {loading && orders.length === 0 && <tr><td colSpan={5} className="td-muted" style={{ padding: 16 }}>Loading…</td></tr>}
              {!loading && orders.length === 0 && <tr><td colSpan={5} className="td-muted" style={{ padding: 16 }}>No orders</td></tr>}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="td-mono">{o.id.slice(0, 8)}…</td>
                  <td>{o.customer_name ?? '—'}</td>
                  <td>{o.merchant_name ?? '—'}</td>
                  <td>{o.total_amount != null ? `${o.total_amount} MAD` : '—'}</td>
                  <td><span className={`badge badge-${o.status === 'DELIVERED' ? 'g' : 'y'}`}>{o.status ?? '—'}</span></td>
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
