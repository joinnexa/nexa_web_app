import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { adminApi } from '../../services/adminApi'

export default function SystemRiskAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getRiskAlerts({ status: 'OPEN' })
      const data = response.data?.data || response.data || {}
      setAlerts(Array.isArray(data) ? data : data?.alerts || data?.items || [])
    } catch (error: any) {
      console.error('Error fetching risk alerts:', error)
      setAlerts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEscalate = async (alertId: string) => {
    if (!confirm('Escalate this risk alert?')) return
    try {
      await adminApi.escalateCase(alertId)
      alert('Alert escalated')
      fetchAlerts()
    } catch (error) {
      console.error('Error escalating alert:', error)
      alert('Failed to escalate alert')
    }
  }

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      CRITICAL: 'danger',
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'default',
    }
    return <Badge variant={variants[severity] || 'default'}>{severity}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Alerts</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor and manage security risk alerts</p>
      </div>

      <Card>
        <Table
          headers={['Alert ID', 'Severity', 'Type', 'Description', 'Status', 'Created', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No open risk alerts"
        >
          {alerts.map((alert) => (
            <TableRow key={alert.id}>
              <TableCell className="font-mono text-xs">{alert.id.substring(0, 8)}...</TableCell>
              <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
              <TableCell>{alert.type || 'N/A'}</TableCell>
              <TableCell className="text-sm">{alert.description || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={alert.status === 'OPEN' ? 'warning' : alert.status === 'ESCALATED' ? 'danger' : 'success'}>
                  {alert.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(alert.created_at).toLocaleString()}</TableCell>
              <TableCell>
                {alert.status === 'OPEN' && (
                  <button
                    onClick={() => handleEscalate(alert.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Escalate
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
