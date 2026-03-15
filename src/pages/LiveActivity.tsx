import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

function timeAgo(iso: string) {
  const d = new Date(iso)
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return d.toLocaleDateString()
}

function eventIcon(type: string, product: string) {
  if (type.includes('ride')) return '🚖'
  if (type.includes('delivery') || type.includes('order')) return '🛵'
  if (type.includes('kyc')) return '✓'
  if (type.includes('booking')) return '🏠'
  if (type.includes('fraud') || type.includes('audit')) return '⚠'
  if (product === 'go') return '🚗'
  if (product === 'stays') return '🏠'
  return '•'
}

function eventBg(product: string) {
  if (product === 'go') return 'var(--ys)'
  if (product === 'stays') return 'var(--ps)'
  return 'var(--gs)'
}

function eventText(ev: { type: string; payload: Record<string, unknown> }): string {
  const p = ev.payload
  if (ev.type === 'ride_completed' || ev.type === 'ride_created')
    return `${p.rideId ?? 'Ride'} ${ev.type === 'ride_completed' ? 'completed' : ''} — ${p.amount != null ? `${p.amount} MAD` : ''} — ${[p.from, p.to].filter(Boolean).join(' → ')}`
  if (ev.type === 'delivery_delivered' || ev.type === 'order_created')
    return `${p.orderId ?? 'Order'} ${ev.type === 'delivery_delivered' ? 'delivered' : 'created'} — ${p.customer ?? ''} · ${p.merchant ?? ''}`
  if (ev.type === 'kyc_approved' || ev.type === 'kyc_rejected')
    return `KYC ${ev.type === 'kyc_approved' ? 'approved' : 'rejected'} — ${p.userName ?? p.user_id ?? ''}`
  if (ev.type === 'booking_confirmed') return `Booking confirmed — ${p.amount != null ? `${p.amount} MAD` : ''}`
  if (ev.type === 'fraud_alert') return `Fraud alert — ${p.entity_id ?? ''}`
  return `${ev.type} — ${p.entity_id ?? p.entity_type ?? ''}`
}

export function LiveActivity() {
  const [events, setEvents] = useState<Array<{ id: string; type: string; product: string; payload: Record<string, unknown>; created_at: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.ACTIVITY.getRecent({ limit: 50 })
      .then((res) => setEvents(res?.events ?? []))
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load activity'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <>
      <div className="section-title">Live Activity</div>
      <div className="section-sub">Recent events from Pay, Go, and Stays</div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Event Stream</div>
          <span className="badge badge-g" style={{ marginLeft: 'auto' }}>● Live</span>
          <button type="button" className="btn btn-dark btn-sm" style={{ marginLeft: 8 }} onClick={load} disabled={loading}>Refresh</button>
        </div>
        <div className="card-body">
          {loading && events.length === 0 && <div className="td-muted" style={{ padding: 16 }}>Loading…</div>}
          {!loading && events.length === 0 && <div className="td-muted" style={{ padding: 16 }}>No recent events</div>}
          {events.map((ev) => (
            <div key={ev.id} className="feed-item">
              <div className="feed-icon" style={{ background: eventBg(ev.product) }}>{eventIcon(ev.type, ev.product)}</div>
              <div>
                <div className="feed-text">{eventText(ev)}</div>
                <div className="feed-time">{timeAgo(ev.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
