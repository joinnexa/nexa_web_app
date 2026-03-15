export function LiveActivity() {
  return (
    <>
      <div className="section-title">Live Activity</div>
      <div className="section-sub">Real-time stream from all Nexa services</div>
      <div className="alert alert-g">
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        All 3 services healthy · NestJS at <code>/api/v1</code> · 99.8% uptime
      </div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Event Stream</div><span className="badge badge-g" style={{ marginLeft: 'auto' }}>● Streaming</span></div>
        <div className="card-body">
          <div className="feed-item"><div className="feed-icon" style={{ background: 'var(--ys)' }}>🚖</div><div><div className="feed-text">RD-9918 completed — 42 MAD — Maârif → Morocco Mall</div><div className="feed-time">just now</div></div></div>
          <div className="feed-item"><div className="feed-icon" style={{ background: 'var(--gs)' }}>✓</div><div><div className="feed-text">KYC approved — Fatima Zahra (USR-8841)</div><div className="feed-time">1 min ago</div></div></div>
          <div className="feed-item"><div className="feed-icon" style={{ background: 'var(--vs)' }}>🛵</div><div><div className="feed-text">DL-8841 picked up — Bella Bistro → Anfa</div><div className="feed-time">2 min ago</div></div></div>
          <div className="feed-item"><div className="feed-icon" style={{ background: 'var(--ps)' }}>🏠</div><div><div className="feed-text">STY-4421 confirmed — Rabat City Villa · 3,600 MAD</div><div className="feed-time">5 min ago</div></div></div>
          <div className="feed-item"><div className="feed-icon" style={{ background: 'var(--rs)' }}>⚠</div><div><div className="feed-text">Fraud alert — USR-7721 large withdrawal flagged</div><div className="feed-time">18 min ago</div></div></div>
        </div>
      </div>
    </>
  )
}
