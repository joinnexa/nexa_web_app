import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Car } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

interface User {
  id: string
  phone_number: string
  full_name: string | null
  account_type: string
  kyc_status: string
  account_status: string
  created_at: string
}

export default function NexaGoDrivers() {
  const [drivers, setDrivers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getUsers({ account_type: 'DRIVER' })
      const data = response.data?.data || response.data
      const items = Array.isArray(data) ? data : data?.users || data?.items || []
      setDrivers(items)
    } catch (err: any) {
      console.error('Error fetching drivers:', err)
      setDrivers([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Drivers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Taxi drivers registered on the platform</p>
      </div>

      <Card>
        {drivers.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No drivers found</p>
          </div>
        )}

        <Table
          headers={['Name', 'Phone', 'KYC', 'Status', 'Joined', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No drivers found"
        >
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell className="font-medium">{driver.full_name || '—'}</TableCell>
              <TableCell>{driver.phone_number}</TableCell>
              <TableCell>
                <Badge variant={driver.kyc_status === 'APPROVED' ? 'success' : 'default'}>{driver.kyc_status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={driver.account_status === 'ACTIVE' ? 'success' : 'default'}>{driver.account_status}</Badge>
              </TableCell>
              <TableCell>{new Date(driver.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Link
                  to={`/go/users/${driver.id}`}
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
