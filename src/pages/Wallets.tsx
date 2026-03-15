import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { AdminWallet } from '../api/types'

function formatVol(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(n)
}

export function Wallets() {
  const [data, setData] = useState<AdminWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.WALLETS.getList()
      .then((res) => {
        const items = Array.isArray(res) ? res : (res as { data?: AdminWallet[] }).data ?? []
        setData(items)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const totalBalance = data.reduce((s, w) => s + Number(w.balance || 0), 0)
  const avgBalance = data.length ? totalBalance / data.length : 0

  return (
    <>
      <div className="section-title">Wallets</div>
      <div className="section-sub">Double-entry ledger · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/wallets</code></div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card y"><div className="stat-label">TOTAL FLOAT</div><div className="stat-val">{loading ? '…' : formatVol(totalBalance)} MAD</div><div className="stat-sub">In all wallets</div></div>
        <div className="stat-card g"><div className="stat-label">ACTIVE WALLETS</div><div className="stat-val">{loading ? '…' : data.length}</div></div>
        <div className="stat-card b"><div className="stat-label">AVG BALANCE</div><div className="stat-val">{loading ? '…' : Math.round(avgBalance).toLocaleString()} MAD</div></div>
      </div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Wallet list</div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Wallet ID</th><th>User</th><th>Balance</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
              {!loading && data.length === 0 && <tr><td colSpan={5} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>No wallets</td></tr>}
              {!loading && data.slice(0, 20).map((w) => (
                <tr key={w.id}>
                  <td className="td-mono">{w.id.slice(0, 8)}…</td>
                  <td>{w.user?.full_name || w.user?.phone_number || w.user_id?.slice(0, 8) || '—'}</td>
                  <td><strong>{Number(w.balance || 0).toLocaleString()} {w.currency || 'MAD'}</strong></td>
                  <td><span className="badge badge-g">{w.status || '—'}</span></td>
                  <td className="td-muted">{w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && data.length > 20 && <div className="card-body" style={{ borderTop: '1px solid var(--surf2)' }}>Showing 20 of {data.length}</div>}
      </div>
    </>
  )
}
