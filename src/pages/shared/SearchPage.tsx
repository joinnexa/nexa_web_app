import { useEffect, useState } from 'react'
import { Search, User, CreditCard, Home } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { adminApi } from '../../services/adminApi'

type Tab = 'users' | 'transactions' | 'bookings'

interface SearchResult {
  type: Tab
  id: string
  display: string
  meta?: string
  raw: Record<string, unknown>
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('users')

  const search = async () => {
    if (!query.trim()) return
    try {
      setIsLoading(true)
      setResults([])
      const q = query.trim().toLowerCase()
      const [usersRes, txRes, bookingsRes] = await Promise.all([
        adminApi.getUsers({ limit: 100 }),
        adminApi.getTransactions({ limit: 100 }),
        adminApi.getBookings({ limit: 100 }),
      ])

      const users = usersRes.data?.data || usersRes.data || {}
      const userList = Array.isArray(users) ? users : users?.users || users?.items || []
      const userResults: SearchResult[] = userList
        .filter(
          (u: Record<string, unknown>) =>
            String(u.id ?? '').toLowerCase().includes(q) ||
            String(u.full_name ?? '').toLowerCase().includes(q) ||
            String(u.phone_number ?? '').toLowerCase().includes(q) ||
            String(u.email ?? '').toLowerCase().includes(q)
        )
        .slice(0, 20)
        .map((u: Record<string, unknown>) => ({
        type: 'users' as const,
        id: String(u.id ?? ''),
        display: String(u.full_name || u.phone_number || u.email || u.id),
        meta: String(u.phone_number || u.account_type || ''),
        raw: u,
      }))

      const txs = txRes.data?.data || txRes.data || {}
      const txList = Array.isArray(txs) ? txs : txs?.transactions || txs?.items || []
      const txResults: SearchResult[] = txList
        .filter(
          (t: Record<string, unknown>) =>
            String(t.id ?? '').toLowerCase().includes(q) ||
            String(t.amount ?? '').includes(q)
        )
        .slice(0, 20)
        .map((t: Record<string, unknown>) => ({
        type: 'transactions' as const,
        id: String(t.id ?? ''),
        display: `${t.id ? String(t.id).substring(0, 8) : 'N/A'} — ${t.amount ?? 0} MAD`,
        meta: t.status ? String(t.status) : undefined,
        raw: t,
      }))

      const bookings = bookingsRes.data?.data || bookingsRes.data || {}
      const bookList = (bookings?.items ?? bookings) as unknown[]
      const bookArr = Array.isArray(bookList) ? bookList : []
      const bookResults: SearchResult[] = (bookArr as Record<string, unknown>[])
        .filter((b) => {
          const g = b.guest as Record<string, unknown> | undefined
          const l = b.listing as Record<string, unknown> | undefined
          return (
            String(b.id ?? '').toLowerCase().includes(q) ||
            String(g?.full_name ?? '').toLowerCase().includes(q) ||
            String(g?.phone_number ?? '').toLowerCase().includes(q) ||
            String(l?.title ?? '').toLowerCase().includes(q)
          )
        })
        .slice(0, 20)
        .map((b) => {
        const guest = b.guest as Record<string, unknown> | undefined
        const listing = b.listing as Record<string, unknown> | undefined
        return {
          type: 'bookings' as const,
          id: String(b.id ?? ''),
          display: String(guest?.full_name || guest?.phone_number || b.id),
          meta: listing ? String(listing.title) : String(b.status ?? ''),
          raw: b,
        }
      })

      setResults([...userResults, ...txResults, ...bookResults])
    } catch (err: unknown) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = results.filter((r) => r.type === activeTab)
  const hasResults = results.length > 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Global Search</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Search across users, transactions, and bookings</p>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Search users, transactions, bookings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <button
            onClick={search}
            disabled={isLoading || !query.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {hasResults && (
          <div className="flex gap-2 mb-4">
            {(['users', 'transactions', 'bookings'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}

        {results.length === 0 && !isLoading && query && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No results for "{query}". Try a different query.
          </div>
        )}

        {results.length === 0 && !query && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Enter a search term to find users, transactions, or bookings</p>
          </div>
        )}

        {filtered.length > 0 && (
          <Table
            headers={['Type', 'Result', 'Details']}
            isLoading={false}
            emptyMessage=""
          >
            {filtered.map((r) => (
              <TableRow key={`${r.type}-${r.id}`}>
                <TableCell>
                  <Badge variant="outline">
                    {r.type === 'users' && <User className="inline h-4 w-4 mr-1" />}
                    {r.type === 'transactions' && <CreditCard className="inline h-4 w-4 mr-1" />}
                    {r.type === 'bookings' && <Home className="inline h-4 w-4 mr-1" />}
                    {r.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{r.display}</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">{r.meta || '—'}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}
