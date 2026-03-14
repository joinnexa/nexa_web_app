import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

interface AdminAccount {
  id: string
  email?: string
  phone?: string
  full_name?: string | null
  role?: string
  status?: string
  created_at?: string
}

export default function SuperAdmins() {
  const [admins, setAdmins] = useState<AdminAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getSystemAccounts()
      const data = res.data?.data || res.data || {}
      const list = Array.isArray(data) ? data : data?.accounts || data?.items || []
      setAdmins(list)
    } catch (err: unknown) {
      console.error('Error fetching admin accounts:', err)
      setAdmins([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Users</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">System admin accounts</p>
      </div>

      <Card>
        {admins.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No admin accounts found</p>
          </div>
        )}

        <Table
          headers={['Name', 'Email', 'Phone', 'Role', 'Status', 'Created']}
          isLoading={isLoading}
          emptyMessage="No admin accounts"
        >
          {admins.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.full_name || '—'}</TableCell>
              <TableCell>{a.email || '—'}</TableCell>
              <TableCell>{a.phone || '—'}</TableCell>
              <TableCell>
                <Badge variant="secondary">{a.role || 'admin'}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={a.status === 'ACTIVE' ? 'success' : 'default'}>{a.status || 'N/A'}</Badge>
              </TableCell>
              <TableCell>{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
