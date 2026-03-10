import { useEffect, useState } from 'react'
import { DollarSign } from 'lucide-react'
import { Card, KPICard } from '../../components/ui/Card'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { adminApi } from '../../services/adminApi'

interface Settlement {
  id: string
  merchant_id: string
  merchant_name: string
  amount: number
  status: string
  period: string
  settled_at: string | null
  total_received?: number
  platform_fees?: number
  net_amount?: number
}

export default function FinanceMerchantSettlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSettlements()
  }, [])

  const fetchSettlements = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getMerchantSettlements({})
      const data = response.data?.data || response.data
      setSettlements(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Error fetching merchant settlements:', err)
      setSettlements([])
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

  const totalReceived = settlements.reduce((s, x) => s + (x.total_received ?? 0), 0)
  const totalFees = settlements.reduce((s, x) => s + (x.platform_fees ?? 0), 0)
  const totalNet = settlements.reduce((s, x) => s + (x.net_amount ?? x.amount ?? 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Merchant Settlements</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Delivery merchant payouts and settlements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Received"
          value={formatAmount(totalReceived)}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KPICard title="Platform Fees" value={formatAmount(totalFees)} />
        <KPICard title="Net to Merchants" value={formatAmount(totalNet)} />
      </div>

      <Card>
        <Table
          headers={['Merchant', 'Total Received', 'Platform Fees', 'Net Amount', 'Status']}
          isLoading={isLoading}
          emptyMessage="No merchant settlements found"
        >
          {settlements.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.merchant_name}</TableCell>
              <TableCell>{formatAmount(s.total_received ?? 0)}</TableCell>
              <TableCell>{formatAmount(s.platform_fees ?? 0)}</TableCell>
              <TableCell className="font-semibold">{formatAmount(s.net_amount ?? s.amount ?? 0)}</TableCell>
              <TableCell>
                <span className={s.status === 'COMPLETED' ? 'text-green-600' : 'text-amber-600'}>{s.status}</span>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
