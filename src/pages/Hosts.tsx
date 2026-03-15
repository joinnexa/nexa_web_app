export function Hosts() {
  return (
    <>
      <div className="section-title">Hosts</div>
      <div className="section-sub">Host verification · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/admin/stays/hosts</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card p"><div className="stat-label">VERIFIED HOSTS</div><div className="stat-val">128</div></div>
        <div className="stat-card y"><div className="stat-label">PENDING REVIEW</div><div className="stat-val">5</div></div>
        <div className="stat-card g"><div className="stat-label">AVG LISTINGS/HOST</div><div className="stat-val">1.4</div></div>
      </div>
    </>
  )
}
