import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../components/dashboard/StatCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/button'
import { Home, Calendar, TrendingUp, AlertCircle } from 'lucide-react'
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
} from 'recharts'
import { adminApi } from '../../services/adminApi'

const last7Days = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

export function StaysOverview() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [bookingChart, setBookingChart] = useState<{ date: string; bookings: number }[]>([])
  const [propertyTypeData, setPropertyTypeData] = useState<{ type: string; count: number }[]>([])
  const [hostsPending, setHostsPending] = useState(0)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [statsRes, bookingsRes, listingsRes, hostsRes] = await Promise.all([
        adminApi.getStaysStats(),
        adminApi.getBookings({ limit: 500 }),
        adminApi.getListings({ limit: 500 }),
        adminApi.getHosts({ limit: 500 }),
      ])
      const data = statsRes.data?.data || statsRes.data || {}
      setStats(data)

      const rawBookings = bookingsRes.data?.data ?? bookingsRes.data
      const bookings = rawBookings?.items ?? (Array.isArray(rawBookings) ? rawBookings : [])

      const rawListings = listingsRes.data?.data ?? listingsRes.data
      const listings = rawListings?.items ?? (Array.isArray(rawListings) ? rawListings : [])

      const rawHosts = hostsRes.data?.data ?? hostsRes.data
      const hosts = rawHosts?.items ?? (Array.isArray(rawHosts) ? rawHosts : [])

      const days = last7Days()
      const byDate: Record<string, number> = {}
      const byType: Record<string, number> = {}
      days.forEach(d => { byDate[d] = 0 })

      bookings.forEach((b: any) => {
        const d = b.created_at?.split?.('T')?.[0]
        if (d && d in byDate) byDate[d] += 1
      })

      listings.forEach((l: any) => {
        const t = l.property_type || l.type || 'Other'
        byType[t] = (byType[t] || 0) + 1
      })

      setBookingChart(
        days.map(d => ({
          date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          bookings: byDate[d],
        }))
      )
      setPropertyTypeData(
        Object.entries(byType)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([type, count]) => ({ type, count }))
      )
      setHostsPending(hosts.filter((h: any) => h.status === 'PENDING' || h.status === 'pending').length)
    } catch (err) {
      console.error('[StaysOverview] fetch error', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const occupancy = stats?.totalListings && stats?.liveListings
    ? ((stats.liveListings / stats.totalListings) * 100).toFixed(1)
    : '—'
  const bookingChartData = bookingChart.length > 0 ? bookingChart : [{ date: '—', bookings: 0 }]
  const typeChartData = propertyTypeData.length > 0 ? propertyTypeData : [{ type: '—', count: 0 }]

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Nexa Stays Overview</h1>
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Accommodation platform operations and monitoring</p>
        </div>
        <Button asChild>
          <Link to="/stays/bookings">View Bookings</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Bookings"
          value={(stats?.totalBookings || 0).toLocaleString()}
          change={stats?.todayBookings ? `Today: ${stats.todayBookings}` : undefined}
          changeType="neutral"
          icon={Calendar}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
        <StatCard
          title="Active Listings"
          value={(stats?.liveListings ?? stats?.totalListings ?? 0).toLocaleString()}
          change="Live properties"
          changeType="neutral"
          icon={Home}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
        <StatCard
          title="Occupancy"
          value={typeof occupancy === 'string' ? occupancy : `${occupancy}%`}
          change="Listings live"
          changeType="neutral"
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Total Hosts"
          value={(stats?.totalHosts || 0).toLocaleString()}
          change={hostsPending ? `${hostsPending} pending approval` : undefined}
          changeType="neutral"
          icon={AlertCircle}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Booking Trend (7 Days)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily bookings confirmed</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="bookings" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Listings by Property Type</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active listings distribution</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" name="Listings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/stays/host-approval">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <Home className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Host Approval</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{hostsPending} pending applications</p>
            </div>
          </Link>
          <Link to="/stays/listings">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <Home className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Listings</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Moderate listings</p>
            </div>
          </Link>
          <Link to="/stays/bookings">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <Calendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Bookings</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage reservations</p>
            </div>
          </Link>
          <Link to="/stays/disputes">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Disputes</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Review disputes</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  )
}
