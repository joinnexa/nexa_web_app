export function Transactions() {
  return (
    <>
      <div className="section-title">Transactions</div>
      <div className="section-sub">All ledger movements · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/pay/transactions</code> & <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/api/v1/pay/admin</code></div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Transaction Log</div><div className="card-actions"><div className="tabs"><button type="button" className="tab active">All</button><button type="button" className="tab">P2P</button><button type="button" className="tab">QR</button><button type="button" className="tab">Top-up</button><button type="button" className="tab">Withdraw</button></div></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>TXN ID</th><th>From</th><th>To</th><th>Type</th><th>Amount</th><th>Fee</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              <tr><td className="td-mono">TXN-44821</td><td>Karim M.</td><td>Sara B.</td><td><span className="badge badge-b">P2P</span></td><td><strong>500 MAD</strong></td><td>0 MAD</td><td><span className="badge badge-g">Success</span></td><td className="td-muted">2 min ago</td></tr>
              <tr><td className="td-mono">TXN-44820</td><td>Nadia R.</td><td>Bella Bistro</td><td><span className="badge badge-v">QR Pay</span></td><td><strong>73.90 MAD</strong></td><td>1.5 MAD</td><td><span className="badge badge-g">Success</span></td><td className="td-muted">5 min ago</td></tr>
              <tr><td className="td-mono">TXN-44819</td><td>Mohamed T.</td><td>Bank</td><td><span className="badge badge-o">Withdraw</span></td><td><strong>15,000 MAD</strong></td><td>25 MAD</td><td><span className="badge badge-r">Flagged</span></td><td className="td-muted">18 min ago</td></tr>
              <tr><td className="td-mono">TXN-44818</td><td>Top-up</td><td>Youssef A.</td><td><span className="badge badge-g">Top-up</span></td><td><strong>200 MAD</strong></td><td>0 MAD</td><td><span className="badge badge-g">Success</span></td><td className="td-muted">24 min ago</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
