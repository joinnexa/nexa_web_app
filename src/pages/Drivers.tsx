export function Drivers() {
  return (
    <>
      <div className="section-title">Drivers</div>
      <div className="section-sub">All taxi drivers · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/go/drivers</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card y"><div className="stat-label">TOTAL DRIVERS</div><div className="stat-val">1,842</div></div>
        <div className="stat-card g"><div className="stat-label">ONLINE NOW</div><div className="stat-val">284</div></div>
        <div className="stat-card r"><div className="stat-label">PENDING APPROVAL</div><div className="stat-val">18</div><div className="stat-sub">From /go/registration</div></div>
      </div>
    </>
  )
}
