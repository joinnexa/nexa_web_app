export function PricingRules() {
  return (
    <>
      <div className="section-title">Pricing Rules</div>
      <div className="section-sub">Fare tables, commissions, surge · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/go/rides/pricing</code></div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Vehicle Type Rates</div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Type</th><th>Base Fare</th><th>Per km</th><th>Per min</th><th>Commission</th><th>Min Fare</th></tr></thead>
            <tbody>
              <tr><td><span className="badge badge-v">Economy</span></td><td>15 MAD</td><td>3.5 MAD</td><td>0.5 MAD</td><td>10%</td><td>20 MAD</td></tr>
              <tr><td><span className="badge badge-y">Comfort</span></td><td>25 MAD</td><td>5.0 MAD</td><td>0.8 MAD</td><td>12%</td><td>35 MAD</td></tr>
              <tr><td><span className="badge badge-o">Moto</span></td><td>8 MAD</td><td>2.0 MAD</td><td>0.3 MAD</td><td>10%</td><td>12 MAD</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
