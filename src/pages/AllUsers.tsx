import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { AdminUser } from '../api/types'

const PAGE_SIZE = 50

type UsersListPayload =
  | AdminUser[]
  | {
      data: AdminUser[]
      total: number
      page: number
      limit: number
      total_pages: number
    }

function normUsersPayload(res: UsersListPayload): AdminUser[] {
  return Array.isArray(res) ? res : res?.data ?? []
}

function parseUserPage(res: UsersListPayload): {
  items: AdminUser[]
  total: number
  page: number
  limit: number
  total_pages: number
} {
  if (Array.isArray(res)) {
    const n = res.length
    return {
      items: res,
      total: n,
      page: 1,
      limit: PAGE_SIZE,
      total_pages: Math.max(1, Math.ceil(n / PAGE_SIZE)),
    }
  }
  const limit = Math.max(1, res.limit ?? PAGE_SIZE)
  const total = typeof res.total === 'number' ? res.total : (res.data?.length ?? 0)
  const page = Math.max(1, res.page ?? 1)
  const total_pages = Math.max(
    1,
    typeof res.total_pages === 'number' ? res.total_pages : Math.ceil(total / limit),
  )
  return {
    items: res.data ?? [],
    total,
    page,
    limit,
    total_pages,
  }
}

function countAccountType(users: AdminUser[], t: string): number {
  return users.filter((u) => (u.account_type || 'CONSUMER').toUpperCase() === t).length
}

