import { Sliders } from 'lucide-react'
import { Card } from '../../components/ui/Card'

export default function SuperControls() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Controls</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Operational controls and service toggles</p>
      </div>

      <Card className="p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
        <Sliders className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Service controls</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          Manage service limits, rate limits, and operational switches. Full controls will be added when the API is available.
        </p>
      </Card>
    </div>
  )
}
