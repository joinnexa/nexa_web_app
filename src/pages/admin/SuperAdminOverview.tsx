import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../components/dashboard/StatCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/button'
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  Car,
  Home,
  CreditCard,
  CheckCircle,
  Clock,
} from 'lucide-react'
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
import { adminApi } from '../../services/adminApi'

const last7Days = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

function formatMAD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
}

export function SuperAdminOverview() {
  const [isLoading, setIsLoading] = useState(true)
  const [payStats, setPayStats] = useState<any>(null)
  const [goStats, setGoStats] = useState<any>(null)
  const [stayStats, setStayStats] = useState<any>(null)
  const [platformData, setPlatformData] = useState<{ date: string; pay: number; go: number; stays: number }[]>([])
  const [riskStats, setRiskStats] = useState<any>(null)
  const [riskAlerts, setRiskAlerts] = useState<any[]>([])
  const [kycPending, setKycPending] = useState(0)
  const [hostsPending, setHostsPending] = useState(0)
  const [driverAppsPending, setDriverAppsPending] = useState(0)
  const [ticketsOpen, setTicketsOpen] = useState(0)

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAll = async () => {
    try {
      setIsLoading(true)
      await Promise.all([
        fetchPayStats(),
        fetchGoStats(),
        fetchStayStats(),
        fetchPlatformChart(),
        fetchRisk(),
        fetchPendingCounts(),
      ])
    } catch (err) {
      console.error('[SuperAdminOverview] fetch error', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPayStats = async () => {
    try {
      const res = await adminApi.getDashboardStats()
      setPayStats(res.data?.data || res.data || {})
    } catch (err) {
      console.error('[SuperAdminOverview] Pay stats', err)
    }
  }

  const fetchGoStats = async () => {
    try {
      const res = await adminApi.getDashboardStats()
      setGoStats(res.data?.data || res.data || {})
    } catch (err) {
      console.error('[SuperAdminOverview] Go stats', err)
    }
  }

  const fetchStayStats = async () => {
    try {
      const res = await adminApi.getStaysStats()
      setStayStats(res.data?.data || res.data || {})
    } catch (err) {
      console.error('[SuperAdminOverview] Stays stats', err)
    }
  }

  const fetchPlatformChart = async () => {
    try {
      const days = last7Days()
      const [txRes, ridesRes, bookingsRes] = await Promise.all([
        adminApi.getTransactions({ limit: 500 }),
        adminApi.getRides({ limit: 500 }),
        adminApi.getBookings({ limit: 500 }),
      ])
      const txs = txRes.data?.data || txRes.data || []
      const rides = Array.isArray(ridesRes.data?.data) ? ridesRes.data.data : Array.isArray(ridesRes.data) ? ridesRes.data : []
      const bookings = (bookingsRes.data?.data?.items ?? bookingsRes.data?.items ?? bookingsRes.data) || []
      const payByDate: Record<string, number> = {}
      const goByDate: Record<string, number> = {}
      const staysByDate: Record<string, number> = {}
      days.forEach(d => {
        payByDate[d] = 0
        goByDate[d] = 0
        staysByDate[d] = 0
      })
      ;(Array.isArray(txs) ? txs : []).forEach((tx: any) => {
        const d = tx.created_at?.split('T')[0]
        if (d && d in payByDate && tx.status === 'COMPLETED') payByDate[d] += parseFloat(tx.amount || 0)
      })
      rides.forEach((r: any) => {
        const d = r.created_at?.split('T')[0]
        if (d && d in goByDate) goByDate[d] += 1
      })
      ;(Array.isArray(bookings) ? bookings : []).forEach((b: any) => {
        const d = b.created_at?.split?.('T')?.[0]
        if (d && d in staysByDate) staysByDate[d] += parseFloat(b.total_amount || b.amount || 0)
      })
      setPlatformData(
        days.map(d => ({
          date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          pay: Math.round(payByDate[d] || 0),
          go: Math.round((goByDate[d] || 0) * 50),
          stays: Math.round(staysByDate[d] || 0),
        }))
      )
    } catch (err) {
      console.error('[SuperAdminOverview] Platform chart', err)
    }
  }

  const fetchRisk = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        adminApi.getRiskStats(),
        adminApi.getRiskAlerts({ limit: 20 }),
      ])
      setRiskStats(statsRes.data?.data || statsRes.data || {})
      const alerts = alertsRes.data?.data || alertsRes.data || []
      setRiskAlerts(Array.isArray(alerts) ? alerts : [])
    } catch (err) {
      console.error('[SuperAdminOverview] Risk', err)
    }
  }

  const fetchPendingCounts = async () => {
    try {
      const [kycRes, hostsRes, driverRes, ticketsRes] = await Promise.allSettled([
        adminApi.getKycQueue({ limit: 1000 }),
        adminApi.getHosts({ limit: 1000 }),
        adminApi.getRegistrationApplications({ limit: 1000 }),
        adminApi.getTickets({ limit: 1000 }),
      ])
      const countFrom = (raw: any) => {
        if (Array.isArray(raw)) return raw.length
        const arr = raw?.items ?? raw?.data
        return Array.isArray(arr) ? arr.length : (raw?.total ?? 0)
      }
      const kycRaw = kycRes.status === 'fulfilled' ? (kycRes.value.data?.data ?? kycRes.value.data) : null
      const hostsRaw = hostsRes.status === 'fulfilled' ? (hostsRes.value.data?.data ?? hostsRes.value.data) : null
      const driverRaw = driverRes.status === 'fulfilled' ? (driverRes.value.data?.data ?? driverRes.value.data) : null
      const ticketsRaw = ticketsRes.status === 'fulfilled' ? (ticketsRes.value.data?.data ?? ticketsRes.value.data) : null
      setKycPending(kycRaw ? countFrom(kycRaw) : 0)
      setHostsPending(hostsRaw ? countFrom(hostsRaw) : 0)
      setDriverAppsPending(driverRaw ? countFrom(driverRaw) : 0)
      setTicketsOpen(ticketsRaw ? countFrom(ticketsRaw) : 0)
    } catch (err) {
      console.error('[SuperAdminOverview] Pending counts', err)
    }
  }

  const totalGmv =
    (payStats?.dailyVolume || 0) +
    ((goStats?.total_rides_today || 0) + (goStats?.total_orders_today || 0)) * 50 +
    (stayStats?.totalRevenue || 0) / 30
  const criticalAlerts = riskStats?.highSeverity ?? riskStats?.openCases ?? riskAlerts.filter((a: any) => a.severity === 'HIGH').length

  const riskChartData = riskStats
    ? [
        { service: 'Pay', low: riskStats.lowRisk?.pay ?? 0, medium: riskStats.mediumRisk?.pay ?? 0, high: riskStats.highRisk?.pay ?? 0 },
        { service: 'Go', low: riskStats.lowRisk?.go ?? 0, medium: riskStats.mediumRisk?.go ?? 0, high: riskStats.highRisk?.go ?? 0 },
        { service: 'Stays', low: riskStats.lowRisk?.stays ?? 0, medium: riskStats.mediumRisk?.stays ?? 0, high: riskStats.highRisk?.stays ?? 0 },
      ]
    : [
        { service: 'Pay', low: 0, medium: 0, high: 0 },
        { service: 'Go', low: 0, medium: 0, high: 0 },
        { service: 'Stays', low: 0, medium: 0, high: 0 },
      ]

  const recentIncidents = riskAlerts.slice(0, 3).map((a: any) => ({
    title: a.description || a.type || a.reason || 'Risk Alert',
    service: a.source || 'Platform',
    severity: (a.severity || 'medium').toLowerCase(),
    status: a.status === 'RESOLVED' ? 'resolved' : 'investigating',
    time: a.created_at ? new Date(a.created_at).toLocaleString() : '',
  }))

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Platform Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Monitor global metrics across all Nexa services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total GMV (24h)"
          value={formatMAD(totalGmv)}
          change={`Pay ${formatMAD(payStats?.dailyVolume || 0)} · Go ${goStats?.total_rides_today || 0} rides`}
          changeType="neutral"
          icon={DollarSign}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
        />
        <StatCard
          title="Active Users"
          value={(payStats?.totalUsers || payStats?.activeUsers || 0).toLocaleString()}
          change={payStats?.verifiedUsers != null ? `${payStats.verifiedUsers} verified` : undefined}
          changeType="neutral"
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Daily Transactions"
          value={(payStats?.dailyTransactions || 0).toLocaleString()}
          change={`${((payStats?.successRate || 0) * 100).toFixed(1)}% success`}
          changeType="neutral"
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
        <StatCard
          title="Critical Alerts"
          value={criticalAlerts}
          change={ticketsOpen ? `${ticketsOpen} tickets open` : undefined}
          changeType={criticalAlerts > 0 ? 'negative' : 'neutral'}
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Link to="/pay/overview">
          <Card className="p-6 hover:shadow-nexa-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Nexa Pay</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Payment Platform</p>
                </div>
              </div>
              <Badge variant="pay">Active</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Transactions (24h)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{(payStats?.dailyTransactions || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Volume</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{formatMAD(payStats?.dailyVolume || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{((payStats?.successRate ?? 0.98) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/go/overview">
          <Card className="p-6 hover:shadow-nexa-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Car className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Nexa Go</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ride-Hailing</p>
                </div>
              </div>
              <Badge variant="go">Active</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rides Today</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{(goStats?.total_rides_today || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Online Drivers</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{(goStats?.active_drivers || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Orders Today</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{(goStats?.total_orders_today || 0).toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/stays/overview">
          <Card className="p-6 hover:shadow-nexa-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Home className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Nexa Stays</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Accommodations</p>
                </div>
              </div>
              <Badge variant="stays">Active</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Bookings</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{(stayStats?.totalBookings || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Listings</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{(stayStats?.liveListings ?? stayStats?.totalListings ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Hosts</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{(stayStats?.totalHosts || 0).toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Platform Revenue (7 Days)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily revenue by service</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformData.length > 0 ? platformData : [{ date: '—', pay: 0, go: 0, stays: 0 }]}>
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

        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Risk Distribution</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Flagged items by severity</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="service" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="low" fill="#22c55e" name="Low Risk" />
                <Bar dataKey="medium" fill="#f59e0b" name="Medium Risk" />
                <Bar dataKey="high" fill="#ef4444" name="High Risk" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Pending Approvals</h3>
            <Badge variant="secondary">{kycPending + hostsPending + driverAppsPending} items</Badge>
          </div>
          <div className="space-y-4">
            {[
              { type: 'KYC Review', count: kycPending, service: 'Pay', href: '/pay/kyc-review' },
              { type: 'Host Verification', count: hostsPending, service: 'Stays', href: '/stays/host-approval' },
              { type: 'Driver Onboarding', count: driverAppsPending, service: 'Go', href: '/go/registration-applications' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{item.type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.service}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{item.count} pending</Badge>
                  <Link to={item.href}>
                    <Button size="sm">Review</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Incidents</h3>
            <Link to="/system/risk-alerts">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentIncidents.length > 0
              ? recentIncidents.map((incident, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{incident.title}</p>
                    <Badge
                      variant="outline"
                      className={
                        incident.severity === 'high'
                          ? 'border-red-200 text-red-700 dark:border-red-800 dark:text-red-400'
                          : incident.severity === 'medium'
                          ? 'border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400'
                          : 'border-gray-200 text-gray-700 dark:border-gray-600 dark:text-gray-400'
                      }
                    >
                      {incident.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{incident.service}</span>
                    <span>•</span>
                    <span>{incident.time}</span>
                  </div>
                </div>
                {incident.status === 'resolved' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                )}
              </div>
            ))
              : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">No recent incidents</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
