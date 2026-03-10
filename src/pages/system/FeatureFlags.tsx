import { useEffect, useState } from 'react'
import { Flag } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { adminApi } from '../../services/adminApi'

export default function SystemFeatureFlags() {
  const [flags, setFlags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFlags()
  }, [])

  const fetchFlags = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getFeatureFlags()
      const data = response.data?.data || response.data || {}
      setFlags(Array.isArray(data) ? data : Object.entries(data).map(([key, value]) => ({ name: key, enabled: value })) || [])
    } catch (error: any) {
      console.error('Error fetching feature flags:', error)
      setFlags([])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFlag = async (flagName: string, currentValue: boolean) => {
    try {
      await adminApi.updateFeatureFlag(flagName, !currentValue)
      fetchFlags()
    } catch (error) {
      console.error('Error updating feature flag:', error)
      alert('Failed to update feature flag')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
        <p className="text-sm text-gray-500 mt-1">Manage system feature toggles</p>
      </div>

      <Card>
        {flags.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <Flag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="mb-2">No feature flags data available</p>
            <p className="text-sm">Feature flag endpoints may not be implemented yet</p>
          </div>
        )}

        <Table
          headers={['Feature', 'Status', 'Description', 'Actions']}
          isLoading={isLoading}
          emptyMessage="No feature flags found"
        >
          {flags.map((flag) => (
            <TableRow key={flag.name}>
              <TableCell className="font-medium">{flag.name}</TableCell>
              <TableCell>
                <Badge variant={flag.enabled ? 'success' : 'default'}>
                  {flag.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">{flag.description || 'N/A'}</TableCell>
              <TableCell>
                <button
                  onClick={() => toggleFlag(flag.name, flag.enabled)}
                  className={`px-3 py-1 text-sm rounded ${
                    flag.enabled
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {flag.enabled ? 'Disable' : 'Enable'}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
