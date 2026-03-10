import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { KPICard, Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

export default function Revenue() {
  const [stats, setStats] = useState<{ totalRevenue?: number; todayRevenue?: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    adminApi.getStaysStats().then((res) => {
      const data = res.data?.data ?? res.data ?? {}
      setStats(data)
    }).catch(() => setStats(null)).finally(() => setIsLoading(false))
  }, [])

  const fmt = (n?: number) =>
    n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MAD' }).format(n) : '0 MAD'

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Stays Revenue</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Nexa Stays booking revenue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPICard
          title="Total Revenue"
          value={fmt(stats?.totalRevenue)}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KPICard
          title="Today's Revenue"
          value={fmt(stats?.todayRevenue)}
          icon={<TrendingUp className="h-6 w-6" />}
        />
      </div>

      <Card title="Revenue Overview" subtitle="Platform fees from confirmed and completed bookings">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Revenue = guest fee (2%) + host fee (2%) = 4% of subtotal per booking.
          Includes only bookings with status CONFIRMED, CHECKED_IN, or COMPLETED.
        </p>
      </Card>
    </div>
  )
}
