export function AuditLogs() {
  return (
    <>
      <div className="section-title">Audit Logs</div>
      <div className="section-sub">All admin actions — immutable log</div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Recent Actions</div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Action</th><th>Admin</th><th>Target</th><th>IP</th><th>Time</th></tr></thead>
            <tbody>
              <tr><td><span className="badge badge-g">KYC Approved</span></td><td>Super Admin</td><td>USR-8841 Fatima Z.</td><td className="td-mono">105.158.x.x</td><td className="td-muted">5 min ago</td></tr>
              <tr><td><span className="badge badge-r">Account Frozen</span></td><td>Compliance</td><td>USR-7721 Mohamed T.</td><td className="td-mono">105.158.x.x</td><td className="td-muted">20 min ago</td></tr>
              <tr><td><span className="badge badge-y">Config Changed</span></td><td>Super Admin</td><td>Surge pricing enabled</td><td className="td-mono">105.158.x.x</td><td className="td-muted">1h ago</td></tr>
              <tr><td><span className="badge badge-v">Host Approved</span></td><td>Go Operations</td><td>HOST-221 Hassan B.</td><td className="td-mono">105.158.x.x</td><td className="td-muted">2h ago</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
