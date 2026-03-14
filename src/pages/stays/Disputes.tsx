import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

interface DisputeItem {
  id: string
  type?: string
  severity?: string
  status?: string
  description?: string
  source?: string
  created_at?: string
}

export default function StaysDisputes() {
  const [items, setItems] = useState<DisputeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    try {
      setIsLoading(true)
      try {
        const res = await adminApi.getRiskAlerts({ limit: 50 })
        const data = res.data?.data || res.data || {}
        const list = Array.isArray(data) ? data : data?.alerts || data?.items || []
        setItems(list)
      } catch {
        const res = await adminApi.getTickets({ limit: 50 })
        const data = res.data?.data || res.data || {}
        const list = Array.isArray(data) ? data : data?.tickets || data?.items || []
        setItems(list)
      }
    } catch (err: unknown) {
      console.error('Error fetching disputes:', err)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityBadge = (s: string) => {
    const v: Record<string, 'default' | 'danger' | 'warning'> = {
      CRITICAL: 'danger',
      HIGH: 'danger',
      MEDIUM: 'warning',
    }
    return <Badge variant={v[s] || 'default'}>{s || 'N/A'}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Disputes & Damages</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Risk alerts and support tickets related to stays</p>
      </div>

      <Card>
        {items.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No disputes or damages reported</p>
          </div>
        )}

        <Table
          headers={['ID', 'Type', 'Severity', 'Description', 'Status', 'Created']}
          isLoading={isLoading}
          emptyMessage="No disputes found"
        >
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs">{item.id.substring(0, 8)}...</TableCell>
              <TableCell>{item.type || 'N/A'}</TableCell>
              <TableCell>{getSeverityBadge(item.severity ?? '')}</TableCell>
              <TableCell className="max-w-xs truncate">{item.description || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={item.status === 'OPEN' ? 'warning' : item.status === 'RESOLVED' ? 'success' : 'default'}>
                  {item.status || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>{item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
