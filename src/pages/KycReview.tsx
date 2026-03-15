export function KycReview() {
  return (
    <>
      <div className="section-title">KYC Review</div>
      <div className="section-sub">Pending identity verifications from <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/pay/admin/kyc/applications</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card y"><div className="stat-label">PENDING REVIEW</div><div className="stat-val">12</div><div className="stat-sub">Awaiting admin action</div></div>
        <div className="stat-card g"><div className="stat-label">APPROVED TODAY</div><div className="stat-val">28</div><div className="stat-sub"><span className="stat-trend trend-up">↑ 8</span> vs yesterday</div></div>
        <div className="stat-card r"><div className="stat-label">REJECTED TODAY</div><div className="stat-val">4</div><div className="stat-sub">Blurry docs or mismatch</div></div>
        <div className="stat-card b"><div className="stat-label">AVG REVIEW TIME</div><div className="stat-val">4.2h</div><div className="stat-sub">Target: &lt; 24h</div></div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Pending Applications</div>
          <div className="card-actions">
            <div className="tabs"><button type="button" className="tab active">All</button><button type="button" className="tab">CIN</button><button type="button" className="tab">Passport</button><button type="button" className="tab">License</button></div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Applicant</th><th>Document</th><th>Doc Type</th><th>OCR</th><th>Selfie</th><th>Submitted</th><th>Risk</th><th>Actions</th></tr></thead>
            <tbody>
              <tr><td><div className="user-cell"><div className="av av-y">K</div><div><div className="user-name">Karim Mansouri</div><div className="user-id">USR-8841</div></div></div></td><td className="td-mono">CIN BE123456</td><td><span className="badge badge-n">National ID</span></td><td><span className="badge badge-g">Passed</span></td><td><span className="badge badge-y">Pending</span></td><td className="td-muted">2h ago</td><td><span className="badge badge-g">Low</span></td><td><div style={{ display: 'flex', gap: 5 }}><button type="button" className="btn btn-g btn-sm">Approve</button><button type="button" className="btn btn-r btn-sm">Reject</button></div></td></tr>
              <tr><td><div className="user-cell"><div className="av av-v">S</div><div><div className="user-name">Sara Benali</div><div className="user-id">USR-8842</div></div></div></td><td className="td-mono">PP AB9876543</td><td><span className="badge badge-b">Passport</span></td><td><span className="badge badge-g">Passed</span></td><td><span className="badge badge-g">Passed</span></td><td className="td-muted">4h ago</td><td><span className="badge badge-g">Low</span></td><td><div style={{ display: 'flex', gap: 5 }}><button type="button" className="btn btn-g btn-sm">Approve</button><button type="button" className="btn btn-r btn-sm">Reject</button></div></td></tr>
              <tr><td><div className="user-cell"><div className="av av-p">A</div><div><div className="user-name">Ahmed Fassi</div><div className="user-id">USR-8843</div></div></div></td><td className="td-mono">CIN CD456789</td><td><span className="badge badge-n">National ID</span></td><td><span className="badge badge-r">Failed</span></td><td><span className="badge badge-r">Mismatch</span></td><td className="td-muted">6h ago</td><td><span className="badge badge-r">High</span></td><td><div style={{ display: 'flex', gap: 5 }}><button type="button" className="btn btn-ghost btn-sm">Review</button><button type="button" className="btn btn-r btn-sm">Reject</button></div></td></tr>
              <tr><td><div className="user-cell"><div className="av av-g">N</div><div><div className="user-name">Nadia Chraibi</div><div className="user-id">USR-8844</div></div></div></td><td className="td-mono">DL M112233</td><td><span className="badge badge-o">License</span></td><td><span className="badge badge-g">Passed</span></td><td><span className="badge badge-g">Passed</span></td><td className="td-muted">8h ago</td><td><span className="badge badge-g">Low</span></td><td><div style={{ display: 'flex', gap: 5 }}><button type="button" className="btn btn-g btn-sm">Approve</button><button type="button" className="btn btn-r btn-sm">Reject</button></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
