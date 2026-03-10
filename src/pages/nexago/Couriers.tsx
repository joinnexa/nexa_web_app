import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck } from 'lucide-react'
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

export default function NexaGoCouriers() {
  const [couriers, setCouriers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCouriers()
  }, [])

  const fetchCouriers = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getUsers({ account_type: 'COURIER' })
      const data = response.data?.data || response.data
      const items = Array.isArray(data) ? data : data?.users || data?.items || []
      setCouriers(items)
    } catch (err: any) {
      console.error('Error fetching couriers:', err)
      setCouriers([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Couriers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Delivery couriers on the platform</p>
      </div>

      <Card>
        {couriers.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Truck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No couriers found</p>
          </div>
        )}

        <Table
          headers={['Name', 'Phone', 'KYC', 'Status', 'Joined', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No couriers found"
        >
          {couriers.map((courier) => (
            <TableRow key={courier.id}>
              <TableCell className="font-medium">{courier.full_name || '—'}</TableCell>
              <TableCell>{courier.phone_number}</TableCell>
              <TableCell>
                <Badge variant={courier.kyc_status === 'APPROVED' ? 'success' : 'default'}>{courier.kyc_status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={courier.account_status === 'ACTIVE' ? 'success' : 'default'}>{courier.account_status}</Badge>
              </TableCell>
              <TableCell>{new Date(courier.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Link
                  to={`/go/users/${courier.id}`}
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
