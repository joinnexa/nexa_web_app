export function Wallets() {
  return (
    <>
      <div className="section-title">Wallets</div>
      <div className="section-sub">Double-entry ledger · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/wallets</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card y"><div className="stat-label">TOTAL FLOAT</div><div className="stat-val">12.4M MAD</div><div className="stat-sub">In all wallets</div></div>
        <div className="stat-card g"><div className="stat-label">ACTIVE WALLETS</div><div className="stat-val">38,412</div></div>
        <div className="stat-card b"><div className="stat-label">AVG BALANCE</div><div className="stat-val">322 MAD</div></div>
      </div>
    </>
  )
}
