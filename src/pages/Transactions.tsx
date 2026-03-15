import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { AdminTransaction } from '../api/types'

function timeAgo(iso: string) {
  const d = new Date(iso)
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return d.toLocaleDateString()
}

export function Transactions() {
  const [data, setData] = useState<AdminTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('All')

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    const type = tab !== 'All' ? tab : undefined
    api.TRANSACTIONS.getList({ limit: 50, type })
      .then((res) => {
        const items = Array.isArray(res) ? res : (res as { data?: AdminTransaction[] }).data ?? []
        setData(items)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => { load() }, [load])

  return (
    <>
      <div className="section-title">Transactions</div>
      <div className="section-sub">All ledger movements · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/transactions</code></div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Transaction Log</div>
          <div className="card-actions">
            <div className="tabs">
              {['All', 'P2P', 'QR', 'Top-up', 'Withdraw'].map((t) => (
                <button key={t} type="button" className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>TXN ID</th><th>From</th><th>To</th><th>Type</th><th>Amount</th><th>Fee</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
              {!loading && data.length === 0 && <tr><td colSpan={8} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>No transactions</td></tr>}
              {!loading && data.map((t) => (
                <tr key={t.id}>
                  <td className="td-mono">{t.reference || t.id.slice(0, 8)}</td>
                  <td className="td-muted">{t.sender_phone || t.sender_user_id?.slice(0, 8) || '—'}</td>
                  <td className="td-muted">{t.receiver_phone || t.receiver_user_id?.slice(0, 8) || '—'}</td>
                  <td><span className="badge badge-b">{t.type || '—'}</span></td>
                  <td><strong>{Number(t.amount).toLocaleString()} MAD</strong></td>
                  <td>{t.fee != null ? `${Number(t.fee).toLocaleString()} MAD` : '—'}</td>
                  <td><span className={`badge ${t.status === 'COMPLETED' ? 'badge-g' : t.status === 'FAILED' ? 'badge-r' : 'badge-y'}`}>{t.status}</span></td>
                  <td className="td-muted">{timeAgo(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
