import { DollarSign, MapPin } from 'lucide-react'
import { Card } from '../../components/ui/Card'

export default function GoPricing() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pricing & Zones</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage fare structure and service zones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Fare Structure</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Base rates, per-km, per-minute</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Fare configuration is managed via backend settings. Contact platform ops to update base rates or surge multipliers.
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Service Zones</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Geographic coverage areas</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Zone definitions and availability are configured in the backend. Use the Live Map to monitor coverage.
          </p>
        </Card>
      </div>

      <Card className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Pricing and zone management APIs are not yet exposed in the admin dashboard. Configuration is handled via backend services.
        </p>
      </Card>
    </div>
  )
}
