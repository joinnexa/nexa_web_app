import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'

interface Order {
  id: string
  customer_id?: string
  merchant_id?: string
  courier_id?: string
  status: string
  total_amount?: number
  subtotal?: number
  delivery_fee?: number
  created_at: string
  completed_at?: string
}

export default function NexaGoOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const params: Record<string, string> = {}
      if (filterStatus !== 'all') params.status = filterStatus

      const response = await adminApi.getDeliveryOrders(params)
      const responseData = response.data?.data || response.data
      const items = Array.isArray(responseData) ? responseData : responseData?.data || responseData?.items || []
      setOrders(items)
    } catch (err: any) {
      if (err.response?.status !== 404) console.error('Error fetching orders:', err)
      setOrders([])
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      COMPLETED: 'success',
      DELIVERED: 'success',
      PICKED_UP: 'warning',
      DELIVERING: 'warning',
      PREPARING: 'warning',
      CREATED: 'default',
      CANCELLED: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Delivery Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Food and delivery orders</p>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">All Status</option>
            <option value="CREATED">Created</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="DELIVERING">Delivering</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Refresh
          </button>
        </div>

        {orders.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No orders found</p>
          </div>
        )}

        <Table
          headers={['Order ID', 'Status', 'Total', 'Created', 'Completed']}
          isLoading={isLoading}
          emptyMessage="No orders found"
        >
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell className="font-semibold">
                {order.total_amount ? formatAmount(order.total_amount) : 'N/A'}
              </TableCell>
              <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
              <TableCell>{order.completed_at ? new Date(order.completed_at).toLocaleString() : '—'}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
