import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Table, TableCell, TableRow } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { adminApi } from '../../services/adminApi'
import { maskPhone, shortId } from '../../utils/privacy'

interface UserRow {
  id: string
  phone_number?: string
  full_name?: string | null
  account_status?: string
  wallet_id?: string
}

export default function UserWalletControlsPage() {
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<UserRow[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const findUsers = async () => {
    setIsLoading(true)
    try {
      const res = await adminApi.getUsers({ search, limit: 20 })
      const data = res.data?.data ?? res.data
      const list = Array.isArray(data) ? data : data?.users ?? data?.items ?? []
      setRows(list)
      if (list[0]?.id) {
        const security = await adminApi.getSecurityEvents({ user_id: list[0].id, limit: 10 })
        const securityData = security.data?.data ?? security.data
        setEvents(Array.isArray(securityData) ? securityData : securityData?.data ?? [])
      } else {
        setEvents([])
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to search users')
      setRows([])
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  const runAction = async (cb: () => Promise<unknown>) => {
    try {
      await cb()
      alert('Action completed')
      findUsers()
    } catch (e: any) {
      alert(e?.message || 'Action failed')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users / Wallet Controls</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Operational controls for wallet freeze, session revocation, and device trust</p>
      </div>

      <Card>
        <div className="flex gap-3">
          <input className="flex-1 px-3 py-2 border rounded-lg" placeholder="Search by user id, phone, name..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && findUsers()} />
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg" onClick={findUsers}>Search</button>
        </div>
      </Card>

      <Card title="User Controls">
        <Table headers={['User', 'Phone', 'Status', 'Actions']} isLoading={isLoading} emptyMessage="Search to load users">
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="font-medium">{row.full_name || shortId(row.id)}</div>
                <div className="text-xs text-gray-500 font-mono">{shortId(row.id)}</div>
              </TableCell>
              <TableCell>{maskPhone(row.phone_number || null)}</TableCell>
              <TableCell>
                <Badge variant={row.account_status === 'FROZEN' ? 'danger' : 'success'}>
                  {row.account_status || 'UNKNOWN'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {row.account_status === 'FROZEN' ? (
                    <button className="px-2 py-1 text-xs border rounded" onClick={() => runAction(() => adminApi.unfreezeUser(row.id))}>Unfreeze</button>
                  ) : (
                    <button className="px-2 py-1 text-xs border rounded" onClick={() => runAction(() => adminApi.freezeUser(row.id))}>Freeze</button>
                  )}
                  <button className="px-2 py-1 text-xs border rounded" onClick={() => runAction(() => adminApi.forceLogoutUser(row.id))}>Force Logout</button>
                  <button
                    className="px-2 py-1 text-xs border rounded"
                    onClick={() => {
                      const deviceId = prompt('Trusted device ID to revoke:')
                      if (!deviceId) return
                      runAction(() => adminApi.untrustDevice(row.id, deviceId))
                    }}
                  >
                    Untrust Device
                  </button>
                  <button
                    className="px-2 py-1 text-xs border rounded"
                    onClick={() => {
                      const reason = prompt('Step-up reason (optional):') || 'Manual step-up required'
                      runAction(() => adminApi.triggerStepUp(row.id, reason))
                    }}
                  >
                    Force Step-up
                  </button>
                  <button className="px-2 py-1 text-xs border rounded" onClick={() => runAction(() => adminApi.addComplianceTag(row.id, 'WATCHLIST'))}>
                    Add WATCHLIST Tag
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Card title="Recent Security Events (selected result set)">
        <Table headers={['Event', 'User', 'Device/IP', 'When']} emptyMessage="No recent events">
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.event_type || 'N/A'}</TableCell>
              <TableCell className="font-mono text-xs">{shortId(event.user_id)}</TableCell>
              <TableCell className="text-xs">
                {(event.device_id || '—')} / {(event.ip_address || '—')}
              </TableCell>
              <TableCell>{event.created_at ? new Date(event.created_at).toLocaleString() : '—'}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
