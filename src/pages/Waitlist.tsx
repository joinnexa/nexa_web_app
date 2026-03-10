import { useEffect, useState } from 'react'
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Table, TableRow, TableCell } from '../components/ui/Table'
import { adminApi } from '../services/adminApi'

interface WaitlistEntry {
  id: string
  full_name: string
  phone_number: string
  city: string
  email: string
  how_will_use_nexa: string | null
  created_at: string
}

export default function Waitlist() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 20

  useEffect(() => {
    fetchWaitlist()
  }, [page])

  const fetchWaitlist = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getWaitlist({ page, limit })
      const res = response.data
      const list = Array.isArray(res?.data) ? res.data : []
      setEntries(list)
      setTotal(res?.total ?? list.length)
      setTotalPages(res?.total_pages ?? 1)
    } catch (error) {
      console.error('Error fetching waitlist:', error)
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Waitlist</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          People who signed up for the waitlist (Casablanca). Full name, phone, city, email, and optional how they will use Nexa.
        </p>
      </div>

      <Card>
        {entries.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="mb-2">No waitlist entries yet</p>
            <p className="text-sm">Signups will appear here once the public form is used.</p>
          </div>
        )}

        <Table
          headers={['Name', 'Phone', 'City', 'Email', 'How they will use Nexa', 'Signed up']}
          isLoading={isLoading}
          emptyMessage="No entries"
        >
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.full_name}</TableCell>
              <TableCell className="font-mono text-sm">{entry.phone_number}</TableCell>
              <TableCell>{entry.city}</TableCell>
              <TableCell>
                <a
                  href={`mailto:${entry.email}`}
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {entry.email}
                </a>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {entry.how_will_use_nexa || '—'}
              </TableCell>
              <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(entry.created_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
