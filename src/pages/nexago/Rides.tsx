import { useEffect, useState } from 'react'
import { Eye, Car } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

interface Ride {
  id: string
  driver_id: string
  driver_name?: string
  passenger_id: string
  passenger_name?: string
  rider_user_id?: string
  status: string
  pickup_lat?: number
  pickup_lng?: number
  dropoff_lat?: number
  dropoff_lng?: number
  estimated_fare?: number
  final_fare?: number
  fare?: number
  created_at: string
  completed_at?: string
}

export default function NexaGoRides() {
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchRides()
  }, [filterStatus])

  const fetchRides = async () => {
    try {
      setIsLoading(true)
      const params: Record<string, string> = {}
      if (filterStatus !== 'all') params.status = filterStatus

      const response = await adminApi.getRides(params)
      const data = response.data?.data || response.data
      setRides(Array.isArray(data) ? data : data?.rides || data?.items || [])
    } catch (err: any) {
      if (err.response?.status !== 404) console.error('Error fetching rides:', err)
      setRides([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rides (Taxi)</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor taxi rides and driver activity</p>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">All Status</option>
            <option value="REQUESTED">Requested</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="ARRIVED">Arrived</option>
            <option value="STARTED">Started</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={fetchRides}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Refresh
          </button>
        </div>

        {rides.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="mb-2">No rides data available</p>
          </div>
        )}

        <Table
          headers={['Ride ID', 'Driver', 'Passenger', 'Status', 'Fare', 'Created', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No rides found"
        >
          {rides.map((ride) => (
            <TableRow key={ride.id}>
              <TableCell className="font-mono text-xs">{ride.id.substring(0, 8)}...</TableCell>
              <TableCell>{ride.driver_name || 'N/A'}</TableCell>
              <TableCell>{ride.passenger_name || 'N/A'}</TableCell>
              <TableCell>{getStatusBadge(ride.status)}</TableCell>
              <TableCell className="font-semibold">
                {ride.final_fare ?? ride.estimated_fare ?? ride.fare
                  ? formatAmount(ride.final_fare ?? ride.estimated_fare ?? ride.fare!)
                  : 'N/A'}
              </TableCell>
              <TableCell>{new Date(ride.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <button className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded" title="View Details">
                  <Eye className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
