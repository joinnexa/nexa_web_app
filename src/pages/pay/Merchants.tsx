import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

interface Merchant {
  id: string
  phone_number?: string
  full_name?: string | null
  account_type?: string
  kyc_status?: string
  account_status?: string
  created_at?: string
  business_name?: string
  status?: string
}

export default function PayMerchants() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    try {
      setIsLoading(true)
      try {
        const response = await adminApi.getMerchants({})
        const data = response.data?.data || response.data || {}
        const items = Array.isArray(data) ? data : data?.merchants || data?.items || []
        setMerchants(items)
      } catch {
        const response = await adminApi.getUsers({ account_type: 'MERCHANT' })
        const data = response.data?.data || response.data || {}
        const items = Array.isArray(data) ? data : data?.users || data?.items || []
        setMerchants(items)
      }
    } catch (err: unknown) {
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Merchant management and onboarding</p>
      </div>

      <Card>
        {merchants.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No merchants found</p>
          </div>
        )}

        <Table
          headers={['Name', 'Business', 'Phone', 'KYC', 'Status', 'Joined', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No merchants found"
        >
          {merchants.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.full_name || m.business_name || '—'}</TableCell>
              <TableCell>{m.business_name || '—'}</TableCell>
              <TableCell>{m.phone_number || '—'}</TableCell>
              <TableCell>
                <Badge variant={m.kyc_status === 'APPROVED' ? 'success' : 'default'}>{m.kyc_status || 'N/A'}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={m.account_status === 'ACTIVE' || m.status === 'ACTIVE' ? 'success' : 'default'}>
                  {m.account_status || m.status || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>{m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}</TableCell>
              <TableCell>
                <Link
                  to={`/pay/users/${m.id}`}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
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
