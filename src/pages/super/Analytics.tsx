import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign, Users, Home } from 'lucide-react'
import { Card, KPICard } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const last7Days = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

function formatMAD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
}

export default function SuperAnalytics() {
  const [isLoading, setIsLoading] = useState(true)
  const [payStats, setPayStats] = useState<Record<string, unknown>>({})
  const [stayStats, setStayStats] = useState<Record<string, unknown>>({})
  const [platformData, setPlatformData] = useState<{ date: string; pay: number; go: number; stays: number }[]>([])

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setIsLoading(true)
      const days = last7Days()
      const [statsRes, stayRes, txRes, ridesRes, bookingsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getStaysStats(),
        adminApi.getTransactions({ limit: 500 }),
        adminApi.getRides({ limit: 500 }),
        adminApi.getBookings({ limit: 500 }),
      ])
      setPayStats(statsRes.data?.data || statsRes.data || {})
      setStayStats(stayRes.data?.data || stayRes.data || {})

      const txs = txRes.data?.data || txRes.data || []
      const rides = Array.isArray(ridesRes.data?.data)
        ? ridesRes.data.data
        : Array.isArray(ridesRes.data)
          ? ridesRes.data
          : []
      const bookings = bookingsRes.data?.data?.items ?? bookingsRes.data?.items ?? bookingsRes.data ?? []

      const payByDate: Record<string, number> = {}
      const goByDate: Record<string, number> = {}
      const staysByDate: Record<string, number> = {}
      days.forEach((d) => {
        payByDate[d] = 0
        goByDate[d] = 0
        staysByDate[d] = 0
      })

      ;(Array.isArray(txs) ? txs : []).forEach((tx: { created_at?: string; amount?: number; status?: string }) => {
        const d = tx.created_at?.split('T')[0]
        if (d && d in payByDate && tx.status === 'COMPLETED') payByDate[d] += parseFloat(String(tx.amount || 0))
      })
      rides.forEach((r: { created_at?: string }) => {
        const d = r.created_at?.split('T')[0]
        if (d && d in goByDate) goByDate[d] += 1
      })
      ;(Array.isArray(bookings) ? bookings : []).forEach((b: { created_at?: string; total_amount?: number; amount?: number }) => {
        const d = b.created_at?.split?.('T')?.[0]
        if (d && d in staysByDate) staysByDate[d] += parseFloat(String(b.total_amount || b.amount || 0))
      })

      setPlatformData(
        days.map((d) => ({
          date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          pay: Math.round(payByDate[d] || 0),
          go: Math.round((goByDate[d] || 0) * 50),
          stays: Math.round(staysByDate[d] || 0),
        }))
      )
    } catch (err: unknown) {
      console.error('Error fetching analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const totalUsers = (payStats.totalUsers ?? payStats.activeUsers ?? 0) as number
  const dailyTx = (payStats.dailyTransactions ?? 0) as number
  const dailyVol = (payStats.dailyVolume ?? 0) as number

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Global Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform-wide metrics and trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Users"
          value={isLoading ? '…' : totalUsers.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
        />
        <KPICard
          title="Daily Transactions"
          value={isLoading ? '…' : dailyTx.toLocaleString()}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KPICard
          title="Pay Volume (24h)"
          value={isLoading ? '…' : formatMAD(dailyVol)}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KPICard
          title="Stays Bookings"
          value={isLoading ? '…' : String(stayStats.totalBookings ?? stayStats.totalHosts ?? 0)}
          icon={<Home className="h-6 w-6" />}
        />
      </div>

      <Card title="Platform Revenue (7 Days)" subtitle="Daily revenue by service">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={
                platformData.length > 0
                  ? platformData
                  : [{ date: '—', pay: 0, go: 0, stays: 0 }]
              }
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="pay" stackId="1" stroke="#0d9488" fill="#0d9488" fillOpacity={0.6} name="Pay" />
              <Area type="monotone" dataKey="go" stackId="1" stroke="#0891b2" fill="#0891b2" fillOpacity={0.6} name="Go" />
              <Area type="monotone" dataKey="stays" stackId="1" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} name="Stays" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
