import { useEffect, useMemo, useState } from 'react'
import { Table, TableCell, TableRow } from '../../components/ui/Table'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { adminApi } from '../../services/adminApi'
import type { FraudEvent } from '../../types/riskCompliance'
import { shortId } from '../../utils/privacy'

const PAGE_SIZE = 20

export default function FraudEventsPage() {
  const [rows, setRows] = useState<FraudEvent[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<FraudEvent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    search: '',
    user_id: '',
    transaction_id: '',
    from_date: '',
    to_date: '',
  })

  const load = async (targetPage = page) => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await adminApi.getFraudEvents({
        ...filters,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
        page: targetPage,
        limit: PAGE_SIZE,
      })
      setRows(res.data || [])
      setTotal(res.total || 0)
      setPage(res.page || targetPage)
    } catch (e: any) {
      setError(e?.message || 'Failed to load fraud events')
      setRows([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  const onStatusUpdate = async (
    item: FraudEvent,
    status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'FALSE_POSITIVE',
  ) => {
    const prev = [...rows]
    setRows((current) => current.map((r) => (r.id === item.id ? { ...r, status } : r)))
    try {
      await adminApi.updateFraudEventStatus(item.id, {
        status,
        assigned_owner: item.assigned_owner || undefined,
        internal_note: item.internal_note || undefined,
      })
    } catch (e: any) {
      setRows(prev)
      alert(e?.message || 'Status update failed')
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, 'default' | 'warning' | 'success' | 'danger'> = {
      OPEN: 'warning',
      REVIEWING: 'default',
      RESOLVED: 'success',
      FALSE_POSITIVE: 'default',
    }
    return <Badge variant={map[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fraud Events</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Investigate and resolve flagged fraud events</p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input className="px-3 py-2 border rounded-lg" placeholder="Search reason/type/user..." value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          <select className="px-3 py-2 border rounded-lg" value={filters.severity} onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}>
            <option value="all">All severity</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select className="px-3 py-2 border rounded-lg" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="all">All status</option>
            <option value="OPEN">Open</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False positive</option>
          </select>
          <button className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700" onClick={() => load(1)}>
            Apply Filters
          </button>
        </div>

        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

        <Table headers={['ID', 'Severity', 'Reason', 'Status', 'Risk', 'Created', 'Actions']} isLoading={isLoading} emptyMessage="No fraud events found">
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-xs">{shortId(row.id)}</TableCell>
              <TableCell><Badge variant={row.severity === 'HIGH' ? 'danger' : row.severity === 'MEDIUM' ? 'warning' : 'default'}>{row.severity}</Badge></TableCell>
              <TableCell>{row.reason_code}</TableCell>
              <TableCell>{statusBadge(row.status || 'OPEN')}</TableCell>
              <TableCell>{row.risk_score}</TableCell>
              <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button className="text-primary-600 hover:underline text-xs" onClick={() => setSelected(row)}>Details</button>
                  <select value={row.status || 'OPEN'} onChange={(e) => onStatusUpdate(row, e.target.value as any)} className="text-xs border rounded px-2 py-1">
                    <option value="OPEN">Open</option>
                    <option value="REVIEWING">Reviewing</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="FALSE_POSITIVE">False positive</option>
                  </select>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>

        <div className="flex items-center justify-between mt-4 text-sm">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => load(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => load(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </Card>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">Fraud Event Detail</h3>
            <pre className="text-xs bg-gray-50 dark:bg-gray-900 border rounded p-3 overflow-auto max-h-[60vh]">
              {JSON.stringify(selected, null, 2)}
            </pre>
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 border rounded" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
