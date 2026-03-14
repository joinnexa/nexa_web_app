import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../components/dashboard/StatCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/button'
import { Car, Users, TrendingUp, AlertCircle } from 'lucide-react'
import {
  LineChart,
  Line,
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

export function GoOverview() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [tripChart, setTripChart] = useState<{ date: string; trips: number }[]>([])
  const [cityData, setCityData] = useState<{ city: string; trips: number }[]>([])
  const [riskCount, setRiskCount] = useState(0)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [statsRes, ridesRes, riskRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRides({ limit: 500 }),
        adminApi.getRiskAlerts({ limit: 100 }),
      ])
      const data = statsRes.data?.data || statsRes.data || {}
      setStats(data)

      const rides = ridesRes.data?.data || ridesRes.data || []
      const alerts = riskRes.data?.data || riskRes.data || []

      const days = last7Days()
      const byDate: Record<string, number> = {}
      const byCity: Record<string, number> = {}
      days.forEach(d => { byDate[d] = 0 })

      const rideArr = Array.isArray(rides) ? rides : []
      rideArr.forEach((r: any) => {
        const d = r.created_at?.split('T')[0]
        if (d && d in byDate) byDate[d] += 1
        const city = r.pickup_city || r.city || r.origin_city || 'Unknown'
        byCity[city] = (byCity[city] || 0) + 1
      })

      setTripChart(
        days.map(d => ({
          date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          trips: byDate[d],
        }))
      )
      setCityData(
        Object.entries(byCity)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([city, trips]) => ({ city, trips }))
      )
      setRiskCount(Array.isArray(alerts) ? alerts.length : 0)
    } catch (err) {
      console.error('[GoOverview] fetch error', err)
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

  const tripChartData = tripChart.length > 0 ? tripChart : [{ date: '—', trips: 0 }]
  const cityChartData = cityData.length > 0 ? cityData : [{ city: '—', trips: 0 }]

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Nexa Go Overview</h1>
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Ride-hailing platform operations and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/go/live-map">View Live Map</Link>
          </Button>
          <Button asChild>
            <Link to="/go/drivers">Manage Drivers</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Rides Today"
          value={(stats?.total_rides_today || 0).toLocaleString()}
          change="Live data"
          changeType="neutral"
          icon={Car}
          iconColor="text-cyan-600"
          iconBgColor="bg-cyan-100"
        />
        <StatCard
          title="Online Drivers"
          value={(stats?.active_drivers || 0).toLocaleString()}
          change="Currently active"
          changeType="neutral"
          icon={Users}
          iconColor="text-cyan-600"
          iconBgColor="bg-cyan-100"
        />
        <StatCard
          title="Trips (7 days)"
          value={tripChart.reduce((s, d) => s + d.trips, 0).toLocaleString()}
          change="Completed trips"
          changeType="neutral"
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Active Alerts"
          value={riskCount}
          change={riskCount > 0 ? 'Require attention' : undefined}
          changeType={riskCount > 0 ? 'negative' : 'neutral'}
          icon={AlertCircle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Trip Volume (7 Days)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed trips by day</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tripChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="trips" stroke="#0891b2" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Trips by Location</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Trip count by city/region</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="trips" fill="#0891b2" name="Trips" />
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
          <Link to="/go/drivers">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <Users className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Drivers</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage driver roster</p>
            </div>
          </Link>
          <Link to="/go/registration-applications">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <Car className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Registration Applications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Driver onboarding</p>
            </div>
          </Link>
          <Link to="/go/live-map">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <Car className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Live Map</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Real-time operations</p>
            </div>
          </Link>
          <Link to="/go/rides">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Rides</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">View ride history</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  )
}
