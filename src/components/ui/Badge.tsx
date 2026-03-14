import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-600 text-white',
        secondary: 'border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        destructive: 'border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        danger: 'border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        info: 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        outline: 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
        success: 'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        pay: 'border-transparent bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        go: 'border-transparent bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
        stays: 'border-transparent bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
