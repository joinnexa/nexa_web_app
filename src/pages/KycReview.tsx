import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { KycApplication } from '../api/types'

function toBadge(status: string) {
  const s = (status || '').toUpperCase()
  if (s === 'APPROVED' || s === 'VERIFIED') return 'badge-g'
  if (s === 'REJECTED' || s === 'FAILED') return 'badge-r'
  return 'badge-y'
}

function fmtWebhookEvent(row: KycApplication) {
  const eventType = row.last_webhook_event_type || '—'
  const ts = row.last_webhook_received_at ? new Date(row.last_webhook_received_at).toLocaleString() : null
  return ts ? `${eventType} · ${ts}` : eventType
}

type DocTab = 'All' | 'CIN' | 'Passport' | 'License'

function tabToDocumentCategory(tab: DocTab): string | undefined {
  if (tab === 'All') return undefined
  if (tab === 'CIN') return 'national_id'
  if (tab === 'Passport') return 'passport'
  return 'driver_license'
}

function KycDetailModal({
  row,
  onClose,
}: {
  row: KycApplication
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="kyc-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kyc-modal-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflow: 'auto',
      }}
    >
      <div
        className="kyc-modal-panel card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 920,
          width: '100%',
          maxHeight: 'min(92vh, 900px)',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        }}
      >
        <div className="card-hdr" style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--surf, #12141c)' }}>
          <div>
            <div id="kyc-modal-title" className="card-title">
              {row.full_name || row.user_name || 'Applicant'}
            </div>
            <div className="section-sub" style={{ marginTop: 4 }}>
              {row.user_phone && <span>{row.user_phone}</span>}
              {row.user_phone && row.user_id && ' · '}
              <span className="td-mono" style={{ fontSize: 12 }}>
                {row.user_id}
              </span>
            </div>
          </div>
          <div className="card-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="btn btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        <div style={{ padding: '0 16px 20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
              alignItems: 'start',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>Applicant profile</div>
              <table style={{ width: '100%', fontSize: 13 }}>
                <tbody>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0', verticalAlign: 'top' }}>
                      Full name
                    </td>
                    <td style={{ padding: '6px 0' }}>{row.full_name || row.kyc_full_name || row.user_name || '—'}</td>
                  </tr>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0' }}>
                      Email
                    </td>
                    <td style={{ padding: '6px 0' }}>{row.email || '—'}</td>
                  </tr>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0' }}>
                      City
                    </td>
                    <td style={{ padding: '6px 0' }}>{row.city || '—'}</td>
                  </tr>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0' }}>
                      Date of birth
                    </td>
                    <td style={{ padding: '6px 0' }}>{row.date_of_birth || '—'}</td>
                  </tr>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0' }}>
                      Nationality
                    </td>
                    <td style={{ padding: '6px 0' }}>{row.nationality || '—'}</td>
                  </tr>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0' }}>
                      Provider
                    </td>
                    <td style={{ padding: '6px 0' }}>
                      {(row.provider || 'SUMSUB').toUpperCase()}
                    </td>
                  </tr>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0' }}>
                      Source
                    </td>
                    <td style={{ padding: '6px 0' }}>
                      {row.source || 'PAY'}
                    </td>
                  </tr>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0' }}>
                      Last webhook event
                    </td>
                    <td style={{ padding: '6px 0' }}>{row.last_webhook_event_type || '—'}</td>
                  </tr>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0' }}>
                      Last webhook received
                    </td>
                    <td style={{ padding: '6px 0' }}>
                      {row.last_webhook_received_at ? new Date(row.last_webhook_received_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0' }}>
                      Status
                    </td>
                    <td style={{ padding: '6px 0' }}>
                      <span className={toBadge(row.status || '')}>{row.status || '—'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0' }}>
                      Submitted
                    </td>
                    <td className="td-muted" style={{ padding: '6px 0' }}>
                      {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="td-muted" style={{ padding: '6px 8px 6px 0' }}>
                      Last webhook summary
                    </td>
                    <td className="td-muted" style={{ padding: '6px 0' }}>
                      {fmtWebhookEvent(row)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>Sumsub decision metadata</div>
              <div className="td-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
                Manual document review is disabled. This profile is monitored through Sumsub webhook decisions only.
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 8, fontSize: 13 }}>
                <div>
                  <strong>Decision status:</strong>{' '}
                  <span className={toBadge(row.status || '')}>{row.status || '—'}</span>
                </div>
                <div>
                  <strong>Last event:</strong> {row.last_webhook_event_type || '—'}
                </div>
                <div>
                  <strong>Last event time:</strong>{' '}
                  {row.last_webhook_received_at ? new Date(row.last_webhook_received_at).toLocaleString() : '—'}
                </div>
                <div>
                  <strong>Reviewed at:</strong> {row.reviewed_at ? new Date(row.reviewed_at).toLocaleString() : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function KycReview() {
  const [data, setData] = useState<KycApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<DocTab>('All')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [detailRow, setDetailRow] = useState<KycApplication | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    const docCat = tabToDocumentCategory(tab)
    api.KYC.getApplications({
      source: 'ALL',
      limit: 100,
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search.trim() || undefined,
      document_category: docCat,
    })
      .then((res) => {
        const items = Array.isArray(res) ? res : (res as { items?: KycApplication[] }).items ?? []
        setData(items)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [tab, statusFilter, search])

  useEffect(() => {
    load()
  }, [load])

  const pending = data.filter((a) => (a.status || '').toUpperCase() === 'PENDING').length
  const approved = data.filter((a) => ['APPROVED', 'VERIFIED'].includes((a.status || '').toUpperCase())).length
  const rejected = data.filter((a) => (a.status || '').toUpperCase() === 'REJECTED').length

  return (
    <>
      <div className="section-title">KYC Review</div>
      <div className="section-sub">
        Monitor KYC decisions from Sumsub webhook results. Data source:{' '}
        <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>
          /admin/kyc/applications
        </code>
      </div>
      <div className="alert alert-b" style={{ marginBottom: 12 }}>
        <strong>Sumsub webhook source:</strong>{' '}
        <code>/api/v1/kyc/sumsub/webhook</code>
        <span className="td-muted"> — KYC statuses on this page are updated automatically from Sumsub callbacks.</span>
      </div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card y">
          <div className="stat-label">PENDING IN LIST</div>
          <div className="stat-val">{loading ? '…' : pending}</div>
          <div className="stat-sub">Awaiting action</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">APPROVED / VERIFIED</div>
          <div className="stat-val">{loading ? '…' : approved}</div>
          <div className="stat-sub">In this list</div>
        </div>
        <div className="stat-card r">
          <div className="stat-label">REJECTED</div>
          <div className="stat-val">{loading ? '…' : rejected}</div>
          <div className="stat-sub">In this list</div>
        </div>
        <div className="stat-card b">
          <div className="stat-label">TOTAL ROWS</div>
          <div className="stat-val">{loading ? '…' : data.length}</div>
          <div className="stat-sub">limit 100</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Applications</div>
          <div className="card-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <input
              type="search"
              placeholder="Search phone or user UUID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ minWidth: 200, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border, #333)', background: 'var(--surf)' }}
            />
            <button type="button" className="btn btn-sm" onClick={() => load()}>
              Search
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              Status
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: 6 }}
              >
                <option value="all">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved / Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </label>
            <div className="tabs">
              {(['All', 'CIN', 'Passport', 'License'] as const).map((t) => (
                <button key={t} type="button" className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'CIN' ? 'CIN / ID card' : t === 'License' ? 'Driver license' : t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 72 }}>View</th>
                <th>Applicant</th>
                <th>Form (name / email / city)</th>
                <th>ID / doc #</th>
                <th>Doc type</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Review source</th>
                <th>Last webhook</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={9} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>
                    No applications
                  </td>
                </tr>
              )}
              {!loading &&
                data.map((row) => {
                  const idManual = row.national_id_number
                  const idExtracted = row.national_id_number_extracted
                  const openDetail = () => setDetailRow(row)
                  return (
                    <tr key={row.id}>
                      <td>
                        <button type="button" className="btn btn-sm" onClick={openDetail}>
                          Open
                        </button>
                      </td>
                      <td
                        role="button"
                        tabIndex={0}
                        onClick={openDetail}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openDetail()
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Click to view full KYC details, documents, and selfie"
                      >
                        <div className="user-cell" style={{ textAlign: 'left' }}>
                          <div className="av av-y">
                            {(row.full_name || row.user_name || row.user_phone || row.user_id || '?')
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="user-name" style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                              {row.full_name || row.user_name || '—'}
                            </div>
                            <div className="user-id">{row.user_phone || row.user_id?.slice(0, 8) || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{ maxWidth: 260, fontSize: 13, cursor: 'pointer' }}
                        onClick={openDetail}
                        title="Click to view full details"
                      >
                        <div>{row.email || '—'}</div>
                        <div className="td-muted">{row.city || '—'}</div>
                      </td>
                      <td className="td-mono" style={{ fontSize: 12 }}>
                        {idManual || idExtracted || '—'}
                        {idManual && idExtracted && idManual !== idExtracted && (
                          <div className="td-muted" style={{ fontSize: 11 }}>
                            OCR: {idExtracted}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-n">{row.document_type || '—'}</span>
                      </td>
                      <td>
                        <span className={toBadge(row.status)}>{row.status || '—'}</span>
                      </td>
                      <td className="td-muted">{row.submitted_at ? new Date(row.submitted_at).toLocaleString() : '—'}</td>
                      <td className="td-muted">
                        {(row.provider || 'SUMSUB').toUpperCase()}
                      </td>
                      <td className="td-muted" style={{ maxWidth: 260 }}>
                        {fmtWebhookEvent(row)}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
      {detailRow && (
        <KycDetailModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}
    </>
  )
}
