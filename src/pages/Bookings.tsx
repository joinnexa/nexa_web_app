export function Bookings() {
  return (
    <>
      <div className="section-title">Bookings</div>
      <div className="section-sub">All reservations · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/admin/stays/bookings</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card p"><div className="stat-label">BOOKINGS MTD</div><div className="stat-val">284</div></div>
        <div className="stat-card g"><div className="stat-label">CONFIRMED</div><div className="stat-val">241</div></div>
        <div className="stat-card y"><div className="stat-label">PENDING</div><div className="stat-val">43</div></div>
      </div>
    </>
  )
}
