export function AllUsers() {
  return (
    <>
      <div className="section-title">All Users</div>
      <div className="section-sub">Unified identity — one account across Pay, Go, Stays · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/users</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card v"><div className="stat-label">TOTAL USERS</div><div className="stat-val">38,412</div><div className="stat-sub"><span className="stat-trend trend-up">↑ 24%</span></div></div>
        <div className="stat-card g"><div className="stat-label">KYC VERIFIED</div><div className="stat-val">24,180</div><div className="stat-sub">63% of users</div></div>
        <div className="stat-card y"><div className="stat-label">DRIVERS</div><div className="stat-val">1,842</div><div className="stat-sub">284 online now</div></div>
        <div className="stat-card o"><div className="stat-label">COURIERS</div><div className="stat-val">912</div><div className="stat-sub">412 active today</div></div>
      </div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">User Directory</div><div className="card-actions"><div className="tabs"><button type="button" className="tab active">All</button><button type="button" className="tab">Consumers</button><button type="button" className="tab">Drivers</button><button type="button" className="tab">Couriers</button><button type="button" className="tab">Hosts</button></div></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Roles</th><th>KYC</th><th>Wallet Balance</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr><td><div className="user-cell"><div className="av av-y">K</div><div><div className="user-name">Karim Mansouri</div><div className="user-id">+212612345678</div></div></div></td><td><span className="badge badge-n">Consumer</span></td><td><span className="badge badge-g">Verified</span></td><td>1,240 MAD</td><td className="td-muted">Jan 2025</td><td><span className="badge badge-g">Active</span></td><td><button type="button" className="btn btn-ghost btn-sm">View</button></td></tr>
              <tr><td><div className="user-cell"><div className="av av-v">O</div><div><div className="user-name">Omar Khalil</div><div className="user-id">+212677889900</div></div></div></td><td><span className="badge badge-v">Driver</span></td><td><span className="badge badge-g">Verified</span></td><td>3,850 MAD</td><td className="td-muted">Mar 2024</td><td><span className="badge badge-g">Active</span></td><td><button type="button" className="btn btn-ghost btn-sm">View</button></td></tr>
              <tr><td><div className="user-cell"><div className="av av-o">Y</div><div><div className="user-name">Youssef Amrani</div><div className="user-id">+212655443322</div></div></div></td><td><span className="badge badge-o">Courier</span></td><td><span className="badge badge-g">Verified</span></td><td>920 MAD</td><td className="td-muted">Jun 2024</td><td><span className="badge badge-g">Active</span></td><td><button type="button" className="btn btn-ghost btn-sm">View</button></td></tr>
              <tr><td><div className="user-cell"><div className="av av-p">H</div><div><div className="user-name">Hassan Berrada</div><div className="user-id">+212644332211</div></div></div></td><td><span className="badge badge-p">Host</span></td><td><span className="badge badge-y">Pending</span></td><td>—</td><td className="td-muted">Feb 2025</td><td><span className="badge badge-y">Review</span></td><td><button type="button" className="btn btn-ghost btn-sm">View</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
