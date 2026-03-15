export function GoDashboard() {
  return (
    <>
      <div className="section-title">Go Dashboard</div>
      <div className="section-sub">Rides + delivery overview · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/go/*</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card v"><div className="stat-label">RIDES TODAY</div><div className="stat-val">1,847</div><div className="stat-sub"><span className="stat-trend trend-up">↑ 12%</span></div></div>
        <div className="stat-card o"><div className="stat-label">DELIVERIES TODAY</div><div className="stat-val">3,204</div></div>
        <div className="stat-card y"><div className="stat-label">ACTIVE DRIVERS</div><div className="stat-val">284</div></div>
        <div className="stat-card g"><div className="stat-label">GO REVENUE MTD</div><div className="stat-val">1.26M MAD</div></div>
      </div>
    </>
  )
}
