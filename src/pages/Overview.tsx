import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Wallet, TrendingUp, ShieldCheck, Activity,
  Car, Package, Truck, Home, CalendarCheck,
} from 'lucide-react'
import { KPICard, Card } from '../components/ui/Card'
import { adminApi } from '../services/adminApi'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface PayStats {
  totalUsers: number
  totalWallets: number
  dailyTransactions: number
  dailyVolume: number
  totalWalletBalance: number
  pendingKyc: number
  activeUsers: number
  verifiedUsers: number
}

interface GoStats {
  total_rides_today?: number
  total_orders_today?: number
  active_drivers?: number
  active_couriers?: number
}

interface StaysStats {
  totalListings?: number
  liveListings?: number
  totalHosts?: number
  totalBookings?: number
  todayBookings?: number
  totalRevenue?: number
}

type ActiveTab = 'all' | 'pay' | 'go' | 'stay'

export default function Overview() {
  const [payStats, setPayStats] = useState<PayStats | null>(null)
  const [goStats, setGoStats] = useState<GoStats | null>(null)
  const [stayStats, setStayStats] = useState<StaysStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>('all')
  const [txVolume, setTxVolume] = useState<any[]>([])
  const [rideData, setRideData] = useState<any[]>([])
  const [bookingData, setBookingData] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [])

  const last7Days = () =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })

  const fetchAll = async () => {
    const settled = await Promise.allSettled([
      fetchPay(),
      fetchGo(),
      fetchStay(),
    ])
    if (settled.every(r => r.status === 'rejected')) {
      console.error('[Overview] All fetches failed')
    }
    setIsLoading(false)
  }

  const fetchPay = async () => {
    try {
      const res = await adminApi.getDashboardStats()
      setPayStats(res.data?.data || res.data || {})

      const txRes = await adminApi.getTransactions({ limit: 100 })
      const txs = txRes.data?.data || txRes.data || []
      const byDate: Record<string, number> = {}
      last7Days().forEach(d => { byDate[d] = 0 })
      txs.forEach((tx: any) => {
        const d = tx.created_at?.split('T')[0]
        if (d && d in byDate) byDate[d] += parseFloat(tx.amount || 0)
      })
      setTxVolume(Object.entries(byDate).map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount,
      })))
    } catch (err) {
      console.error('[Overview] Pay fetch error', err)
    }
  }

  const fetchGo = async () => {
    try {
      const res = await adminApi.getDashboardStats()
      setGoStats(res.data?.data || res.data || {})

      const ridesRes = await adminApi.getRides({})
      const rides = ridesRes.data?.data || ridesRes.data || []
      const byDate: Record<string, number> = {}
      last7Days().forEach(d => { byDate[d] = 0 })
      ;(Array.isArray(rides) ? rides : []).forEach((r: any) => {
        const d = r.created_at?.split('T')[0]
        if (d && d in byDate) byDate[d] += 1
      })
      setRideData(Object.entries(byDate).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      })))
    } catch (err) {
      console.error('[Overview] Go fetch error', err)
    }
  }

  const fetchStay = async () => {
    try {
      const res = await adminApi.getStaysStats()
      const data = res.data?.data ?? res.data ?? {}
      setStayStats(data)

      const bRes = await adminApi.getBookings({ limit: 100 })
      const raw = bRes.data?.data ?? bRes.data
      const bookings = raw?.items ?? (Array.isArray(raw) ? raw : [])
      const byDate: Record<string, number> = {}
      last7Days().forEach(d => { byDate[d] = 0 })
      ;(Array.isArray(bookings) ? bookings : []).forEach((b: any) => {
        const d = b.created_at?.split?.('T')?.[0]
        if (d && d in byDate) byDate[d] += 1
      })
      setBookingData(Object.entries(byDate).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      })))
    } catch (err) {
      console.error('[Overview] Stay fetch error', err)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const tabs: { key: ActiveTab; label: string; color: string }[] = [
    { key: 'all', label: 'All Products', color: 'primary' },
    { key: 'pay', label: 'Nexa Pay', color: 'sky' },
    { key: 'go', label: 'Nexa Go', color: 'emerald' },
    { key: 'stay', label: 'Nexa Stay', color: 'amber' },
  ]

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Overview Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Real-time monitoring across Nexa Pay, Go &amp; Stay
        </p>
      </div>

      {/* Product Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Pay Section ── */}
      {(activeTab === 'all' || activeTab === 'pay') && (
        <>
          {activeTab === 'all' && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-sky-500" />
              <h2
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                onClick={() => navigate('/pay/users')}
              >
                Nexa Pay
              </h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Users" value={payStats?.totalUsers?.toLocaleString() || '0'} icon={<Users className="h-6 w-6" />} />
            <KPICard title="Total Wallets" value={payStats?.totalWallets?.toLocaleString() || '0'} icon={<Wallet className="h-6 w-6" />} />
            <KPICard title="Daily Volume" value={`${(((payStats?.dailyVolume || 0)) / 1000).toFixed(1)}K MAD`} icon={<TrendingUp className="h-6 w-6" />} />
            <KPICard title="Pending KYC" value={payStats?.pendingKyc?.toLocaleString() || '0'} icon={<ShieldCheck className="h-6 w-6" />} />
          </div>
          {txVolume.length > 0 && (
            <Card title="Transaction Volume (7 Days)" subtitle="Daily transaction volume in MAD">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={txVolume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)} MAD`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} name="Volume (MAD)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}

      {/* ── Go Section ── */}
      {(activeTab === 'all' || activeTab === 'go') && (
        <>
          {activeTab === 'all' && (
            <div className="flex items-center gap-2 mt-4">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <h2
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                onClick={() => navigate('/go/rides')}
              >
                Nexa Go
              </h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Rides Today" value={goStats?.total_rides_today?.toLocaleString() || '0'} icon={<Car className="h-6 w-6" />} />
            <KPICard title="Orders Today" value={goStats?.total_orders_today?.toLocaleString() || '0'} icon={<Package className="h-6 w-6" />} />
            <KPICard title="Active Drivers" value={goStats?.active_drivers?.toLocaleString() || '0'} subtitle="Currently online" icon={<Car className="h-6 w-6" />} />
            <KPICard title="Active Couriers" value={goStats?.active_couriers?.toLocaleString() || '0'} subtitle="Currently available" icon={<Truck className="h-6 w-6" />} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Rides per Day (7 Days)" subtitle="Daily taxi ride count">
              {rideData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={rideData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10b981" name="Rides" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No ride data available
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* ── Stay Section ── */}
      {(activeTab === 'all' || activeTab === 'stay') && (
        <>
          {activeTab === 'all' && (
            <div className="flex items-center gap-2 mt-4">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <h2
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                onClick={() => navigate('/stay/listings')}
              >
                Nexa Stay
              </h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Listings" value={stayStats?.totalListings ?? 0} icon={<Home className="h-6 w-6" />} />
            <KPICard title="Live Listings" value={stayStats?.liveListings ?? 0} icon={<Home className="h-6 w-6" />} />
            <KPICard title="Total Hosts" value={stayStats?.totalHosts ?? 0} icon={<Users className="h-6 w-6" />} />
            <KPICard title="Total Bookings" value={stayStats?.totalBookings ?? 0} icon={<CalendarCheck className="h-6 w-6" />} />
          </div>
          {bookingData.length > 0 && (
            <Card title="Bookings per Day (7 Days)" subtitle="Daily booking count">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bookingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
