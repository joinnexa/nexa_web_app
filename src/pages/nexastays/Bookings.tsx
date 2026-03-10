import { useEffect, useState, useCallback } from 'react'
import { Eye, Loader2 } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { adminApi } from '../../services/adminApi'

interface BookingOccupant {
  full_name: string
  id_number?: string | null
  is_primary?: boolean
}

interface Booking {
  id: string
  status: string
  checkin_date: string
  checkout_date: string
  guest_count: number
  total_subtotal?: number
  total_paid?: number
  guest_fee?: number
  host_fee?: number
  payout_amount?: number
  currency?: string
  guest_user_id?: string
  guest?: { full_name?: string; phone_number?: string; email?: string }
  occupants?: BookingOccupant[]
  listing?: { title?: string; city?: string; host?: { full_name?: string; phone_number?: string } }
  created_at: string
  confirmed_at?: string | null
  paid_at?: string | null
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [viewBooking, setViewBooking] = useState<Booking | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [filter])

  const openBookingDetail = useCallback(async (id: string) => {
    setViewBooking(null)
    setViewLoading(true)
    try {
      const res = await adminApi.getBooking(id)
      const data = res.data?.data ?? res.data
      setViewBooking(data as Booking)
    } catch (err) {
      console.error(err)
    } finally {
      setViewLoading(false)
    }
  }, [])

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getBookings({ status: filter === 'all' ? undefined : filter, limit: 50 })
      const data = res.data?.data ?? res.data
      const items = data?.items ?? (Array.isArray(data) ? data : [])
      setBookings(items)
    } catch (err) {
      console.error(err)
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    CONFIRMED: 'success',
    CHECKED_IN: 'success',
    COMPLETED: 'success',
    INITIATED: 'default',
    PAYMENT_PENDING: 'warning',
    CANCELLED_BY_GUEST: 'danger',
    CANCELLED_BY_HOST: 'danger',
    EXPIRED: 'danger',
  }

  const fmt = (n?: number, cur = 'MAD') =>
    n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(Number(n)) : '-'

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bookings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage Nexa Stays bookings</p>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">All Status</option>
            <option value="INITIATED">Initiated</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED_BY_GUEST">Cancelled (Guest)</option>
            <option value="CANCELLED_BY_HOST">Cancelled (Host)</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Refresh
          </button>
        </div>

        <Table
          headers={['Listing', 'Guest', 'Check-in', 'Check-out', 'Guests', 'Amount', 'Status', 'Created', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No bookings found"
        >
          {bookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="max-w-[180px] truncate">{b.listing?.title ?? 'N/A'}</TableCell>
              <TableCell>{b.guest?.full_name ?? b.guest?.phone_number ?? 'N/A'}</TableCell>
              <TableCell>{new Date(b.checkin_date).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(b.checkout_date).toLocaleDateString()}</TableCell>
              <TableCell>{b.guest_count ?? 1}</TableCell>
              <TableCell className="font-medium">{fmt(b.total_paid ?? b.total_subtotal, b.currency)}</TableCell>
              <TableCell><Badge variant={statusVariant[b.status] || 'default'}>{b.status}</Badge></TableCell>
              <TableCell>{new Date(b.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <button
                  onClick={() => openBookingDetail(b.id)}
                  className="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Modal
        open={!!viewBooking || viewLoading}
        onClose={() => { setViewBooking(null); setViewLoading(false) }}
        title="Booking details"
      >
        {viewLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : viewBooking ? (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Listing</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100 font-medium">
                {viewBooking.listing?.title ?? '—'} {viewBooking.listing?.city && `· ${viewBooking.listing.city}`}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Guest</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {viewBooking.guest?.full_name ?? '—'}
              </p>
              {viewBooking.guest?.phone_number && (
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{viewBooking.guest.phone_number}</p>
              )}
              {viewBooking.guest?.email && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{viewBooking.guest.email}</p>
              )}
            </div>
            {viewBooking.occupants && viewBooking.occupants.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Declared occupants</p>
                <ul className="mt-1 space-y-1 text-gray-900 dark:text-gray-100">
                  {viewBooking.occupants.map((o, i) => (
                    <li key={i} className="flex flex-wrap gap-x-2">
                      <span className="font-medium">{o.full_name}</span>
                      {o.id_number && <span className="text-gray-600 dark:text-gray-400">ID: {o.id_number}</span>}
                      {o.is_primary && <span className="text-xs text-primary-600">Primary</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dates & Guests</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {new Date(viewBooking.checkin_date).toLocaleDateString()} – {new Date(viewBooking.checkout_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{viewBooking.guest_count} guest{viewBooking.guest_count !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment</p>
              <div className="mt-1 space-y-1 text-gray-900 dark:text-gray-100">
                <p>Subtotal: {fmt(viewBooking.total_subtotal, viewBooking.currency)}</p>
                {viewBooking.guest_fee != null && <p>Guest fee (2%): {fmt(viewBooking.guest_fee, viewBooking.currency)}</p>}
                {viewBooking.total_paid != null && <p className="font-medium">Total: {fmt(viewBooking.total_paid, viewBooking.currency)}</p>}
                {viewBooking.payout_amount != null && <p className="text-sm text-gray-600">Host payout: {fmt(viewBooking.payout_amount, viewBooking.currency)}</p>}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <p className="mt-1">
                <Badge variant={statusVariant[viewBooking.status] || 'default'}>{viewBooking.status}</Badge>
              </p>
              {viewBooking.confirmed_at && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Confirmed: {new Date(viewBooking.confirmed_at).toLocaleString()}</p>
              )}
              {viewBooking.paid_at && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Paid: {new Date(viewBooking.paid_at).toLocaleString()}</p>
              )}
            </div>
            <div className="pt-2">
              <button
                onClick={() => { setViewBooking(null) }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
