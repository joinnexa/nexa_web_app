export function Merchants() {
  return (
    <>
      <div className="section-title">Merchants</div>
      <div className="section-sub">Restaurants & stores · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/go/delivery/merchants</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card o"><div className="stat-label">ACTIVE MERCHANTS</div><div className="stat-val">214</div></div>
        <div className="stat-card g"><div className="stat-label">ORDERS TODAY</div><div className="stat-val">3,204</div></div>
        <div className="stat-card y"><div className="stat-label">PENDING ONBOARDING</div><div className="stat-val">8</div></div>
      </div>
    </>
  )
}
