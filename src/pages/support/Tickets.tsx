import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Table, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { adminApi } from '../../services/adminApi'

export default function SupportTickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getTickets({})
      const data = response.data?.data || response.data || {}
      setTickets(Array.isArray(data) ? data : data?.tickets || data?.items || [])
    } catch (error: any) {
      console.error('Error fetching tickets:', error)
      setTickets([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      RESOLVED: 'success',
      IN_PROGRESS: 'warning',
      OPEN: 'default',
      CLOSED: 'default',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-sm text-gray-500 mt-1">Manage customer support requests</p>
      </div>

      <Card>
        {tickets.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="mb-2">No tickets data available</p>
            <p className="text-sm">Support ticket endpoints may not be implemented yet</p>
          </div>
        )}

        <Table
          headers={['Ticket ID', 'User', 'Subject', 'Status', 'Priority', 'Created', 'Updated']}
          isLoading={isLoading}
          emptyMessage="No tickets found"
        >
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-mono text-xs">{ticket.id.substring(0, 8)}...</TableCell>
              <TableCell>{ticket.user_name || ticket.user_phone || 'N/A'}</TableCell>
              <TableCell>{ticket.subject || 'N/A'}</TableCell>
              <TableCell>{getStatusBadge(ticket.status)}</TableCell>
              <TableCell>
                <Badge variant={ticket.priority === 'HIGH' ? 'danger' : ticket.priority === 'MEDIUM' ? 'warning' : 'default'}>
                  {ticket.priority || 'LOW'}
                </Badge>
              </TableCell>
              <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(ticket.updated_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  )
}
