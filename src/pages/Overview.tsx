import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { AdminTransaction } from '../api/types'
import { useDashboardStats } from '../hooks/useDashboardStats'

function timeAgo(iso: string) {
  const d = new Date(iso)
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return d.toLocaleDateString()
}

function formatVolume(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(n)
}

export function Overview() {
  const { pay, stays, loading, error } = useDashboardStats()
  const [recentTx, setRecentTx] = useState<AdminTransaction[]>([])
  const flagged = pay?.flaggedTransactions ?? 0
  const pendingKyc = pay?.pendingKyc ?? 0

  useEffect(() => {
    api.TRANSACTIONS.getList({ limit: 5 })
      .then((data) => setRecentTx(Array.isArray(data) ? data : (data as { data?: AdminTransaction[] }).data ?? []))
      .catch(() => {})
  }, [])

  if (loading && !pay) {
    return (
      <>
        <div className="section-title">Ecosystem Overview</div>
        <div className="section-sub">Loading…</div>
      </>
    )
  }
  if (error && !pay) {
    return (
      <>
        <div className="section-title">Ecosystem Overview</div>
        <div className="alert alert-r">{error}</div>
      </>
    )
  }

  return (
    <>
      <div className="section-title">Ecosystem Overview</div>
      <div className="section-sub">All products — Nexa Pay · Nexa Go · Nexa Stays — real-time summary</div>

      {flagged > 0 && (
        <div className="alert alert-r">
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={17} x2={12.01} y2={17} />
          </svg>
          <strong>{flagged} fraud alert{flagged !== 1 ? 's' : ''}</strong> — high-value transfers flagged for review.
          <Link to="/fraud" className="btn btn-r btn-sm" style={{ marginLeft: 'auto' }}>Review Now</Link>
        </div>
      )}
      {pendingKyc > 0 && (
        <div className="alert alert-y">
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <circle cx={12} cy={12} r={10} /><line x1={12} y1={8} x2={12} y2={12} /><line x1={12} y1={16} x2={12.01} y2={16} />
          </svg>
          <strong>{pendingKyc} KYC application{pendingKyc !== 1 ? 's' : ''}</strong> pending review.
          <Link to="/kyc" className="btn btn-y btn-sm" style={{ marginLeft: 'auto' }}>Review KYC</Link>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card y">
          <div className="stat-icon si-y">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1={12} y1={1} x2={12} y2={23} /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-label">TOTAL VOLUME (MTD)</div>
          <div className="stat-val">{pay ? formatVolume(pay.dailyVolume) : '—'} <span style={{ fontSize: 14, color: 'var(--mid)' }}>MAD</span></div>
          <div className="stat-sub"><span className="stat-trend trend-up">Daily</span> volume</div>
        </div>
        <div className="stat-card v">
          <div className="stat-icon si-v">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx={9} cy={7} r={4} /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-label">TOTAL USERS</div>
          <div className="stat-val">{pay?.totalUsers != null ? pay.totalUsers.toLocaleString() : '—'}</div>
          <div className="stat-sub">Verified: {pay?.verifiedUsers != null ? pay.verifiedUsers.toLocaleString() : '—'}</div>
        </div>
        <div className="stat-card g">
          <div className="stat-icon si-g">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <rect x={1} y={3} width={15} height={13} rx={2} /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx={5.5} cy={18.5} r={2.5} /><circle cx={18.5} cy={18.5} r={2.5} />
            </svg>
          </div>
          <div className="stat-label">RIDES TODAY</div>
          <div className="stat-val">—</div>
          <div className="stat-sub">No API yet</div>
        </div>
        <div className="stat-card b">
          <div className="stat-icon si-b">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <div className="stat-label">STAYS BOOKINGS (MTD)</div>
          <div className="stat-val">{stays?.bookingsMtd != null ? stays.bookingsMtd.toLocaleString() : '—'}</div>
          <div className="stat-sub">Listings: {stays?.activeListings ?? '—'}</div>
        </div>
        <div className="stat-card o">
          <div className="stat-icon si-o">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M5 12H3l4-9h10l4 9h-2" /><path d="M3 12h18v9H3z" />
            </svg>
          </div>
          <div className="stat-label">DELIVERIES TODAY</div>
          <div className="stat-val">—</div>
          <div className="stat-sub">No API yet</div>
        </div>
        <div className="stat-card p">
          <div className="stat-icon si-p">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <rect x={2} y={3} width={20} height={14} rx={2} /><line x1={8} y1={21} x2={16} y2={21} /><line x1={12} y1={17} x2={12} y2={21} />
            </svg>
          </div>
          <div className="stat-label">KYC PENDING</div>
          <div className="stat-val">{pay?.pendingKyc != null ? pay.pendingKyc : '—'}</div>
          <div className="stat-sub">Awaiting review</div>
        </div>
        <div className="stat-card r">
          <div className="stat-icon si-r">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="stat-label">FRAUD ALERTS</div>
          <div className="stat-val">{pay?.flaggedTransactions != null ? pay.flaggedTransactions : '—'}</div>
          <div className="stat-sub">{flagged > 0 ? 'Needs review' : 'Clear'}</div>
        </div>
        <div className="stat-card y">
          <div className="stat-icon si-y">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="stat-label">API</div>
          <div className="stat-val">{pay?.systemStatus?.api === 'healthy' ? 'OK' : '—'}</div>
          <div className="stat-sub">{pay?.successRate != null ? `${pay.successRate}% success` : 'Health'}</div>
        </div>
      </div>

      <div className="row">
        <div className="col-2">
          <div className="card">
            <div className="card-hdr">
              <div>
                <div className="card-title">Revenue by Product</div>
                <div className="card-sub">Last 7 days · MAD</div>
              </div>
              <div className="card-actions">
                <div className="tabs">
                  <button type="button" className="tab active">7D</button>
                  <button type="button" className="tab">30D</button>
                  <button type="button" className="tab">3M</button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--mid)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--y)' }} /> Pay
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--mid)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--v)' }} /> Go
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--mid)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--p)' }} /> Stays
                </div>
              </div>
              <div className="chart-bars">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={day} className="bar-wrap">
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 100, gap: 2 }}>
                      <div className="bar" style={{ height: [72, 58, 80, 64, 88, 96, 50][i], background: 'var(--y)', opacity: 0.85 }} />
                      <div className="bar" style={{ height: [38, 44, 52, 48, 60, 70, 36][i], background: 'var(--v)' }} />
                      <div className="bar" style={{ height: [16, 20, 24, 18, 28, 32, 14][i], background: 'var(--p)' }} />
                    </div>
                    <div className="bar-lbl">{day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-1">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-hdr">
              <div>
                <div className="card-title">Volume Split</div>
                <div className="card-sub">By product (MTD)</div>
              </div>
            </div>
            <div className="card-body">
              <svg viewBox="0 0 120 120" width={120} height={120} style={{ display: 'block', margin: '0 auto 16px' }}>
                <circle cx={60} cy={60} r={48} fill="none" stroke="var(--surf2)" strokeWidth={20} />
                <circle cx={60} cy={60} r={48} fill="none" stroke="var(--y)" strokeWidth={20} strokeDasharray="180.96 120.64" strokeDashoffset={-30.16} transform="rotate(-90 60 60)" />
                <circle cx={60} cy={60} r={48} fill="none" stroke="var(--v)" strokeWidth={20} strokeDasharray="90.48 211.12" strokeDashoffset={-211.12} transform="rotate(-90 60 60)" />
                <circle cx={60} cy={60} r={48} fill="none" stroke="var(--p)" strokeWidth={20} strokeDasharray="30.16 271.44" strokeDashoffset={-301.6} transform="rotate(-90 60 60)" />
                <text x={60} y={58} textAnchor="middle" fontSize={14} fontWeight={800} fill="var(--ink)">4.2M</text>
                <text x={60} y={70} textAnchor="middle" fontSize={8} fill="var(--muted)">MAD</text>
              </svg>
              <div className="donut-legend">
                <div className="legend-row"><div className="legend-dot" style={{ background: 'var(--y)' }} /> Pay <div className="legend-val">60%</div></div>
                <div className="legend-row"><div className="legend-dot" style={{ background: 'var(--v)' }} /> Go <div className="legend-val">30%</div></div>
                <div className="legend-row"><div className="legend-dot" style={{ background: 'var(--p)' }} /> Stays <div className="legend-val">10%</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-2">
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Recent Transactions</div>
              <div className="card-actions"><Link to="/transactions" className="btn btn-ghost btn-sm">View all</Link></div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Ref</th><th>Type</th><th>Amount</th><th>Status</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {recentTx.length === 0 && (
                    <tr><td colSpan={5} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>No recent transactions</td></tr>
                  )}
                  {recentTx.map((t) => (
                    <tr key={t.id}>
                      <td className="td-mono">{t.reference || t.id.slice(0, 8)}</td>
                      <td className="td-muted">{t.type || '—'}</td>
                      <td><strong>{Number(t.amount).toLocaleString()} MAD</strong></td>
                      <td><span className={`badge ${t.status === 'COMPLETED' ? 'badge-g' : t.status === 'FAILED' ? 'badge-r' : 'badge-y'}`}>{t.status}</span></td>
                      <td className="td-muted">{timeAgo(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-1">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-hdr"><div className="card-title">Live Activity</div></div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              <div className="feed-item">
                <div className="feed-icon" style={{ background: 'var(--ys)' }}>🚖</div>
                <div><div className="feed-text">Ride completed — Casablanca Maârif</div><div className="feed-time">Just now</div></div>
                <div className="feed-amt" style={{ color: 'var(--g)' }}>+42 MAD</div>
              </div>
              <div className="feed-item">
                <div className="feed-icon" style={{ background: 'var(--gs)' }}>✓</div>
                <div><div className="feed-text">KYC approved — Fatima Z.</div><div className="feed-time">2 min ago</div></div>
              </div>
              <div className="feed-item">
                <div className="feed-icon" style={{ background: 'var(--vs)' }}>🛵</div>
                <div><div className="feed-text">Food delivery — Bella Bistro</div><div className="feed-time">3 min ago</div></div>
                <div className="feed-amt" style={{ color: 'var(--g)' }}>+73 MAD</div>
              </div>
              <div className="feed-item">
                <div className="feed-icon" style={{ background: 'var(--rs)' }}>⚠</div>
                <div><div className="feed-text">Fraud alert — large withdrawal</div><div className="feed-time">18 min ago</div></div>
              </div>
              <div className="feed-item">
                <div className="feed-icon" style={{ background: 'var(--ps)' }}>🏠</div>
                <div><div className="feed-text">New booking — Rabat Villa</div><div className="feed-time">22 min ago</div></div>
                <div className="feed-amt" style={{ color: 'var(--g)' }}>+1,200 MAD</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
