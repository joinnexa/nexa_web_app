import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign } from 'lucide-react'
import { Card, KPICard } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function FinanceRevenue() {
  const [revenue, setRevenue] = useState<any>(null)
  const [, setIsLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<any[]>([])

  useEffect(() => {
    fetchRevenue()
  }, [])

  const fetchRevenue = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getRevenue({})
      const data = response.data?.data || response.data || {}
      setRevenue(data)

      // Generate chart data from transactions if available
      try {
        const txResponse = await adminApi.getTransactions({ limit: 100 })
        const transactions = txResponse.data?.data || txResponse.data || []
        
        const revenueByDate: Record<string, number> = {}
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (6 - i))
          return date.toISOString().split('T')[0]
        })

        last7Days.forEach(date => {
          revenueByDate[date] = 0
        })

        transactions.forEach((tx: any) => {
          const date = tx.created_at?.split('T')[0]
          if (date && revenueByDate.hasOwnProperty(date) && tx.status === 'COMPLETED') {
            // Estimate platform fee (5%)
            revenueByDate[date] += parseFloat(tx.amount || 0) * 0.05
          }
        })

        setRevenueData(
          Object.entries(revenueByDate).map(([date, amount]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: amount,
          }))
        )
      } catch (err) {
        console.error('Error processing revenue data:', err)
      }
    } catch (error: any) {
      console.error('Error fetching revenue:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
        <p className="text-sm text-gray-500 mt-1">Platform revenue and financial metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Revenue"
          value={revenue?.total_revenue ? formatAmount(revenue.total_revenue) : '0.00 MAD'}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KPICard
          title="This Month"
          value={revenue?.monthly_revenue ? formatAmount(revenue.monthly_revenue) : '0.00 MAD'}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KPICard
          title="Today"
          value={revenue?.daily_revenue ? formatAmount(revenue.daily_revenue) : '0.00 MAD'}
          icon={<DollarSign className="h-6 w-6" />}
        />
      </div>

      <Card title="Revenue Trend (7 Days)" subtitle="Daily platform revenue">
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} MAD`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} name="Revenue (MAD)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No revenue data available
          </div>
        )}
      </Card>
    </div>
  )
}
