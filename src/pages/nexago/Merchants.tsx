import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store } from 'lucide-react'
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

export default function NexaGoMerchants() {
  const [merchants, setMerchants] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getUsers({ account_type: 'MERCHANT' })
      const data = response.data?.data || response.data
      const items = Array.isArray(data) ? data : data?.users || data?.items || []
      setMerchants(items)
    } catch (err: any) {
      console.error('Error fetching merchants:', err)
      setMerchants([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Merchants</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Restaurant and store partners</p>
      </div>

      <Card>
        {merchants.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No merchants found</p>
          </div>
        )}

        <Table
          headers={['Name', 'Phone', 'KYC', 'Status', 'Joined', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No merchants found"
        >
          {merchants.map((merchant) => (
            <TableRow key={merchant.id}>
              <TableCell className="font-medium">{merchant.full_name || '—'}</TableCell>
              <TableCell>{merchant.phone_number}</TableCell>
              <TableCell>
                <Badge variant={merchant.kyc_status === 'APPROVED' ? 'success' : 'default'}>{merchant.kyc_status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={merchant.account_status === 'ACTIVE' ? 'success' : 'default'}>{merchant.account_status}</Badge>
              </TableCell>
              <TableCell>{new Date(merchant.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Link
                  to={`/go/users/${merchant.id}`}
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
