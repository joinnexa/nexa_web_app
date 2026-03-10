import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  id?: string
  title?: string
  subtitle?: string
  action?: ReactNode
}

export function Card({ children, className = '', id, title, subtitle, action }: CardProps) {
  return (
    <div id={id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function KPICard({ title, value, subtitle, icon, trend, className = '' }: KPICardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">vs last period</span>
            </div>
          )}
        </div>
        {icon && <div className="text-primary-500 dark:text-primary-400">{icon}</div>}
      </div>
    </div>
  )
}
