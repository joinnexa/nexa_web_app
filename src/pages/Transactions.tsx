import { useCallback, useEffect, useState } from 'react'
import { api, downloadBlob } from '../api'
import type { AdminTransaction } from '../api/types'

function timeAgo(iso: string) {
  const d = new Date(iso)
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return d.toLocaleDateString()
}

function typeQueryForTab(tab: string): string | undefined {
  if (tab === 'All') return undefined
  if (tab === 'Top-up') return 'TOP_UP'
  if (tab === 'Withdraw') return 'WITHDRAW'
  return tab
}

export function Transactions() {
  const [data, setData] = useState<AdminTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('All')
  const [detail, setDetail] = useState<AdminTransaction | null>(null)
  const [exporting, setExporting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    const type = typeQueryForTab(tab)
    api.TRANSACTIONS.getList({ limit: 50, type })
      .then((res) => {
        const items = Array.isArray(res) ? res : (res as { data?: AdminTransaction[] }).data ?? []
        setData(items)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  const exportCsv = () => {
    const type = typeQueryForTab(tab)
    setExporting(true)
    api.TRANSACTIONS
      .exportCsv({ limit: 5000, type })
      .then((blob) => downloadBlob(blob, 'transactions.csv'))
      .catch((e) => setError(e?.response?.data?.message ?? e.message ?? 'Export failed'))
      .finally(() => setExporting(false))
  }

  const openDetail = (id: string) => {
    api.TRANSACTIONS.getById(id).then(setDetail).catch((e) => setError(e?.response?.data?.message ?? e.message))
  }

  const reverseTxn = (id: string, status?: string) => {
    if (String(status || '').toUpperCase() !== 'COMPLETED') {
      window.alert('Reverse is intended for COMPLETED ledger transactions.')
      return
    }
    const reason = window.prompt('Reversal reason (required)')
    if (!reason?.trim()) return
    api.TRANSACTIONS
      .reverse(id, reason.trim())
      .then(() => {
        setDetail(null)
        load()
      })
      .catch((e) => setError(e?.response?.data?.message ?? e.message ?? 'Reverse failed'))
  }

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
                <button key={t} type="button" className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-sm" style={{ marginLeft: 8 }} disabled={exporting} onClick={exportCsv}>
              {exporting ? 'Export…' : 'Export CSV'}
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
              {!loading && data.length === 0 && <tr><td colSpan={9} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>No transactions</td></tr>}
              {!loading &&
                data.map((t) => (
                  <tr key={t.id}>
                    <td className="td-mono">{t.reference || t.id.slice(0, 8)}</td>
                    <td className="td-muted">{t.sender_phone || t.sender_user_id?.slice(0, 8) || '—'}</td>
                    <td className="td-muted">{t.receiver_phone || t.receiver_user_id?.slice(0, 8) || '—'}</td>
                    <td>
                      <span className="badge badge-b">{t.type || '—'}</span>
                    </td>
                    <td>
                      <strong>{Number(t.amount).toLocaleString()} MAD</strong>
                    </td>
                    <td>{t.fee != null ? `${Number(t.fee).toLocaleString()} MAD` : '—'}</td>
                    <td>
                      <span className={`badge ${t.status === 'COMPLETED' ? 'badge-g' : t.status === 'FAILED' ? 'badge-r' : 'badge-y'}`}>{t.status}</span>
                    </td>
                    <td className="td-muted">{timeAgo(t.created_at)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openDetail(t.id)}>
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ marginLeft: 4 }}
                        onClick={() => reverseTxn(t.id, t.status)}
                      >
                        Reverse
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {detail && (
        <div
          role="presentation"
          className="kyc-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setDetail(null)}
        >
          <div className="card" style={{ maxWidth: 640, width: '100%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="card-hdr">
              <div className="card-title">Transaction</div>
              <button type="button" className="btn btn-sm" onClick={() => setDetail(null)}>
                Close
              </button>
            </div>
            <pre style={{ fontSize: 12, margin: 0, padding: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(detail, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  )
}
