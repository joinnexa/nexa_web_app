import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { StaysStats } from '../api/types'
import { ListingMediaPreview } from '../components/ListingMediaPreview'

type ListTab = 'SUBMITTED' | 'APPROVED'

type ListingRow = {
  id: string
  title?: string
  city?: string
  listing_type?: string
  status?: string
  created_at?: string
  host?: { full_name?: string; phone_number?: string; id?: string } | null
}

type MediaRow = {
  asset_id: string
  kind: string
  sort_order?: number
}

type ListingDetail = ListingRow & {
  description?: string | null
  instant_booking?: boolean
  media?: MediaRow[]
  rules?: Record<string, unknown> | null
  rate_plan?: {
    base_price?: string | number
    weekend_price?: string | number | null
    cleaning_fee?: string | number
    currency?: string
  } | null
  check_in_contact?: { full_name?: string; phone_encrypted?: string; role?: string } | null
}

function unwrapListings(raw: unknown): { items: ListingRow[]; total: number } {
  if (Array.isArray(raw)) return { items: raw as ListingRow[], total: raw.length }
  const o = raw as { items?: ListingRow[]; total?: number } | null
  return { items: o?.items ?? [], total: o?.total ?? 0 }
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function Listings() {
  const [stats, setStats] = useState<StaysStats | null>(null)
  const [submittedTotal, setSubmittedTotal] = useState<number | null>(null)
  const [approvedNotLiveTotal, setApprovedNotLiveTotal] = useState<number | null>(null)
  const [tab, setTab] = useState<ListTab>('SUBMITTED')
  const [items, setItems] = useState<ListingRow[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ListingDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const loadStats = useCallback(() => {
    Promise.all([
      api.STAYS.getStats().then((s) => s as StaysStats).catch(() => null),
      api.STAYS.getListings({ status: 'SUBMITTED', limit: 1 }).then((r) => unwrapListings(r).total).catch(() => null),
      api.STAYS.getListings({ status: 'APPROVED', limit: 1 }).then((r) => unwrapListings(r).total).catch(() => null),
    ]).then(([s, subTot, apprTot]) => {
      setStats(s)
      setSubmittedTotal(subTot)
      setApprovedNotLiveTotal(apprTot)
    })
  }, [])

  const loadList = useCallback(() => {
    setListLoading(true)
    setListError(null)
    api.STAYS
      .getListings({ status: tab, limit: 100 })
      .then((raw) => {
        const { items: next } = unwrapListings(raw)
        setItems(next)
        setSelectedId((cur) => {
          if (cur && next.some((x) => x.id === cur)) return cur
          return next[0]?.id ?? null
        })
      })
      .catch((e) => {
        setListError(e?.response?.data?.message ?? e?.message ?? 'Failed to load listings')
        setItems([])
      })
      .finally(() => setListLoading(false))
  }, [tab])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadList()
  }, [loadList])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    setDetailLoading(true)
    api.STAYS
      .getListing(selectedId)
      .then((d) => setDetail(d as ListingDetail))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false))
  }, [selectedId])

  const sortedMedia = useMemo(() => {
    const m = detail?.media ?? []
    return [...m].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }, [detail?.media])

  const refreshAll = useCallback(async () => {
    loadStats()
    await loadList()
    if (selectedId) {
      setDetailLoading(true)
      try {
        const d = await api.STAYS.getListing(selectedId)
        setDetail(d as ListingDetail)
      } catch {
        setDetail(null)
      } finally {
        setDetailLoading(false)
      }
    }
  }, [loadList, loadStats, selectedId])

  const publishListing = async () => {
    if (!detail?.id || detail.status !== 'SUBMITTED') return
    setActionBusy(true)
    try {
      await api.STAYS.approveListing(detail.id)
      await api.STAYS.setListingLive(detail.id)
      setSelectedId(null)
      await refreshAll()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      window.alert(msg ?? 'Could not publish listing')
    } finally {
      setActionBusy(false)
    }
  }

  const goLiveOnly = async () => {
    if (!detail?.id || detail.status !== 'APPROVED') return
    setActionBusy(true)
    try {
      await api.STAYS.setListingLive(detail.id)
      setSelectedId(null)
      await refreshAll()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      window.alert(msg ?? 'Could not set listing live')
    } finally {
      setActionBusy(false)
    }
  }

  const submitReject = async () => {
    if (!detail?.id || detail.status !== 'SUBMITTED') return
    const reason = rejectReason.trim() || 'Rejected'
    setActionBusy(true)
    try {
      await api.STAYS.rejectListing(detail.id, reason)
      setRejectOpen(false)
      setRejectReason('')
      setSelectedId(null)
      await refreshAll()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      window.alert(msg ?? 'Could not reject listing')
    } finally {
      setActionBusy(false)
    }
  }

  const activeListings = stats?.liveListings ?? 0

  return (
    <>
      <div className="section-title">Listings</div>
      <div className="section-sub">
        Review host submissions (photos + walkthrough), then publish to go live ·{' '}
        <Link to="/stays" style={{ color: 'var(--p)' }}>
          Stays Dashboard
        </Link>
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card p">
          <div className="stat-label">LIVE LISTINGS</div>
          <div className="stat-val">{activeListings}</div>
        </div>
        <div className="stat-card y">
          <div className="stat-label">SUBMITTED (REVIEW)</div>
          <div className="stat-val">{submittedTotal == null ? '…' : submittedTotal}</div>
          <div className="stat-sub">Photos + walkthrough</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">APPROVED (NOT LIVE)</div>
          <div className="stat-val">{approvedNotLiveTotal == null ? '…' : approvedNotLiveTotal}</div>
          <div className="stat-sub">Use Approved tab</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" className={`btn btn-sm ${tab === 'SUBMITTED' ? 'btn-y' : 'btn-ghost'}`} onClick={() => setTab('SUBMITTED')}>
          Submitted for review
        </button>
        <button type="button" className={`btn btn-sm ${tab === 'APPROVED' ? 'btn-y' : 'btn-ghost'}`} onClick={() => setTab('APPROVED')}>
          Approved → go live
        </button>
      </div>

      {listError && <div className="alert alert-r" style={{ marginBottom: 12 }}>{listError}</div>}

      <div className="row">
        <div className="col-2">
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">{tab === 'SUBMITTED' ? 'Pending review' : 'Approved listings'}</div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Host</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {listLoading && (
                    <tr>
                      <td colSpan={4} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!listLoading && items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>
                        No listings in this queue
                      </td>
                    </tr>
                  )}
                  {!listLoading &&
                    items.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedId(row.id)}
                        style={{
                          cursor: 'pointer',
                          background: selectedId === row.id ? 'var(--surf2)' : undefined,
                        }}
                      >
                        <td>
                          <strong>{row.title ?? '—'}</strong>
                          <div className="td-muted" style={{ fontSize: 11 }}>
                            {row.city ?? '—'} · {row.listing_type ?? '—'}
                          </div>
                        </td>
                        <td>{row.host?.full_name ?? row.host?.phone_number ?? '—'}</td>
                        <td>
                          <span className="badge badge-y">{row.status ?? '—'}</span>
                        </td>
                        <td className="td-muted" style={{ fontSize: 12 }}>
                          {fmtDate(row.created_at)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-1">
          <div className="card" style={{ minHeight: 420 }}>
            <div className="card-hdr">
              <div className="card-title">Review</div>
              {detail?.status && <span className="badge badge-y" style={{ marginLeft: 'auto' }}>{detail.status}</span>}
            </div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              {!selectedId && <div className="td-muted">Select a listing</div>}
              {selectedId && detailLoading && <div className="td-muted">Loading details…</div>}
              {selectedId && !detailLoading && !detail && <div className="td-muted">Could not load listing</div>}
              {detail && !detailLoading && (
                <>
                  <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>{detail.title}</h3>
                  <p className="td-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                    {detail.city} · {detail.listing_type}
                  </p>
                  {detail.description && (
                    <p style={{ fontSize: 13, lineHeight: 1.45, marginBottom: 12 }}>{detail.description}</p>
                  )}
                  {detail.rate_plan && (
                    <div style={{ fontSize: 12, marginBottom: 12 }}>
                      <strong>From</strong>{' '}
                      {Number(detail.rate_plan.base_price ?? 0).toLocaleString()}{' '}
                      {detail.rate_plan.currency ?? 'MAD'}
                      {detail.rate_plan.weekend_price != null && (
                        <span className="td-muted">
                          {' '}
                          · weekend {Number(detail.rate_plan.weekend_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                  {detail.rules && (
                    <div className="td-muted" style={{ fontSize: 11, marginBottom: 12 }}>
                      Max guests: {String(detail.rules.max_guests ?? '—')} · Pets: {String(detail.rules.pets_policy ?? '—')}
                    </div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>
                    Media ({sortedMedia.length})
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    {sortedMedia.map((m) => (
                      <div key={m.asset_id}>
                        <ListingMediaPreview listingId={detail.id} assetId={m.asset_id} kind={m.kind} />
                        <div className="td-muted" style={{ fontSize: 10, marginTop: 4, textAlign: 'center' }}>
                          {m.kind}
                        </div>
                      </div>
                    ))}
                  </div>
                  {sortedMedia.length === 0 && <div className="td-muted" style={{ marginBottom: 16 }}>No media on record</div>}

                  {detail.status === 'SUBMITTED' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <button type="button" className="btn btn-g btn-sm" disabled={actionBusy} onClick={() => publishListing()}>
                        Approve &amp; go live
                      </button>
                      <button
                        type="button"
                        className="btn btn-r btn-sm"
                        disabled={actionBusy}
                        onClick={() => {
                          setRejectReason('')
                          setRejectOpen(true)
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {detail.status === 'APPROVED' && (
                    <button type="button" className="btn btn-g btn-sm" disabled={actionBusy} onClick={() => goLiveOnly()}>
                      Set live
                    </button>
                  )}
                  {detail.status !== 'SUBMITTED' && detail.status !== 'APPROVED' && (
                    <div className="td-muted" style={{ fontSize: 12 }}>No actions for this status here.</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {rejectOpen && detail && (
        <>
          <div
            role="presentation"
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 199 }}
            onClick={() => !actionBusy && setRejectOpen(false)}
          />
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
              <div className="card-title">Reject listing</div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Reason</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Brief reason for the host…"
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
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRejectOpen(false)} disabled={actionBusy}>
                  Cancel
                </button>
                <button type="button" className="btn btn-r btn-sm" disabled={actionBusy} onClick={() => submitReject()}>
                  Confirm reject
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
