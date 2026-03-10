import { useEffect, useState } from 'react'
import { Eye, Check, X, Zap, Loader2 } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { adminApi } from '../../services/adminApi'

interface ListingMedia {
  id: string
  asset_id: string
  kind: 'PHOTO' | 'VIDEO' | 'WALKTHROUGH'
  sort_order: number
}

interface Listing {
  id: string
  title: string
  listing_type: string
  city: string
  status: string
  host_user_id?: string
  host?: { full_name?: string | null; phone_number?: string }
  created_at: string
  description?: string | null
  rules?: {
    max_guests?: number
    pets_policy?: string
    amenities?: string
  } | null
  rate_plan?: {
    base_price?: number
    weekend_price?: number | null
    cleaning_fee?: number
    currency?: string
  } | null
  check_in_contact?: {
    full_name?: string
    phone_encrypted?: string
    phone?: string
    name?: string
    email?: string
  } | null
  media?: ListingMedia[]
}

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [viewListing, setViewListing] = useState<Listing | null>(null)
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({})
  const [viewLoading, setViewLoading] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  useEffect(() => {
    fetchListings()
  }, [filter])

  const fetchListings = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getListings({ status: filter === 'all' ? undefined : filter, limit: 50 })
      const data = res.data?.data ?? res.data
      const items = data?.items ?? (Array.isArray(data) ? data : [])
      setListings(items)
    } catch (err) {
      console.error(err)
      setListings([])
    } finally {
      setIsLoading(false)
    }
  }

  const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    LIVE: 'success',
    APPROVED: 'success',
    DRAFT: 'default',
    SUBMITTED: 'warning',
    REJECTED: 'danger',
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    setError(null)
    try {
      await adminApi.approveListing(id)
      await fetchListings()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    setActionLoading(rejectTarget.id)
    setError(null)
    try {
      await adminApi.rejectListing(rejectTarget.id, rejectReason)
      setRejectTarget(null)
      setRejectReason('')
      await fetchListings()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSetLive = async (id: string) => {
    setActionLoading(id)
    setError(null)
    try {
      await adminApi.setListingLive(id)
      await fetchListings()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to set live')
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewListing = async (listing: Listing) => {
    setViewLoading(true)
    setError(null)
    setMediaUrls({})
    try {
      const res = await adminApi.getListing(listing.id)
      const full = (res.data?.data ?? res.data) as Listing
      setViewListing(full)
      const media = full?.media ?? []
      const urls: Record<string, string> = {}
      for (const m of media) {
        try {
          const blobRes = await adminApi.getListingMediaFile(listing.id, m.asset_id)
          if (blobRes.status >= 200 && blobRes.status < 300) {
            const blob = blobRes.data as Blob
            urls[m.asset_id] = URL.createObjectURL(blob)
          }
        } catch (e) {
          console.warn('Failed to load media', m.asset_id, e)
        }
      }
      setMediaUrls(urls)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load listing')
    } finally {
      setViewLoading(false)
    }
  }

  const handleCloseView = () => {
    Object.values(mediaUrls).forEach((url) => URL.revokeObjectURL(url))
    setMediaUrls({})
    setViewListing(null)
    setError(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Listings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage Nexa Stays listings</p>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
        <div className="flex gap-4 mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="LIVE">Live</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button
            onClick={fetchListings}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Refresh
          </button>
        </div>

        <Table
          headers={['Title', 'Type', 'City', 'Status', 'Host', 'Created', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No listings found"
        >
          {listings.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-medium max-w-[200px] truncate">{l.title || 'Untitled'}</TableCell>
              <TableCell>{l.listing_type || '-'}</TableCell>
              <TableCell>{l.city || '-'}</TableCell>
              <TableCell><Badge variant={statusVariant[l.status] || 'default'}>{l.status}</Badge></TableCell>
              <TableCell>{l.host?.full_name ?? l.host?.phone_number ?? 'N/A'}</TableCell>
              <TableCell>{new Date(l.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {l.status === 'SUBMITTED' && (
                    <>
                      <button
                        onClick={() => handleApprove(l.id)}
                        disabled={!!actionLoading}
                        className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded disabled:opacity-50"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setRejectTarget({ id: l.id, title: l.title || 'Untitled' })}
                        disabled={!!actionLoading}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {l.status === 'APPROVED' && (
                    <button
                      onClick={() => handleSetLive(l.id)}
                      disabled={!!actionLoading}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded disabled:opacity-50"
                      title="Set Live"
                    >
                      <Zap className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleViewListing(l)}
                    disabled={viewLoading}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Modal
        open={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setRejectReason(''); setError(null) }}
        title={`Reject listing: ${rejectTarget?.title ?? ''}`}
      >
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason (optional)
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="e.g. Photos don't meet quality standards"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setRejectTarget(null); setRejectReason(''); setError(null) }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!!actionLoading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading === rejectTarget?.id ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!viewListing}
        onClose={handleCloseView}
        title={viewListing ? `${viewListing.title || 'Untitled'} — Review` : 'Listing details'}
      >
        {viewLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : viewListing ? (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {viewListing.description || '—'}
              </p>
            </div>
            {viewListing.rules && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rules</p>
                <div className="mt-1 text-gray-900 dark:text-gray-100 space-y-1">
                  <p>Max guests: {viewListing.rules.max_guests ?? '—'}</p>
                  <p>Pets: {viewListing.rules.pets_policy ?? '—'}</p>
                  <p>Amenities: {viewListing.rules.amenities ?? '—'}</p>
                </div>
              </div>
            )}
            {viewListing.rate_plan && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rate plan</p>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  Base: {viewListing.rate_plan.base_price} {viewListing.rate_plan.currency}
                  {viewListing.rate_plan.weekend_price != null && (
                    <> · Weekend: {viewListing.rate_plan.weekend_price}</>
                  )}
                  {viewListing.rate_plan.cleaning_fee != null && (
                    <> · Cleaning: {viewListing.rate_plan.cleaning_fee}</>
                  )}
                </p>
              </div>
            )}
            {viewListing.check_in_contact && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-in contact</p>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {viewListing.check_in_contact.full_name ?? viewListing.check_in_contact.name} · {viewListing.check_in_contact.phone_encrypted ?? viewListing.check_in_contact.phone ?? viewListing.check_in_contact.email ?? '—'}
                </p>
              </div>
            )}
            {viewListing.media && viewListing.media.length > 0 && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Photos</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {viewListing.media
                      .filter((m) => m.kind === 'PHOTO' || m.kind === 'VIDEO')
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => mediaUrls[m.asset_id] && setFullscreenImage(mediaUrls[m.asset_id])}
                          className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {mediaUrls[m.asset_id] ? (
                            <img
                              src={mediaUrls[m.asset_id]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
                {viewListing.media.some((m) => m.kind === 'WALKTHROUGH') && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Walkthrough video</p>
                    {viewListing.media
                      .filter((m) => m.kind === 'WALKTHROUGH')
                      .map((m) => (
                        <div key={m.id} className="rounded-lg overflow-hidden bg-black">
                          {mediaUrls[m.asset_id] ? (
                            <video
                              src={mediaUrls[m.asset_id]}
                              controls
                              className="w-full max-h-64"
                            />
                          ) : (
                            <div className="w-full h-48 flex items-center justify-center text-white">
                              <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
            {viewListing.status === 'SUBMITTED' && (
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setRejectTarget({ id: viewListing.id, title: viewListing.title || 'Untitled' })
                    handleCloseView()
                  }}
                  className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Reject
                </button>
                <button
                  onClick={async () => {
                    await handleApprove(viewListing.id)
                    handleCloseView()
                  }}
                  disabled={!!actionLoading}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading === viewListing.id ? 'Approving…' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Fullscreen image lightbox */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setFullscreenImage(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && setFullscreenImage(null)}
          aria-label="Close fullscreen"
        >
          <button
            type="button"
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={fullscreenImage}
            alt="Listing photo"
            className="max-w-[95vw] max-h-[95vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
