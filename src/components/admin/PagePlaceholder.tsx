import { Card } from '../ui/Card'
import { Construction } from 'lucide-react'

interface PagePlaceholderProps {
  title: string
  description?: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{description ?? `This page is under construction.`}</p>
      </div>
      <Card className="p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
        <Construction className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Coming Soon</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          This section is part of the Nexa admin dashboard refactor. Full implementation will be added in a future update.
        </p>
      </Card>
    </div>
  )
}
