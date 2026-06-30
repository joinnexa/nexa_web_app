import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { StaysStats } from '../api/types'

type HostOnboardingRow = {
  id: string
  user_id?: string
  full_name?: string | null
  email?: string | null
  phone?: string | null
  source?: string
  submitted_from?: string | null
  application_status?: string
  identity_status?: string
  host_verification_status?: string
  submitted_at?: string | null
  user?: Record<string, unknown> | null
}

function unwrapItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  const o = raw as { items?: T[] } | null
  return o?.items ?? []
}

function userLabel(u: Record<string, unknown> | null | undefined, row: HostOnboardingRow): string {
  if (row.full_name) return row.full_name
  if (!u) return '—'
  return String(
    u.full_name ?? u.fullName ?? u.email ?? u.phone_number ?? u.phoneNumber ?? u.id ?? '—',
  )
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function Hosts() {
  const [stats, setStats] = useState<StaysStats | null>(null)
  const [rows, setRows] = useState<HostOnboardingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'all'>('PENDING')

  const loadStats = useCallback(() => {
    api.STAYS.getStats()
      .then((s) => setStats(s as StaysStats))
      .catch(() => setStats(null))
  }, [])

  const loadOnboarding = useCallback(() => {
    const params =
      statusFilter === 'PENDING'
        ? { status: 'PENDING', limit: 100 }
        : { status: 'all', limit: 100 }
    return api.STAYS.getHosts(params).then((r) => {
      const list = unwrapItems<HostOnboardingRow>(r)
      setRows(list)
      setSelectedId((current) =>
        current && list.some((x) => x.id === current) ? current : (list[0]?.id ?? null),
      )
    })
  }, [statusFilter])

  const refresh = useCallback(() => {
    setLoading(true)
    Promise.all([loadStats(), loadOnboarding()]).finally(() => setLoading(false))
  }, [loadOnboarding, loadStats])

  useEffect(() => {
    refresh()
  }, [refresh])

  const submitReject = async () => {
    if (!rejectOpen) return
    const reason = rejectReason.trim() || 'Rejected'
    setActionBusy(`reject:${rejectOpen}`)
    try {
      await api.STAYS.rejectHost(rejectOpen, reason)
      setRejectOpen(null)
      setRejectReason('')
      await refresh()
    } finally {
      setActionBusy(null)
    }
  }

  const approveRow = async (id: string) => {
    setActionBusy(`approve:${id}`)
    try {
      await api.STAYS.approveHost(id)
      await refresh()
    } finally {
      setActionBusy(null)
    }
  }

  const selected = rows.find((r) => r.id === selectedId) ?? null
  const pendingCount = stats?.pendingHostVerification ?? rows.length

  return (
    <>
      <div className="section-title">Host onboarding</div>
      <div className="section-sub">
        Unified queue (mobile + web) on stays_host_profiles ·{' '}
        <Link to="/stays" style={{ color: 'var(--p)' }}>
          Stays Dashboard
        </Link>
        {' · '}
        <Link to="/listings" style={{ color: 'var(--p)' }}>
          Listings
        </Link>
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card p">
          <div className="stat-label">APPROVED HOSTS</div>
          <div className="stat-val">{loading && !stats ? '…' : (stats?.approvedHosts ?? 0)}</div>
        </div>
        <div className="stat-card y">
          <div className="stat-label">PENDING ONBOARDING</div>
          <div className="stat-val">{loading ? '…' : pendingCount}</div>
          <div className="stat-sub">Applications awaiting review</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">IN QUEUE</div>
          <div className="stat-val">{loading ? '…' : rows.length}</div>
          <div className="stat-sub">Filtered view</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn btn-sm ${statusFilter === 'PENDING' ? 'btn-y' : 'btn-ghost'}`}
          onClick={() => setStatusFilter('PENDING')}
        >
          Pending ({statusFilter === 'PENDING' ? rows.length : '…'})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${statusFilter === 'all' ? 'btn-y' : 'btn-ghost'}`}
          onClick={() => setStatusFilter('all')}
        >
          All statuses
        </button>
      </div>

      <div className="row">
        <div className="col-2">
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Host onboarding queue</div>
              <span className="td-muted" style={{ fontSize: 11 }}>
                Approve to create HOST account; listings reviewed separately
              </span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Source</th>
                    <th>App status</th>
                    <th>Identity</th>
                    <th>Submitted</th>
                    <th style={{ width: 200 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>
                        No host onboarding records
                      </td>
                    </tr>
                  )}
                  {rows.map((row) => {
                    const busy = actionBusy === `approve:${row.id}`
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedId(row.id)}
                        style={{
                          cursor: 'pointer',
                          background: selectedId === row.id ? 'var(--surf2)' : undefined,
                        }}
                      >
                        <td>
                          <strong>{userLabel(row.user, row)}</strong>
                        </td>
                        <td>{row.phone ?? '—'}</td>
                        <td className="td-muted">{row.source ?? '—'}</td>
                        <td>
                          <span className="badge badge-y">
                            {row.application_status ?? row.host_verification_status ?? 'PENDING'}
                          </span>
                        </td>
                        <td className="td-muted">{row.identity_status ?? '—'}</td>
                        <td className="td-muted">{fmtDate(row.submitted_at)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn btn-g btn-sm"
                              disabled={busy || row.application_status === 'APPROVED'}
                              onClick={(e) => {
                                e.stopPropagation()
                                approveRow(row.id)
                              }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-r btn-sm"
                              disabled={!!actionBusy}
                              onClick={(e) => {
                                e.stopPropagation()
                                setRejectReason('')
                                setRejectOpen(row.id)
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-1">
          <div className="card" style={{ minHeight: 320 }}>
            <div className="card-hdr">
              <div className="card-title">Onboarding details</div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!selected && <div className="td-muted">Select a row</div>}
              {selected && (
                <>
                  <div>
                    <strong>Profile ID:</strong> <span className="td-mono">{selected.id}</span>
                  </div>
                  <div>
                    <strong>Name:</strong> {userLabel(selected.user, selected)}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selected.phone ?? '—'}
                  </div>
                  <div>
                    <strong>Email:</strong> {selected.email ?? '—'}
                  </div>
                  <div>
                    <strong>Source:</strong> {selected.source ?? '—'} / {selected.submitted_from ?? '—'}
                  </div>
                  <div>
                    <strong>Application:</strong> {selected.application_status ?? '—'}
                  </div>
                  <div>
                    <strong>Identity:</strong> {selected.identity_status ?? '—'}
                  </div>
                  <div>
                    <strong>Submitted:</strong> {fmtDate(selected.submitted_at)}
                  </div>
                  <details>
                    <summary style={{ cursor: 'pointer' }}>Raw payload</summary>
                    <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(selected, null, 2)}
                    </pre>
                  </details>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {rejectOpen && (
        <div
          className="card"
          style={{
            position: 'fixed',
            inset: 0,
            margin: 'auto',
            maxWidth: 420,
            height: 'fit-content',
            zIndex: 200,
            boxShadow: '0 12px 48px rgba(0,0,0,.35)',
          }}
        >
          <div className="card-hdr">
            <div className="card-title">Reject host onboarding</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Reason</label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Brief reason…"
              style={{
                width: '100%',
                resize: 'vertical',
                font: 'inherit',
                fontSize: 13,
                padding: 8,
                borderRadius: 8,
                border: '1px solid var(--surf3)',
                background: 'var(--surf)',
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRejectOpen(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-r btn-sm"
                disabled={!!actionBusy}
                onClick={() => submitReject()}
              >
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
      {rejectOpen && (
        <div
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.45)',
            zIndex: 199,
          }}
          onClick={() => !actionBusy && setRejectOpen(null)}
        />
      )}
    </>
  )
}
