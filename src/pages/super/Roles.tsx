import { Key } from 'lucide-react'
import { Card } from '../../components/ui/Card'

export default function SuperRoles() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Roles & Permissions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage admin roles and access</p>
      </div>

      <Card className="p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
        <Key className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Roles management</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          Configure admin roles and permissions. This page will show role definitions and permission matrix when the API is available.
        </p>
      </Card>
    </div>
  )
}
