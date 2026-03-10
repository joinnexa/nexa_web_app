import { ReactNode } from 'react'

interface TableProps {
  headers: string[]
  children: ReactNode
  isLoading?: boolean
  emptyMessage?: string
}

export function Table({ headers, children, isLoading, emptyMessage = 'No data available' }: TableProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 dark:bg-gray-700"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"></div>
          ))}
        </div>
      </div>
    )
  }

  const isEmpty = !children || (Array.isArray(children) && children.length === 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isEmpty ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface TableRowProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function TableRow({ children, onClick, className = '' }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''} ${className}`}
    >
      {children}
    </tr>
  )
}

interface TableCellProps {
  children: ReactNode
  className?: string
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${className}`}>{children}</td>
}
