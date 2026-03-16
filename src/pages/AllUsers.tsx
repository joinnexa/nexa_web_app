import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { AdminUser } from '../api/types'

export function AllUsers() {
  const [data, setData] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('All')

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    const account_type =
      tab === 'All'
        ? undefined
        : tab === 'Consumers'
          ? 'CONSUMER'
          : tab === 'Drivers'
            ? 'DRIVER'
            : tab === 'Couriers'
              ? 'COURIER'
              : tab === 'Hosts'
                ? 'HOST'
                : undefined
    api.USERS.getList({ limit: 50, account_type })
      .then((res) => {
        const items = Array.isArray(res) ? res : (res as { data?: AdminUser[] }).data ?? []
        setData(items)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => { load() }, [load])

  const total = data.length
  const verified = data.filter((u) => ['VERIFIED', 'APPROVED'].includes((u.kyc_status || '').toUpperCase())).length

  return (
    <>
      <div className="section-title">All Users</div>
      <div className="section-sub">Unified identity · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/users</code></div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card v"><div className="stat-label">IN LIST</div><div className="stat-val">{loading ? '…' : total}</div><div className="stat-sub">limit 50</div></div>
        <div className="stat-card g"><div className="stat-label">KYC VERIFIED</div><div className="stat-val">{loading ? '…' : verified}</div><div className="stat-sub">In this list</div></div>
        <div className="stat-card y"><div className="stat-label">DRIVERS</div><div className="stat-val">—</div><div className="stat-sub">No API yet</div></div>
        <div className="stat-card o"><div className="stat-label">COURIERS</div><div className="stat-val">—</div><div className="stat-sub">No API yet</div></div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">User Directory</div>
          <div className="card-actions">
            <div className="tabs">
              {['All', 'Consumers', 'Drivers', 'Couriers', 'Hosts'].map((t) => (
                <button key={t} type="button" className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Roles</th><th>KYC</th><th>Wallet Balance</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
              {!loading && data.length === 0 && <tr><td colSpan={6} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>No users</td></tr>}
              {!loading && data.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="av av-y">{(u.full_name || u.phone_number || u.email || '?').slice(0, 1).toUpperCase()}</div>
                      <div>
                        <div className="user-name">{u.full_name || '—'}</div>
                        <div className="user-id">{u.phone_number || u.email || u.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-n">{u.account_type || 'Consumer'}</span></td>
                  <td><span className={`badge ${(u.kyc_status || '').toUpperCase() === 'VERIFIED' || u.kyc_status === 'APPROVED' ? 'badge-g' : 'badge-y'}`}>{u.kyc_status || '—'}</span></td>
                  <td>{u.balance != null ? `${Number(u.balance).toLocaleString()} MAD` : '—'}</td>
                  <td><span className="badge badge-g">{u.account_status || 'Active'}</span></td>
                  <td><button type="button" className="btn btn-ghost btn-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
