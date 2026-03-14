import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

interface Booking {
  id: string
  guest_user_id?: string
  guest?: { full_name?: string; phone_number?: string; email?: string }
  occupants?: { full_name: string; id_number?: string | null }[]
  guest_count?: number
  status?: string
  checkin_date?: string
  checkout_date?: string
  created_at?: string
}

interface GuestRow {
  id: string
  name: string
  phone: string
  email: string
  bookings: number
  lastStay: string
}

export default function StaysGuests() {
  const [guests, setGuests] = useState<GuestRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      setIsLoading(true)
      try {
        const res = await adminApi.getBookings({ limit: 200 })
        const data = res.data?.data ?? res.data
        const items = data?.items ?? (Array.isArray(data) ? data : [])
        const bookings = (Array.isArray(items) ? items : []) as Booking[]

        const byUser: Record<string, { name: string; phone: string; email: string; bookings: number; lastDate: string }> = {}
        bookings.forEach((b) => {
          const name = b.guest?.full_name ?? (b.occupants?.[0]?.full_name) ?? 'Guest'
          const phone = b.guest?.phone_number ?? ''
          const email = b.guest?.email ?? ''
          const uid = b.guest_user_id ?? b.id
          const lastDate = b.checkout_date ?? b.created_at ?? ''
          if (!byUser[uid]) {
            byUser[uid] = { name, phone, email, bookings: 0, lastDate }
          }
          byUser[uid].bookings += 1
          if (lastDate > byUser[uid].lastDate) byUser[uid].lastDate = lastDate
        })
        setGuests(
          Object.entries(byUser).map(([id, v]) => ({
            id,
            name: v.name,
            phone: v.phone,
            email: v.email,
            bookings: v.bookings,
            lastStay: v.lastDate,
          }))
        )
      } catch {
        const res = await adminApi.getUsers({})
        const data = res.data?.data || res.data || {}
        const items = Array.isArray(data) ? data : data?.users || data?.items || []
        setGuests(
          items.slice(0, 50).map((u: { id: string; full_name?: string; phone_number?: string; email?: string }) => ({
            id: u.id,
            name: u.full_name ?? '—',
            phone: u.phone_number ?? '—',
            email: u.email ?? '—',
            bookings: 0,
            lastStay: '—',
          }))
        )
      }
    } catch (err: unknown) {
      console.error('Error fetching guests:', err)
      setGuests([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Guests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Guest profiles from bookings</p>
      </div>

      <Card>
        {guests.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No guests found</p>
          </div>
        )}

        <Table
          headers={['Name', 'Phone', 'Email', 'Bookings', 'Last Stay']}
          isLoading={isLoading}
          emptyMessage="No guests found"
        >
          {guests.map((g) => (
            <TableRow key={g.id}>
              <TableCell className="font-medium">{g.name}</TableCell>
              <TableCell>{g.phone}</TableCell>
              <TableCell>{g.email}</TableCell>
              <TableCell>
                <Badge variant={g.bookings > 0 ? 'success' : 'default'}>{g.bookings}</Badge>
              </TableCell>
              <TableCell>{g.lastStay !== '—' ? new Date(g.lastStay).toLocaleDateString() : '—'}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
