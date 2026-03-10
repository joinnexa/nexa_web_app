import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Table, TableCell, TableRow } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { adminApi } from '../../services/adminApi'
import type { ReconciliationIssue } from '../../types/riskCompliance'
import { shortId } from '../../utils/privacy'

const PAGE_SIZE = 20

export default function ReconciliationIssuesPage() {
  const [rows, setRows] = useState<ReconciliationIssue[]>([])
  const [selected, setSelected] = useState<ReconciliationIssue | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('all')

  const load = async (targetPage = page) => {
    setIsLoading(true)
    try {
      const res = await adminApi.getReconciliationIssues({
        page: targetPage,
        limit: PAGE_SIZE,
        status,
      })
      setRows(res.data || [])
      setTotal(res.total || 0)
      setPage(targetPage)
    } catch (e: any) {
      alert(e?.message || 'Failed to load reconciliation issues')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await adminApi.updateReconciliationIssueStatus(id, nextStatus)
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: nextStatus as any } : r)))
    } catch (e: any) {
      alert(e?.message || 'Status update failed')
    }
  }

  const downloadCsv = async () => {
    const date = prompt('Report date (YYYY-MM-DD), optional:')
    try {
      const res = await adminApi.exportReconciliationReport({ date: date || undefined })
      const blob = new Blob([res.data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reconciliation-${date || 'latest'}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to export reconciliation report')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reconciliation Issues</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Daily ledger reconciliation mismatches and resolution state</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg" onClick={downloadCsv}>Download CSV</button>
      </div>

      <Card>
        <div className="flex gap-3 mb-4">
          <select className="px-3 py-2 border rounded-lg" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All status</option>
            <option value="OPEN">Open</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
            <option value="IGNORED">Ignored</option>
          </select>
          <button className="px-4 py-2 rounded-lg bg-primary-600 text-white" onClick={() => load(1)}>Apply</button>
        </div>

        <Table headers={['ID', 'Issue Type', 'Severity', 'Status', 'Report Date', 'Actions']} isLoading={isLoading} emptyMessage="No reconciliation issues found">
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-xs">{shortId(row.id)}</TableCell>
              <TableCell>{row.issue_type}</TableCell>
              <TableCell>
                <Badge variant={row.severity === 'HIGH' ? 'danger' : row.severity === 'MEDIUM' ? 'warning' : 'default'}>
                  {row.severity}
                </Badge>
              </TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.report_date}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button className="text-primary-600 hover:underline text-xs" onClick={() => setSelected(row)}>Details</button>
                  <select className="text-xs border rounded px-2 py-1" value={row.status} onChange={(e) => updateStatus(row.id, e.target.value)}>
                    <option value="OPEN">OPEN</option>
                    <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="IGNORED">IGNORED</option>
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
            <h3 className="text-lg font-semibold mb-3">Issue Details</h3>
            <pre className="text-xs bg-gray-50 dark:bg-gray-900 border rounded p-3 overflow-auto max-h-[60vh]">{JSON.stringify(selected, null, 2)}</pre>
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 border rounded" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
