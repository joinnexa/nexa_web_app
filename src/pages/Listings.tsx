export function Listings() {
  return (
    <>
      <div className="section-title">Listings</div>
      <div className="section-sub">All properties · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/admin/stays/listings</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card p"><div className="stat-label">ACTIVE LISTINGS</div><div className="stat-val">184</div></div>
        <div className="stat-card y"><div className="stat-label">PENDING APPROVAL</div><div className="stat-val">9</div></div>
        <div className="stat-card r"><div className="stat-label">REPORTED</div><div className="stat-val">2</div></div>
      </div>
    </>
  )
}
