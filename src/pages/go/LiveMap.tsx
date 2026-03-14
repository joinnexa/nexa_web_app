import { useEffect, useState } from 'react'
import { Car, MapPin } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

interface Ride {
  id: string
  driver_id?: string
  driver_name?: string
  passenger_id?: string
  passenger_name?: string
  status: string
  pickup_lat?: number
  pickup_lng?: number
  dropoff_lat?: number
  dropoff_lng?: number
  estimated_fare?: number
  final_fare?: number
  fare?: number
  created_at: string
}

export default function GoLiveMap() {
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const activeStatuses = ['REQUESTED', 'ACCEPTED', 'ARRIVED', 'STARTED']

  useEffect(() => {
    fetchRides()
    const interval = setInterval(fetchRides, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchRides = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getRides({ limit: '50' })
      const data = response.data?.data || response.data || {}
      const list = Array.isArray(data) ? data : data?.rides || data?.items || []
      setRides(list)
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status !== 404) {
        console.error('Error fetching rides:', err)
      }
      setRides([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 }).format(amount)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      COMPLETED: 'success',
      ACCEPTED: 'warning',
      ARRIVED: 'warning',
      STARTED: 'warning',
      REQUESTED: 'default',
      CANCELLED: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const activeRides = rides.filter((r) => activeStatuses.includes(r.status))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Live Map</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active rides (simplified list view)</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <span className="font-medium">{activeRides.length} active rides</span>
          </div>
          <button
            onClick={fetchRides}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
          >
            Refresh
          </button>
        </div>

        {rides.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No rides data available</p>
          </div>
        )}

        <Table
          headers={['Ride ID', 'Driver', 'Passenger', 'Status', 'Fare', 'Created']}
          isLoading={isLoading}
          emptyMessage="No active rides"
        >
          {activeRides.map((ride) => (
            <TableRow key={ride.id}>
              <TableCell className="font-mono text-xs">{ride.id.substring(0, 8)}...</TableCell>
              <TableCell>{ride.driver_name || 'N/A'}</TableCell>
              <TableCell>{ride.passenger_name || 'N/A'}</TableCell>
              <TableCell>{getStatusBadge(ride.status)}</TableCell>
              <TableCell className="font-semibold">
                {ride.final_fare ?? ride.estimated_fare ?? ride.fare != null
                  ? formatAmount(ride.final_fare ?? ride.estimated_fare ?? ride.fare ?? 0)
                  : '—'}
              </TableCell>
              <TableCell>{new Date(ride.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
