import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../components/dashboard/StatCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/button'
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  CheckCircle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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

export function PayOverview() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [transactionChart, setTransactionChart] = useState<{ date: string; successful: number; failed: number }[]>([])
  const [volumeChart, setVolumeChart] = useState<{ date: string; volume: number }[]>([])
  const [kycPending, setKycPending] = useState(0)
  const [flaggedCount, setFlaggedCount] = useState(0)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [statsRes, txRes, kycRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getTransactions({ limit: 500 }),
        adminApi.getKycQueue({ limit: 500 }),
      ])
      const data = statsRes.data?.data || statsRes.data || {}
      setStats(data)

      const txs = txRes.data?.data || txRes.data || []
      const arr = Array.isArray(txs) ? txs : []

      const days = last7Days()
      const byDate: Record<string, { successful: number; failed: number }> = {}
      const volumeByDate: Record<string, number> = {}
      days.forEach(d => {
        byDate[d] = { successful: 0, failed: 0 }
        volumeByDate[d] = 0
      })

      arr.forEach((tx: any) => {
        const d = tx.created_at?.split('T')[0]
        if (d && d in byDate) {
          if (tx.status === 'COMPLETED') {
            byDate[d].successful += 1
            volumeByDate[d] += parseFloat(tx.amount || 0)
          } else {
            byDate[d].failed += 1
          }
        }
      })

      setTransactionChart(
        days.map(d => ({
          date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          successful: byDate[d].successful,
          failed: byDate[d].failed,
        }))
      )
      setVolumeChart(
        days.map(d => ({
          date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          volume: Math.round(volumeByDate[d]),
        }))
      )

      const kycRaw = kycRes.data?.data ?? kycRes.data
      setKycPending(Array.isArray(kycRaw) ? kycRaw.length : kycRaw?.items?.length ?? kycRaw?.total ?? 0)
      setFlaggedCount(data.flaggedTransactions ?? 0)
    } catch (err) {
      console.error('[PayOverview] fetch error', err)
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

  const chartData = transactionChart.length > 0 ? transactionChart : [{ date: '—', successful: 0, failed: 0 }]
  const volData = volumeChart.length > 0 ? volumeChart : [{ date: '—', volume: 0 }]

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Nexa Pay Overview</h1>
            <span className="w-2 h-2 rounded-full bg-teal-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Payment platform monitoring and administration</p>
        </div>
        <Button asChild>
          <Link to="/pay/transactions" className="inline-flex items-center justify-center">View Transactions</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Transaction Volume (24h)"
          value={formatMAD(stats?.dailyVolume || 0)}
          change={`${(stats?.dailyTransactions || 0).toLocaleString()} transactions`}
          changeType="neutral"
          icon={DollarSign}
          iconColor="text-teal-600"
          iconBgColor="bg-teal-100"
        />
        <StatCard
          title="Total Transactions"
          value={(stats?.dailyTransactions || 0).toLocaleString()}
          change={stats?.failedTransactions ? `${stats.failedTransactions} failed` : undefined}
          changeType="neutral"
          icon={CreditCard}
          iconColor="text-teal-600"
          iconBgColor="bg-teal-100"
        />
        <StatCard
          title="Success Rate"
          value={`${((stats?.successRate ?? 0.98) * 100).toFixed(1)}%`}
          change="Last 7 days"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Flagged Activity"
          value={flaggedCount}
          change={flaggedCount > 0 ? 'Require review' : undefined}
          changeType={flaggedCount > 0 ? 'negative' : 'neutral'}
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Transaction Success vs Failed (7 Days)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily breakdown</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="successful" stroke="#0d9488" strokeWidth={2} dot={{ r: 4 }} name="Successful" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Failed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Transaction Volume (7 Days)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily volume trend</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatMAD(v)} />
                <Area type="monotone" dataKey="volume" stroke="#0d9488" fill="#0d9488" fillOpacity={0.3} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/pay/transactions">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <CreditCard className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Transactions</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage all transactions</p>
            </div>
          </Link>
          <Link to="/pay/kyc-review">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <CheckCircle className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">KYC Review</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{kycPending} pending reviews</p>
            </div>
          </Link>
          <Link to="/pay/wallets">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <DollarSign className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Wallets</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">View wallet balances</p>
            </div>
          </Link>
          <Link to="/support-tickets">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Flagged Transactions</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{flaggedCount} require review</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  )
}
