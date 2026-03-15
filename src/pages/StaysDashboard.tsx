export function StaysDashboard() {
  return (
    <>
      <div className="section-title">Nexa Stays</div>
      <div className="section-sub">Listings, bookings, hosts · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/stays/*</code> & <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/admin/stays/*</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card p"><div className="stat-label">ACTIVE LISTINGS</div><div className="stat-val">184</div><div className="stat-sub"><span className="stat-trend trend-up">↑ 12</span> this week</div></div>
        <div className="stat-card g"><div className="stat-label">BOOKINGS MTD</div><div className="stat-val">284</div><div className="stat-sub"><span className="stat-trend trend-up">↑ 31%</span></div></div>
        <div className="stat-card y"><div className="stat-label">HOSTS PENDING</div><div className="stat-val">5</div><div className="stat-sub">Verification needed</div></div>
        <div className="stat-card b"><div className="stat-label">REVENUE MTD</div><div className="stat-val">420K MAD</div><div className="stat-sub">Platform fees</div></div>
      </div>
      <div className="row">
        <div className="col-2">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Recent Bookings</div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Booking</th><th>Guest</th><th>Property</th><th>Dates</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td className="td-mono">STY-4421</td><td>Karim M.</td><td>Rabat City Villa</td><td>Mar 20–25</td><td><strong>3,600 MAD</strong></td><td><span className="badge badge-g">Confirmed</span></td></tr>
                  <tr><td className="td-mono">STY-4420</td><td>Sara B.</td><td>Marrakech Riad</td><td>Mar 18–20</td><td><strong>2,400 MAD</strong></td><td><span className="badge badge-y">Pending</span></td></tr>
                  <tr><td className="td-mono">STY-4419</td><td>Ahmed F.</td><td>Casablanca Penthouse</td><td>Mar 15–17</td><td><strong>1,800 MAD</strong></td><td><span className="badge badge-g">Checked In</span></td></tr>
                  <tr><td className="td-mono">STY-4418</td><td>Nadia R.</td><td>Agadir Beach Apt</td><td>Mar 12–15</td><td><strong>2,100 MAD</strong></td><td><span className="badge badge-g">Completed</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-1">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-hdr"><div className="card-title">Host Approvals</div><span className="badge badge-y" style={{ marginLeft: 'auto' }}>5 pending</span></div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              <div className="feed-item"><div className="feed-icon" style={{ background: 'var(--ps)' }}>🏠</div><div><div className="feed-text" style={{ fontWeight: 700 }}>Hassan Berrada</div><div className="feed-time">3 listings · Marrakech</div></div><button type="button" className="btn btn-g btn-sm">Approve</button></div>
              <div className="feed-item"><div className="feed-icon" style={{ background: 'var(--ps)' }}>🏠</div><div><div className="feed-text" style={{ fontWeight: 700 }}>Zineb Tahiri</div><div className="feed-time">1 listing · Agadir</div></div><button type="button" className="btn btn-g btn-sm">Approve</button></div>
              <div className="feed-item"><div className="feed-icon" style={{ background: 'var(--rs)' }}>⚠</div><div><div className="feed-text" style={{ fontWeight: 700 }}>Omar Alami</div><div className="feed-time">Docs incomplete</div></div><button type="button" className="btn btn-r btn-sm">Reject</button></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
