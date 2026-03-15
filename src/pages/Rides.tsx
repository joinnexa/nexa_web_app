export function Rides() {
  return (
    <>
      <div className="section-title">Rides — Nexa Go</div>
      <div className="section-sub">Live taxi operations from <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/go/rides</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card v"><div className="stat-label">ACTIVE RIDES</div><div className="stat-val">142</div><div className="stat-sub">Right now</div></div>
        <div className="stat-card g"><div className="stat-label">COMPLETED TODAY</div><div className="stat-val">1,847</div><div className="stat-sub"><span className="stat-trend trend-up">↑ 12%</span></div></div>
        <div className="stat-card y"><div className="stat-label">DRIVERS ONLINE</div><div className="stat-val">284</div><div className="stat-sub">Casablanca zone</div></div>
        <div className="stat-card r"><div className="stat-label">CANCELLATION RATE</div><div className="stat-val">4.2%</div><div className="stat-sub"><span className="stat-trend trend-dn">↑ 0.8%</span> vs avg</div></div>
      </div>
      <div className="row">
        <div className="col-2">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Live Ride Feed</div><span className="badge badge-g" style={{ marginLeft: 'auto' }}>● Live</span></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Ride ID</th><th>Passenger</th><th>Driver</th><th>Route</th><th>Type</th><th>Fare</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td className="td-mono">RD-9918</td><td>Karim M.</td><td>Omar K.</td><td>Maârif → Morocco Mall</td><td><span className="badge badge-v">Economy</span></td><td>42 MAD</td><td><span className="badge badge-g">In Progress</span></td></tr>
                  <tr><td className="td-mono">RD-9917</td><td>Sara B.</td><td>Hassan L.</td><td>Anfa → Ain Diab</td><td><span className="badge badge-y">Comfort</span></td><td>68 MAD</td><td><span className="badge badge-b">Pickup</span></td></tr>
                  <tr><td className="td-mono">RD-9916</td><td>Youssef A.</td><td>Ali M.</td><td>Derb Sultan → CFC</td><td><span className="badge badge-v">Economy</span></td><td>35 MAD</td><td><span className="badge badge-g">Completed</span></td></tr>
                  <tr><td className="td-mono">RD-9915</td><td>Fatima Z.</td><td>—</td><td>Hay Hassani → Centre</td><td><span className="badge badge-v">Moto</span></td><td>18 MAD</td><td><span className="badge badge-y">Searching</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-1">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-hdr"><div className="card-title">Driver Zones</div></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[{ zone: 'Maârif', drivers: 84, pct: 84, c: 'var(--g)' }, { zone: 'Ain Diab', drivers: 62, pct: 62, c: 'var(--y)' }, { zone: 'Anfa', drivers: 48, pct: 48, c: 'var(--b)' }, { zone: 'Derb Sultan', drivers: 22, pct: 22, c: 'var(--r)' }, { zone: 'Sidi Maarouf', drivers: 12, pct: 12, c: 'var(--mid)' }].map(({ zone, drivers, pct, c }) => (
                  <div key={zone}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{zone}</span><span style={{ color: c, fontWeight: 700 }}>{drivers} drivers</span></div>
                    <div className="progress"><div className="progress-fill" style={{ width: `${pct}%`, background: c }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
