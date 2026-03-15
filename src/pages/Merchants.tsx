export function Merchants() {
  return (
    <>
      <div className="section-title">Merchants</div>
      <div className="section-sub">Restaurants & stores</div>
      <div className="alert alert-y">
        Merchant list API (<code>GET /admin/go/merchants</code> or <code>GET /go/delivery/merchants</code>) is not implemented yet. Delivery orders are available under Delivery.
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card o"><div className="stat-label">ACTIVE MERCHANTS</div><div className="stat-val">—</div></div>
        <div className="stat-card g"><div className="stat-label">ORDERS TODAY</div><div className="stat-val">—</div><div className="stat-sub">See Delivery page</div></div>
        <div className="stat-card y"><div className="stat-label">PENDING ONBOARDING</div><div className="stat-val">—</div></div>
      </div>
    </>
  )
}
