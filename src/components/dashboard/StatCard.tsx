import { LucideIcon } from 'lucide-react'
import { Card } from '../ui/Card'
import { cn } from '../ui/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: LucideIcon
  iconColor?: string
  iconBgColor?: string
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBgColor = 'bg-primary-100',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 truncate">{value}</p>
          {change && (
            <p
              className={cn(
                'text-sm mt-2',
                changeType === 'positive' && 'text-green-600 dark:text-green-400',
                changeType === 'negative' && 'text-red-600 dark:text-red-400',
                changeType === 'neutral' && 'text-gray-500 dark:text-gray-400'
              )}
            >
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              iconBgColor
            )}
          >
            <Icon className={cn('w-6 h-6', iconColor)} />
          </div>
        )}
      </div>
    </Card>
  )
}
