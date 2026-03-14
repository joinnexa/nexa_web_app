import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Car } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

interface Driver {
  id: string
  phone_number?: string
  full_name?: string | null
  kyc_status?: string
  account_status?: string
  created_at?: string
  vehicle_make?: string | null
  vehicle_model?: string | null
  vehicle_year?: number | null
  vehicle_color?: string | null
  license_plate?: string | null
  vehicle_category?: string | null
}

interface RegApp {
  id: string
  full_name?: string | null
  phone_number?: string
  status?: string
  created_at?: string
  vehicle_make?: string | null
  vehicle_model?: string | null
  vehicle_year?: number | null
  license_plate?: string | null
  vehicle_category?: string | null
  user_id?: string
}

export default function GoVehicles() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [applications, setApplications] = useState<RegApp[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [drRes, appRes] = await Promise.all([
        adminApi.getDrivers({}),
        adminApi.getRegistrationApplications({ limit: 100 }),
      ])
      const drData = drRes.data?.data || drRes.data || {}
      const drItems = Array.isArray(drData) ? drData : drData?.drivers || drData?.items || []
      setDrivers(drItems)

      const appData = appRes.data?.data || appRes.data || {}
      const appItems = Array.isArray(appData) ? appData : appData?.items || appData?.applications || []
      setApplications(appItems)
    } catch (err: unknown) {
      console.error('Error fetching vehicle data:', err)
      try {
        const res = await adminApi.getUsers({ account_type: 'DRIVER' })
        const data = res.data?.data || res.data || {}
        const items = Array.isArray(data) ? data : data?.users || data?.items || []
        setDrivers(items)
      } catch {
        setDrivers([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const combined = drivers.map((d) => ({
    id: d.id,
    name: d.full_name || '—',
    phone: d.phone_number || '—',
    vehicle: [d.vehicle_make, d.vehicle_model, d.vehicle_year].filter(Boolean).join(' ') || '—',
    license: d.license_plate || '—',
    category: d.vehicle_category || '—',
    status: d.account_status || d.kyc_status || 'N/A',
    created: d.created_at,
    type: 'driver' as const,
  }))

  const appRows = applications
    .filter((a) => a.status === 'PENDING' || a.status === 'APPROVED')
    .map((a) => ({
      id: a.id,
      name: a.full_name || '—',
      phone: a.phone_number || '—',
      vehicle: [a.vehicle_make, a.vehicle_model, a.vehicle_year].filter(Boolean).join(' ') || '—',
      license: a.license_plate || '—',
      category: a.vehicle_category || '—',
      status: a.status || 'N/A',
      created: a.created_at,
      type: 'application' as const,
    }))

  const showApps = appRows.length > 0 && combined.length === 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Vehicles & Documents</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drivers and their vehicle information</p>
      </div>

      <Card>
        {combined.length === 0 && appRows.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No vehicles or applications found</p>
          </div>
        )}

        <Table
          headers={['Name', 'Phone', 'Vehicle', 'License', 'Category', 'Status', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No vehicles found"
        >
          {(showApps ? appRows : combined).map((row) => (
            <TableRow key={`${row.type}-${row.id}`}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>{row.vehicle}</TableCell>
              <TableCell className="font-mono text-xs">{row.license}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>
                <Badge variant={row.status === 'APPROVED' || row.status === 'ACTIVE' ? 'success' : 'default'}>
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell>
                {row.type === 'driver' ? (
                  <Link to={`/go/users/${row.id}`} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                    View
                  </Link>
                ) : (
                  <Link to="/go/registration-applications" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                    Review
                  </Link>
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