function visiblePageNumbers(active: number, totalPages: number, maxBtns = 11): number[] {
  if (totalPages <= maxBtns) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const half = Math.floor(maxBtns / 2)
  let start = Math.max(1, active - half)
  let end = Math.min(totalPages, start + maxBtns - 1)
  start = Math.max(1, end - maxBtns + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function UserDetailModal({
  userId,
  onClose,
  onUpdated,
}: {
  userId: string
  onClose: () => void
  onUpdated: () => void
}) {
  const [u, setU] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setErr(null)
    api.USERS.getById(userId)
      .then((row) => setU(row as unknown as Record<string, unknown>))
      .catch((e) => setErr(e?.response?.data?.message ?? e.message ?? 'Failed to load user'))
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const status = String(u?.account_status ?? u?.status ?? 'ACTIVE').toUpperCase()
  const frozen = status === 'FROZEN'

  const act = (fn: () => Promise<unknown>) => {
    setBusy(true)
    setErr(null)
    fn()
      .then(() => {
        onUpdated()
        load()
      })
      .catch((e) => setErr(e?.response?.data?.message ?? e.message ?? 'Action failed'))
      .finally(() => setBusy(false))
  }

  return (
    <div
      className="kyc-modal-backdrop"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div className="card" style={{ maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="card-hdr">
          <div className="card-title">{loading ? 'User' : String(u?.full_name ?? u?.email ?? userId.slice(0, 8))}</div>
          <div className="card-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!loading && u && (
              <>
                {!frozen ? (
                  <button type="button" className="btn btn-sm" disabled={busy} onClick={() => act(() => api.USERS.freeze(userId))}>
                    Freeze
                  </button>
                ) : (
                  <button type="button" className="btn btn-g btn-sm" disabled={busy} onClick={() => act(() => api.USERS.unfreeze(userId))}>
                    Unfreeze
                  </button>
                )}
              </>
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          {err && <div className="alert alert-r" style={{ marginBottom: 12 }}>{err}</div>}
          {loading && <div className="td-muted">Loading profile…</div>}
          {!loading && u && (
            <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(u, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  )
}

export function AllUsers() {
  const [data, setData] = useState<AdminUser[]>([])
  const [roleSnapshot, setRoleSnapshot] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('All')
  const [page, setPage] = useState(1)
  const [totalMatching, setTotalMatching] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [detailUserId, setDetailUserId] = useState<string | null>(null)

  const accountTypeParam =
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

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.USERS.getList({ limit: PAGE_SIZE, page, account_type: accountTypeParam }),
      api.USERS.getList({ limit: 500, page: 1 }),
    ])
      .then(([listRes, snapRes]) => {
        const paged = parseUserPage(listRes as UsersListPayload)
        setData(paged.items)
        setTotalMatching(paged.total)
        setTotalPages(paged.total_pages)
        setRoleSnapshot(normUsersPayload(snapRes as UsersListPayload))
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [tab, page, accountTypeParam])

  useEffect(() => {
    load()
  }, [load])

  const selectTab = (t: string) => {
    setPage(1)
    setTab(t)
  }

  const verifiedOnPage = data.filter((u) => ['VERIFIED', 'APPROVED'].includes((u.kyc_status || '').toUpperCase())).length
  const consumers = countAccountType(roleSnapshot, 'CONSUMER')
  const hosts = countAccountType(roleSnapshot, 'HOST')
  const drivers = countAccountType(roleSnapshot, 'DRIVER')
  const couriers = countAccountType(roleSnapshot, 'COURIER')
  const snapshotCapped = roleSnapshot.length >= 500
  const countSub = snapshotCapped ? 'first 500 users' : 'all users loaded'

  const pagination = visiblePageNumbers(page, totalPages)

  return (
    <>
      <div className="section-title">All Users</div>
      <div className="section-sub">
        Unified identity · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/users</code>
      </div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        <div className="stat-card v">
          <div className="stat-label">TOTAL (FILTER)</div>
          <div className="stat-val">{loading ? '…' : totalMatching.toLocaleString()}</div>
          <div className="stat-sub">
            {PAGE_SIZE} per page · page {page} / {totalPages}
          </div>
        </div>
        <div className="stat-card g"><div className="stat-label">KYC VERIFIED</div><div className="stat-val">{loading ? '…' : verifiedOnPage}</div><div className="stat-sub">On this page</div></div>
        <div className="stat-card"><div className="stat-label">CONSUMERS</div><div className="stat-val">{loading ? '…' : consumers}</div><div className="stat-sub">{countSub}</div></div>
        <div className="stat-card"><div className="stat-label">HOSTS</div><div className="stat-val">{loading ? '…' : hosts}</div><div className="stat-sub">{countSub}</div></div>
        <div className="stat-card y"><div className="stat-label">DRIVERS</div><div className="stat-val">{loading ? '…' : drivers}</div><div className="stat-sub">{countSub}</div></div>
        <div className="stat-card o"><div className="stat-label">COURIERS</div><div className="stat-val">{loading ? '…' : couriers}</div><div className="stat-sub">{countSub}</div></div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">User Directory</div>
          <div className="card-actions">
            <div className="tabs">
              {['All', 'Consumers', 'Drivers', 'Couriers', 'Hosts'].map((t) => (
                <button key={t} type="button" className={`tab ${tab === t ? 'active' : ''}`} onClick={() => selectTab(t)}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Roles</th><th>KYC</th><th>Wallet Balance</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={6} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>
                    {totalMatching === 0 ? 'No users' : 'No rows on this page'}
                  </td>
                </tr>
              )}
              {!loading &&
                data.map((u) => (
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
                    <td>
                      <span className={`badge ${(u.account_status || 'ACTIVE').toUpperCase() === 'FROZEN' ? 'badge-r' : 'badge-g'}`}>
                        {u.account_status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDetailUserId(u.id)}>View</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!loading && totalPages > 1 && (
          <div
            className="card-body"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'center',
              borderTop: '1px solid var(--border, rgba(255,255,255,0.06))',
              paddingTop: 12,
            }}
          >
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(1)}>
              First
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </button>
            {pagination.map((pn) => (
              <button
                key={pn}
                type="button"
                className={`btn btn-sm ${pn === page ? 'btn-dark' : 'btn-ghost'}`}
                onClick={() => setPage(pn)}
              >
                {pn}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
              Last
            </button>
            <span className="td-muted" style={{ fontSize: 12, marginLeft: 8 }}>
              {totalMatching === 0
                ? `${totalMatching.toLocaleString()} total`
                : `${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + data.length} of ${totalMatching.toLocaleString()}`}
            </span>
          </div>
        )}
      </div>
      {detailUserId && (
        <UserDetailModal
          userId={detailUserId}
          onClose={() => setDetailUserId(null)}
          onUpdated={() => load()}
        />
      )}
    </>
  )
}
