export function Settlements() {
  return (
    <>
      <div className="section-title">Settlements</div>
      <div className="section-sub">Driver, courier, and merchant payouts</div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card y"><div className="stat-label">PENDING PAYOUTS</div><div className="stat-val">284,000 MAD</div><div className="stat-sub">Next batch: Tuesday</div></div>
        <div className="stat-card g"><div className="stat-label">SETTLED THIS WEEK</div><div className="stat-val">1.2M MAD</div></div>
        <div className="stat-card v"><div className="stat-label">RECIPIENTS</div><div className="stat-val">2,754</div><div className="stat-sub">Drivers + couriers + merchants</div></div>
      </div>
    </>
  )
}
