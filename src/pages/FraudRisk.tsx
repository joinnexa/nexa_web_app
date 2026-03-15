export function FraudRisk() {
  return (
    <>
      <div className="section-title">Fraud & Risk</div>
      <div className="section-sub">Alerts from the Nexa Pay risk engine · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/pay/admin</code></div>
      <div className="alert alert-r" style={{ marginBottom: 20 }}>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={17} x2={12.01} y2={17} />
        </svg>
        <strong>3 CRITICAL alerts</strong> require immediate action. Accounts have been auto-frozen pending review.
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card r"><div className="stat-label">CRITICAL</div><div className="stat-val">3</div><div className="stat-sub">Auto-frozen accounts</div></div>
        <div className="stat-card y"><div className="stat-label">MEDIUM RISK</div><div className="stat-val">11</div><div className="stat-sub">Under monitoring</div></div>
        <div className="stat-card g"><div className="stat-label">RESOLVED TODAY</div><div className="stat-val">7</div><div className="stat-sub">Cleared by team</div></div>
        <div className="stat-card b"><div className="stat-label">SAR FILINGS</div><div className="stat-val">2</div><div className="stat-sub">This month</div></div>
      </div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Active Fraud Alerts</div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Alert Type</th><th>Amount</th><th>Trigger</th><th>Risk Score</th><th>Account</th><th>Actions</th></tr></thead>
            <tbody>
              <tr><td><div className="user-cell"><div className="av av-o">M</div><div><div className="user-name">Mohamed T.</div><div className="user-id">USR-7721</div></div></div></td><td><span className="badge badge-r">Large Withdraw</span></td><td><strong>15,000 MAD</strong></td><td>Velocity rule — 3x daily avg</td><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="risk-bar" style={{ width: 60 }}><div className="risk-fill" style={{ width: '90%' }} /></div><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--r)' }}>90</span></div></td><td><span className="badge badge-r">Frozen</span></td><td><div style={{ display: 'flex', gap: 5 }}><button type="button" className="btn btn-ghost btn-sm">Review</button><button type="button" className="btn btn-g btn-sm">Unfreeze</button></div></td></tr>
              <tr><td><div className="user-cell"><div className="av av-v">R</div><div><div className="user-name">Rachid K.</div><div className="user-id">USR-6614</div></div></div></td><td><span className="badge badge-r">Multiple P2P</span></td><td><strong>8,200 MAD</strong></td><td>18 transfers in 2 hours</td><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="risk-bar" style={{ width: 60 }}><div className="risk-fill" style={{ width: '78%' }} /></div><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--o)' }}>78</span></div></td><td><span className="badge badge-r">Frozen</span></td><td><div style={{ display: 'flex', gap: 5 }}><button type="button" className="btn btn-ghost btn-sm">Review</button><button type="button" className="btn btn-r btn-sm">Block</button></div></td></tr>
              <tr><td><div className="user-cell"><div className="av av-p">L</div><div><div className="user-name">Laila O.</div><div className="user-id">USR-5503</div></div></div></td><td><span className="badge badge-y">Unusual Login</span></td><td><strong>500 MAD</strong></td><td>New device + new IP</td><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="risk-bar" style={{ width: 60 }}><div className="risk-fill" style={{ width: '45%' }} /></div><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ya)' }}>45</span></div></td><td><span className="badge badge-y">Monitored</span></td><td><div style={{ display: 'flex', gap: 5 }}><button type="button" className="btn btn-ghost btn-sm">Review</button><button type="button" className="btn btn-g btn-sm">Clear</button></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
