import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { StaysStats } from '../api/types'

type Tab = 'verification' | 'applications'

type HostProfileRow = {
  id: string
  user_id?: string
  submitted_at?: string | null
  host_verification_status?: string
  user?: Record<string, unknown> | null
}

type HostAppRow = {
  id: string
  applicant_user_id?: string
  full_name?: string | null
  email?: string | null
  phone_number?: string
  status?: string
  created_at?: string
  applicant?: Record<string, unknown> | null
}

function unwrapItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  const o = raw as { items?: T[] } | null
  return o?.items ?? []
}

function userLabel(u: Record<string, unknown> | null | undefined): string {
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
  const [tab, setTab] = useState<Tab>('verification')
  const [stats, setStats] = useState<StaysStats | null>(null)
  const [profiles, setProfiles] = useState<HostProfileRow[]>([])
  const [applications, setApplications] = useState<HostAppRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState<{ kind: 'profile' | 'app'; id: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const loadStats = useCallback(() => {
    api.STAYS.getStats()
      .then((s) => setStats(s as StaysStats))
      .catch(() => setStats(null))
  }, [])

  const loadVerification = useCallback(() => {
    return api.STAYS
      .getHosts({ status: 'PENDING', limit: 100 })
      .then((r) => setProfiles(unwrapItems<HostProfileRow>(r)))
      .catch(() => setProfiles([]))
  }, [])

  const loadApplications = useCallback(() => {
    return Promise.all([
      api.STAYS.getHostApplications({ status: 'PENDING', limit: 100 }),
      api.STAYS.getHostApplications({ status: 'UNDER_REVIEW', limit: 100 }),
    ])
      .then(([a, b]) => {
        const merged = [...unwrapItems<HostAppRow>(a), ...unwrapItems<HostAppRow>(b)]
        const byId = new Map<string, HostAppRow>()
        for (const row of merged) byId.set(row.id, row)
        setApplications([...byId.values()].sort((x, y) => String(y.created_at ?? '').localeCompare(String(x.created_at ?? ''))))
      })
      .catch(() => setApplications([]))
  }, [])

  const refresh = useCallback(() => {
    setLoading(true)
    Promise.all([loadStats(), loadVerification(), loadApplications()]).finally(() => setLoading(false))
  }, [loadApplications, loadStats, loadVerification])

  useEffect(() => {
    refresh()
  }, [refresh])

  const submitReject = async () => {
    if (!rejectOpen) return
    const reason = rejectReason.trim() || 'Rejected'
    const key = `${rejectOpen.kind}:${rejectOpen.id}`
    setActionBusy(key)
    try {
      if (rejectOpen.kind === 'profile') {
        await api.STAYS.rejectHost(rejectOpen.id, reason)
      } else {
        await api.STAYS.rejectHostApplication(rejectOpen.id, reason)
      }
      setRejectOpen(null)
      setRejectReason('')
      await refresh()
    } finally {
      setActionBusy(null)
    }
  }

  const approveProfile = async (id: string) => {
    setActionBusy(`ap:${id}`)
    try {
      await api.STAYS.approveHost(id)
      await refresh()
    } finally {
      setActionBusy(null)
    }
  }

  const approveApp = async (id: string) => {
    setActionBusy(`aa:${id}`)
    try {
      await api.STAYS.approveHostApplication(id)
      await refresh()
    } finally {
      setActionBusy(null)
    }
  }

  const verified = stats?.approvedHosts ?? 0
  const pendingVerify = stats?.pendingHostVerification ?? profiles.length

  return (
    <>
      <div className="section-title">Host review</div>
      <div className="section-sub">
        ID verification for hosts (profiles) and new host sign-ups (applications) ·{' '}
        <Link to="/stays" style={{ color: 'var(--p)' }}>
          Stays Dashboard
        </Link>
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card p">
          <div className="stat-label">VERIFIED HOSTS</div>
          <div className="stat-val">{loading && !stats ? '…' : verified}</div>
        </div>
        <div className="stat-card y">
          <div className="stat-label">PENDING VERIFICATION</div>
          <div className="stat-val">{loading ? '…' : pendingVerify}</div>
          <div className="stat-sub">Documents / profile review</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">PENDING APPLICATIONS</div>
          <div className="stat-val">{loading ? '…' : applications.length}</div>
          <div className="stat-sub">Become-a-host queue</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn btn-sm ${tab === 'verification' ? 'btn-y' : 'btn-ghost'}`}
          onClick={() => setTab('verification')}
        >
          Verification ({profiles.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${tab === 'applications' ? 'btn-y' : 'btn-ghost'}`}
          onClick={() => setTab('applications')}
        >
          Applications ({applications.length})
        </button>
      </div>

      {tab === 'verification' && (
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Host verification</div>
            <span className="td-muted" style={{ fontSize: 11 }}>
              Approve or reject ID documents before listings go live
            </span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Host</th>
                  <th>User ID</th>
                  <th>Submitted</th>
                  <th style={{ width: 200 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>
                      No profiles pending verification
                    </td>
                  </tr>
                )}
                {profiles.map((p) => {
                  const busy = actionBusy === `ap:${p.id}`
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{userLabel(p.user)}</strong>
                      </td>
                      <td className="td-mono" style={{ fontSize: 11 }}>
                        {(p.user_id ?? (p.user?.id as string) ?? '—').toString().slice(0, 8)}…
                      </td>
                      <td className="td-muted">{fmtDate(p.submitted_at)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-g btn-sm"
                            disabled={busy}
                            onClick={() => approveProfile(p.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-r btn-sm"
                            disabled={busy}
                            onClick={() => {
                              setRejectReason('')
                              setRejectOpen({ kind: 'profile', id: p.id })
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
      )}

      {tab === 'applications' && (
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Host applications</div>
            <span className="td-muted" style={{ fontSize: 11 }}>
              Consumers applying for a host account (separate from ID verification)
            </span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th style={{ width: 200 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>
                      No pending applications
                    </td>
                  </tr>
                )}
                {applications.map((a) => {
                  const busy = actionBusy === `aa:${a.id}`
                  return (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.full_name ?? userLabel(a.applicant)}</strong>
                      </td>
                      <td>{a.phone_number ?? '—'}</td>
                      <td className="td-muted">{a.email ?? '—'}</td>
                      <td>
                        <span className="badge badge-y">{a.status ?? 'PENDING'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-g btn-sm"
                            disabled={busy}
                            onClick={() => approveApp(a.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-r btn-sm"
                            disabled={busy}
                            onClick={() => {
                              setRejectReason('')
                              setRejectOpen({ kind: 'app', id: a.id })
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
      )}

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
            <div className="card-title">Reject {rejectOpen.kind === 'profile' ? 'verification' : 'application'}</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Reason (shown to host where applicable)</label>
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
