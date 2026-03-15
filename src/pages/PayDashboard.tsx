export function PayDashboard() {
  return (
    <>
      <div className="section-title">Nexa Pay Dashboard</div>
      <div className="section-sub">Wallet operations, P2P, QR/NFC, settlements · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/pay/*</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card y"><div className="stat-label">VOLUME TODAY</div><div className="stat-val">840K MAD</div><div className="stat-sub"><span className="stat-trend trend-up">↑ 18%</span></div></div>
        <div className="stat-card g"><div className="stat-label">P2P TRANSFERS</div><div className="stat-val">4,812</div><div className="stat-sub">Today</div></div>
        <div className="stat-card b"><div className="stat-label">QR PAYMENTS</div><div className="stat-val">1,240</div><div className="stat-sub">Active merchants: 84</div></div>
        <div className="stat-card v"><div className="stat-label">TOTAL WALLETS</div><div className="stat-val">38,412</div><div className="stat-sub">Double-entry ledger</div></div>
      </div>
      <div className="alert alert-y">
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx={12} cy={12} r={10} /><line x1={12} y1={8} x2={12} y2={12} /><line x1={12} y1={16} x2={12.01} y2={16} /></svg>
        NFC payments are <strong>disabled</strong> (hardware integration pending). Enable in Config → Feature Flags.
      </div>
    </>
  )
}
