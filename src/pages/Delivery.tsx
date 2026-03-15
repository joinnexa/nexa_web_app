export function Delivery() {
  return (
    <>
      <div className="section-title">Delivery Operations</div>
      <div className="section-sub">Food & parcel deliveries · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/go/delivery/orders</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card o"><div className="stat-label">ACTIVE ORDERS</div><div className="stat-val">388</div><div className="stat-sub">Right now</div></div>
        <div className="stat-card g"><div className="stat-label">COMPLETED TODAY</div><div className="stat-val">3,204</div><div className="stat-sub"><span className="stat-trend trend-up">↑ 8%</span></div></div>
        <div className="stat-card v"><div className="stat-label">COURIERS ONLINE</div><div className="stat-val">412</div><div className="stat-sub">Casablanca</div></div>
        <div className="stat-card y"><div className="stat-label">AVG DELIVERY TIME</div><div className="stat-val">24 min</div><div className="stat-sub">Target: &lt; 30 min</div></div>
      </div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Active Delivery Orders</div><div className="card-actions"><div className="tabs"><button type="button" className="tab active">All</button><button type="button" className="tab">Food</button><button type="button" className="tab">Parcels</button></div></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Merchant</th><th>Courier</th><th>Type</th><th>ETA</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td className="td-mono">DL-8841</td><td>Karim M.</td><td>Bella Bistro</td><td>Youssef A.</td><td><span className="badge badge-o">Food</span></td><td>8 min</td><td><span className="badge badge-b">En Route</span></td></tr>
              <tr><td className="td-mono">DL-8840</td><td>Sara B.</td><td>Maârif Tech Hub</td><td>Ali K.</td><td><span className="badge badge-y">Parcel</span></td><td>14 min</td><td><span className="badge badge-y">Pickup</span></td></tr>
              <tr><td className="td-mono">DL-8839</td><td>Nadia R.</td><td>Pizza Palace</td><td>—</td><td><span className="badge badge-o">Food</span></td><td>—</td><td><span className="badge badge-r">No Courier</span></td></tr>
              <tr><td className="td-mono">DL-8838</td><td>Ahmed F.</td><td>Burger Hub</td><td>Omar T.</td><td><span className="badge badge-o">Food</span></td><td>22 min</td><td><span className="badge badge-g">Delivered</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
