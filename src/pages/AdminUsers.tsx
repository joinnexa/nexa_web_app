export function AdminUsers() {
  return (
    <>
      <div className="section-title">Admin Users</div>
      <div className="section-sub">Staff accounts with dashboard access</div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Admin Accounts</div><div className="card-actions"><button type="button" className="btn btn-dark btn-sm">+ Invite Admin</button></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last Login</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td><div className="user-cell"><div className="av av-y">S</div><div><div className="user-name">Super Admin</div></div></div></td><td className="td-muted">admin@nexa.ma</td><td><span className="badge badge-r">Super Admin</span></td><td className="td-muted">Just now</td><td><span className="badge badge-g">Active</span></td></tr>
              <tr><td><div className="user-cell"><div className="av av-v">C</div><div><div className="user-name">Compliance Officer</div></div></div></td><td className="td-muted">compliance@nexa.ma</td><td><span className="badge badge-v">Compliance</span></td><td className="td-muted">1h ago</td><td><span className="badge badge-g">Active</span></td></tr>
              <tr><td><div className="user-cell"><div className="av av-b">O</div><div><div className="user-name">Go Operations</div></div></div></td><td className="td-muted">ops@nexa.ma</td><td><span className="badge badge-b">Operations</span></td><td className="td-muted">3h ago</td><td><span className="badge badge-g">Active</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
