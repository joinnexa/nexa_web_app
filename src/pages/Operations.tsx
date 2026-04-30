import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

type TabKey =
  | 'tickets'
  | 'refunds'
  | 'recon'
  | 'sar'
  | 'registrations'
  | 'fraudEvents'
  | 'systemAccounts'

function asRecord(row: unknown): Record<string, unknown> {
  return row != null && typeof row === 'object' ? (row as Record<string, unknown>) : {}
}

function registrationFilename(applicationId: string, stored: unknown): string | null {
  if (typeof stored !== 'string' || !stored) return null
  const p = stored.replace(/\\/g, '/')
  const prefix = `${applicationId}/`
  return p.startsWith(prefix) ? p.slice(prefix.length) : (p.includes('/') ? (p.split('/').pop() as string) : p)
}

export function Operations() {
  const [tab, setTab] = useState<TabKey>('tickets')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [tickets, setTickets] = useState<unknown[]>([])
  const [refunds, setRefunds] = useState<unknown[]>([])
  const [recon, setRecon] = useState<unknown[]>([])
  const [sar, setSar] = useState<unknown[]>([])
  const [registrations, setRegistrations] = useState<Record<string, unknown>[]>([])
  const [fraudEvents, setFraudEvents] = useState<unknown[]>([])
  const [accounts, setAccounts] = useState<Array<{ id: string; account_type: string; balance: number | null }>>([])
  const [preview, setPreview] = useState<{ url: string; label: string } | null>(null)

  useEffect(() => {
    return () => {
      if (preview?.url.startsWith('blob:')) URL.revokeObjectURL(preview.url)
    }
  }, [preview])

  const loadTab = useCallback(() => {
    setLoading(true)
    setError(null)
    const p = (async () => {
      switch (tab) {
        case 'tickets': {
          const r = await api.SUPPORT.getTickets({ limit: 50 })
          setTickets(Array.isArray(r) ? r : [])
          break
        }
        case 'refunds': {
          const r = await api.SUPPORT.getRefunds({ limit: 50 })
          setRefunds(Array.isArray(r) ? r : [])
          break
        }
        case 'recon': {
          const r = await api.RECONCILIATION.getIssues({ limit: 50 })
          setRecon(Array.isArray(r?.data) ? r.data : [])
          break
        }
        case 'sar': {
          const r = await api.SAR.getReports({ limit: 50 })
          setSar(Array.isArray(r?.data) ? r.data : [])
          break
        }
        case 'registrations': {
          const r = await api.GO_REGISTRATION.list({ limit: 40, offset: 0 })
          setRegistrations(r?.items ?? [])
          break
        }
        case 'fraudEvents': {
          const r = await api.COMPLIANCE_FRAUD.getEvents({ limit: 50 })
          setFraudEvents(Array.isArray(r?.data) ? r.data : [])
          break
        }
        case 'systemAccounts': {
          const r = await api.SYSTEM.getSystemAccounts()
          setAccounts(Array.isArray(r) ? r : [])
          break
        }
        default:
          break
      }
    })()
    p.catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => {
    loadTab()
  }, [loadTab])

  const closePreview = () => {
    setPreview((prev) => {
      if (prev?.url.startsWith('blob:')) URL.revokeObjectURL(prev.url)
      return null
    })
  }

  const openBlobPreview = async (applicationId: string, filename: string) => {
    try {
      const blob = await api.GO_REGISTRATION.fetchFile(applicationId, filename)
      const url = URL.createObjectURL(blob)
      setPreview((prev) => {
        if (prev?.url.startsWith('blob:')) URL.revokeObjectURL(prev.url)
        return { url, label: filename }
      })
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message?: string }).message) : 'Load failed'
      setError(msg)
    }
  }

  return (
    <>
      <div className="section-title">Operations</div>
      <div className="section-sub">Support, compliance, Go onboarding, fraud events, ledger system accounts · admin APIs wired end-to-end</div>
      {error && <div className="alert alert-r">{error}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-hdr">
          <div className="card-actions">
            <div className="tabs" style={{ flexWrap: 'wrap' }}>
              {(
                [
                  ['tickets', 'Support tickets'],
                  ['refunds', 'Refunds'],
                  ['recon', 'Reconciliation'],
                  ['sar', 'SAR'],
                  ['registrations', 'Go onboarding'],
                  ['fraudEvents', 'Fraud events'],
                  ['systemAccounts', 'System ledger'],
                ] as const
              ).map(([k, label]) => (
                <button key={k} type="button" className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
                  {label}
                </button>
              ))}
              <button type="button" className="btn btn-dark btn-sm" style={{ marginLeft: 8 }} onClick={() => loadTab()}>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {preview && (
        <div
          role="presentation"
          className="kyc-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={closePreview}
        >
          <div className="card" style={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="card-hdr">
              <div className="card-title">{preview.label}</div>
              <button type="button" className="btn btn-sm" onClick={closePreview}>
                Close
              </button>
            </div>
            <img src={preview.url} alt={preview.label || 'Uploaded document preview'} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          {loading && (
            <div className="td-muted" style={{ padding: 24, textAlign: 'center' }}>
              Loading…
            </div>
          )}

          {!loading && tab === 'tickets' && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="td-muted" style={{ padding: 16 }}>
                      No tickets
                    </td>
                  </tr>
                )}
                {tickets.map((row, idx) => {
                  const r = asRecord(row)
                  return (
                    <tr key={String(r.id ?? `ticket-${idx}`)}>
                      <td className="td-mono">{(String(r.id ?? '').slice(0, 8)) || '—'}</td>
                      <td>{String(r.user_name ?? r.user_phone ?? r.user_id ?? '—')}</td>
                      <td>{String(r.subject ?? '—')}</td>
                      <td>
                        <span className="badge badge-b">{String(r.status ?? '—')}</span>
                      </td>
                      <td className="td-muted">{r.created_at ? new Date(String(r.created_at)).toLocaleString() : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {!loading && tab === 'refunds' && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User / TX</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {refunds.length === 0 && (
                  <tr>
                    <td colSpan={5} className="td-muted" style={{ padding: 16 }}>
                      No refunds
                    </td>
                  </tr>
                )}
                {refunds.map((row, idx) => {
                  const r = asRecord(row)
                  return (
                    <tr key={String(r.id ?? `refund-${idx}`)}>
                      <td className="td-mono">{String(r.id ?? '—').slice(0, 8)}</td>
                      <td className="td-muted">{String(r.user_id ?? r.transaction_id ?? '—').slice(0, 36)}</td>
                      <td>{r.amount != null ? `${Number(r.amount).toLocaleString()} MAD` : '—'}</td>
                      <td>
                        <span className="badge badge-y">{String(r.status ?? '—')}</span>
                      </td>
                      <td className="td-muted">{r.created_at ? new Date(String(r.created_at)).toLocaleString() : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {!loading && tab === 'recon' && (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recon.length === 0 && (
                  <tr>
                    <td colSpan={5} className="td-muted" style={{ padding: 16 }}>
                      No issues
                    </td>
                  </tr>
                )}
                {recon.map((row) => {
                  const r = asRecord(row)
                  const id = String(r.id ?? '')
                  return (
                    <tr key={id}>
                      <td>{String(r.issue_type ?? '—')}</td>
                      <td>{String(r.severity ?? '—')}</td>
                      <td className="td-muted" style={{ maxWidth: 320 }}>
                        {(String(r.description ?? '—')).slice(0, 140)}
                      </td>
                      <td>{String(r.status ?? '—')}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            const status = window.prompt('New status (e.g. RESOLVED, IN_PROGRESS)', String(r.status ?? 'RESOLVED'))
                            if (!status?.trim()) return
                            api.RECONCILIATION.updateIssueStatus(id, status.trim()).then(() => loadTab()).catch((e) => setError(String(e.message)))
                          }}
                        >
                          Set status
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {!loading && tab === 'sar' && (
            <table>
              <thead>
                <tr>
                  <th>Risk score</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sar.length === 0 && (
                  <tr>
                    <td colSpan={4} className="td-muted" style={{ padding: 16 }}>
                      No SAR reports
                    </td>
                  </tr>
                )}
                {sar.map((row) => {
                  const r = asRecord(row)
                  const id = String(r.id ?? '')
                  return (
                    <tr key={id}>
                      <td>{String(r.risk_score ?? '—')}</td>
                      <td className="td-muted">{(String(r.risk_reason ?? '—')).slice(0, 120)}</td>
                      <td>{String(r.status ?? '—')}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            const status = window.prompt('Status (e.g. UNDER_REVIEW, REPORTED, OPEN)', String(r.status ?? 'UNDER_REVIEW'))
                            if (!status?.trim()) return
                            api.SAR.updateStatus(id, status.trim()).then(() => loadTab()).catch((e) => setError(String(e.message)))
                          }}
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {!loading && tab === 'registrations' && (
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Files</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="td-muted" style={{ padding: 16 }}>
                      No applications
                    </td>
                  </tr>
                )}
                {registrations.map((r) => {
                  const id = String(r.id ?? '')
                  const selfie = registrationFilename(id, r.selfie_path)
                  const idFront = registrationFilename(id, r.identity_front_path)
                  return (
                    <tr key={id}>
                      <td>{String(r.role ?? '—')}</td>
                      <td>{String(r.phone_number ?? '—')}</td>
                      <td>
                        <span className="badge badge-n">{String(r.status ?? '—')}</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {selfie ? (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openBlobPreview(id, selfie)}>
                            Selfie
                          </button>
                        ) : null}
                        {idFront ? (
                          <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 4 }} onClick={() => openBlobPreview(id, idFront)}>
                            ID
                          </button>
                        ) : null}
                        {!selfie && !idFront ? '—' : null}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className="btn btn-g btn-sm"
                          style={{ marginRight: 8 }}
                          onClick={() =>
                            api.GO_REGISTRATION
                              .approve(id)
                              .then(() => loadTab())
                              .catch((e) => setError(e?.response?.data?.message ?? e.message))
                          }
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-dark btn-sm"
                          onClick={() => {
                            const reason = window.prompt('Rejection reason') || undefined
                            api.GO_REGISTRATION
                              .reject(id, reason)
                              .then(() => loadTab())
                              .catch((e) => setError(e?.response?.data?.message ?? e.message))
                          }}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {!loading && tab === 'fraudEvents' && (
            <table>
              <thead>
                <tr>
                  <th>Reason</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fraudEvents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="td-muted" style={{ padding: 16 }}>
                      No fraud events
                    </td>
                  </tr>
                )}
                {fraudEvents.map((row) => {
                  const r = asRecord(row)
                  const id = String(r.id ?? '')
                  return (
                    <tr key={id}>
                      <td>{String(r.reason_code ?? '—')}</td>
                      <td>{r.amount != null ? Number(r.amount).toLocaleString() : '—'}</td>
                      <td>{String(r.status ?? '—')}</td>
                      <td>
                        <select
                          className="input"
                          style={{ fontSize: 12 }}
                          defaultValue={String(r.status ?? 'OPEN')}
                          onChange={(ev) => {
                            const status = ev.target.value as 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'FALSE_POSITIVE'
                            api.COMPLIANCE_FRAUD
                              .updateEventStatus(id, { status })
                              .then(() => loadTab())
                              .catch((e) => setError(e?.response?.data?.message ?? e.message))
                          }}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="REVIEWING">REVIEWING</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {!loading && tab === 'systemAccounts' && (
            <table>
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={2} className="td-muted" style={{ padding: 16 }}>
                      No system accounts (or ledger empty).
                    </td>
                  </tr>
                )}
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td className="td-mono">{a.id.slice(0, 8)}…</td>
                    <td>
                      <span className="badge badge-g">{a.account_type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
