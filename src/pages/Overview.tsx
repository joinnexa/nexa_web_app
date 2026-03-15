import { Link } from 'react-router-dom'

export function Overview() {
  return (
    <>
      <div className="section-title">Ecosystem Overview</div>
      <div className="section-sub">All products — Nexa Pay · Nexa Go · Nexa Stays — real-time summary</div>

      <div className="alert alert-r">
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={17} x2={12.01} y2={17} />
        </svg>
        <strong>3 fraud alerts</strong> detected in the last hour — high-value transfers flagged for review.
        <Link to="/fraud" className="btn btn-r btn-sm" style={{ marginLeft: 'auto' }}>Review Now</Link>
      </div>
      <div className="alert alert-y">
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <circle cx={12} cy={12} r={10} /><line x1={12} y1={8} x2={12} y2={12} /><line x1={12} y1={16} x2={12.01} y2={16} />
        </svg>
        <strong>12 KYC applications</strong> pending review. Oldest submission: 2 days ago.
        <Link to="/kyc" className="btn btn-y btn-sm" style={{ marginLeft: 'auto' }}>Review KYC</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card y">
          <div className="stat-icon si-y">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1={12} y1={1} x2={12} y2={23} /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-label">TOTAL VOLUME (MTD)</div>
          <div className="stat-val">4.2M <span style={{ fontSize: 14, color: 'var(--mid)' }}>MAD</span></div>
          <div className="stat-sub"><span className="stat-trend trend-up">↑ 18%</span> vs last month</div>
        </div>
        <div className="stat-card v">
          <div className="stat-icon si-v">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx={9} cy={7} r={4} /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-label">TOTAL USERS</div>
          <div className="stat-val">38,412</div>
          <div className="stat-sub"><span className="stat-trend trend-up">↑ 24%</span> +2,140 this week</div>
        </div>
        <div className="stat-card g">
          <div className="stat-icon si-g">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <rect x={1} y={3} width={15} height={13} rx={2} /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx={5.5} cy={18.5} r={2.5} /><circle cx={18.5} cy={18.5} r={2.5} />
            </svg>
          </div>
          <div className="stat-label">RIDES TODAY</div>
          <div className="stat-val">1,847</div>
          <div className="stat-sub"><span className="stat-trend trend-up">↑ 12%</span> vs yesterday</div>
        </div>
        <div className="stat-card b">
          <div className="stat-icon si-b">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <div className="stat-label">STAYS BOOKINGS (MTD)</div>
          <div className="stat-val">284</div>
          <div className="stat-sub"><span className="stat-trend trend-up">↑ 31%</span> new hosts +8</div>
        </div>
        <div className="stat-card o">
          <div className="stat-icon si-o">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M5 12H3l4-9h10l4 9h-2" /><path d="M3 12h18v9H3z" />
            </svg>
          </div>
          <div className="stat-label">DELIVERIES TODAY</div>
          <div className="stat-val">3,204</div>
          <div className="stat-sub"><span className="stat-trend trend-up">↑ 8%</span> 412 couriers active</div>
        </div>
        <div className="stat-card p">
          <div className="stat-icon si-p">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <rect x={2} y={3} width={20} height={14} rx={2} /><line x1={8} y1={21} x2={16} y2={21} /><line x1={12} y1={17} x2={12} y2={21} />
            </svg>
          </div>
          <div className="stat-label">KYC PENDING</div>
          <div className="stat-val">12</div>
          <div className="stat-sub"><span className="stat-trend trend-dn">↑ 3</span> new today</div>
        </div>
        <div className="stat-card r">
          <div className="stat-icon si-r">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="stat-label">FRAUD ALERTS</div>
          <div className="stat-val">3</div>
          <div className="stat-sub"><span className="stat-trend trend-dn">HIGH</span> needs review</div>
        </div>
        <div className="stat-card y">
          <div className="stat-icon si-y">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="stat-label">API UPTIME</div>
          <div className="stat-val">99.8<span style={{ fontSize: 14 }}>%</span></div>
          <div className="stat-sub"><span className="stat-trend trend-up">Healthy</span> 3 services</div>
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
              <div className="card-actions"><button type="button" className="btn btn-ghost btn-sm">View all</button></div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>User</th><th>Type</th><th>Amount</th><th>Product</th><th>Status</th><th>Time</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><div className="user-cell"><div className="av av-y">K</div><div><div className="user-name">Karim M.</div><div className="user-id">+212612345678</div></div></div></td>
                    <td className="td-muted">P2P Send</td><td><strong>500 MAD</strong></td><td><span className="badge badge-y">Pay</span></td><td><span className="badge badge-g">Success</span></td><td className="td-muted">2 min ago</td>
                  </tr>
                  <tr>
                    <td><div className="user-cell"><div className="av av-v">S</div><div><div className="user-name">Sara B.</div><div className="user-id">+212698765432</div></div></div></td>
                    <td className="td-muted">Ride Fare</td><td><strong>42 MAD</strong></td><td><span className="badge badge-v">Go</span></td><td><span className="badge badge-g">Success</span></td><td className="td-muted">5 min ago</td>
                  </tr>
                  <tr>
                    <td><div className="user-cell"><div className="av av-p">Y</div><div><div className="user-name">Youssef A.</div><div className="user-id">+212655443322</div></div></div></td>
                    <td className="td-muted">Booking</td><td><strong>1,200 MAD</strong></td><td><span className="badge badge-p">Stays</span></td><td><span className="badge badge-y">Pending</span></td><td className="td-muted">8 min ago</td>
                  </tr>
                  <tr>
                    <td><div className="user-cell"><div className="av av-b">N</div><div><div className="user-name">Nadia R.</div><div className="user-id">+212677889900</div></div></div></td>
                    <td className="td-muted">QR Pay</td><td><strong>73.90 MAD</strong></td><td><span className="badge badge-y">Pay</span></td><td><span className="badge badge-g">Success</span></td><td className="td-muted">12 min ago</td>
                  </tr>
                  <tr>
                    <td><div className="user-cell"><div className="av av-o">M</div><div><div className="user-name">Mohamed T.</div><div className="user-id">+212644332211</div></div></div></td>
                    <td className="td-muted">Withdraw</td><td><strong>2,000 MAD</strong></td><td><span className="badge badge-y">Pay</span></td><td><span className="badge badge-r">Flagged</span></td><td className="td-muted">18 min ago</td>
                  </tr>
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
