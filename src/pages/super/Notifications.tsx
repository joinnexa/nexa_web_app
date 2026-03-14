import { Bell } from 'lucide-react'
import { Card } from '../../components/ui/Card'

export default function SuperNotifications() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage platform-wide notifications</p>
      </div>

      <Card className="p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
        <Bell className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Notifications</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          Configure and send platform-wide notifications. This page will support broadcast and targeted notifications when the API is available.
        </p>
      </Card>
    </div>
  )
}
