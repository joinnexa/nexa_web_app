import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Shield,
  AlertTriangle,
  MessageSquare,
  FileText,
  Settings,
  Bell,
  CreditCard,
  Wallet,
  UserCheck,
  Store,
  RefreshCw,
  Send,
  Activity,
  Car,
  FileCheck,
  Map,
  DollarSign,
  AlertCircle,
  Gift,
  Home,
  UserCircle,
  Building,
  Calendar,
  Flag,
  MessageCircle,
  LifeBuoy,
  Search,
} from 'lucide-react'
import { AdminScope, ADMIN_SCOPES } from '../../theme/constants'
import { cn } from '../ui/utils'
import { ScrollArea } from '../ui/scroll-area'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavSection {
  title: string
  items: NavItem[]
}

const SUPER_NAV: NavSection[] = [
  {
    title: 'Super Admin',
    items: [
      { label: 'Overview', href: '/', icon: LayoutDashboard },
      { label: 'Global Analytics', href: '/super/analytics', icon: BarChart3 },
      { label: 'Admin Users', href: '/super/admins', icon: Users },
      { label: 'Roles & Permissions', href: '/super/roles', icon: Shield },
      { label: 'Platform Risk', href: '/super/risk', icon: AlertTriangle },
      { label: 'Support Escalations', href: '/super/escalations', icon: MessageSquare },
      { label: 'Audit Logs', href: '/audit-logs', icon: FileText },
      { label: 'Service Controls', href: '/super/controls', icon: Settings },
      { label: 'Notifications', href: '/super/notifications', icon: Bell },
      { label: 'Global Settings', href: '/super/settings', icon: Settings },
    ],
  },
]

const PAY_NAV: NavSection[] = [
  {
    title: 'Nexa Pay',
    items: [
      { label: 'Overview', href: '/pay/overview', icon: LayoutDashboard },
      { label: 'Transactions', href: '/pay/transactions', icon: CreditCard },
      { label: 'Wallets', href: '/pay/wallets', icon: Wallet },
      { label: 'KYC Review', href: '/pay/kyc-review', icon: UserCheck },
      { label: 'Merchants', href: '/pay/merchants', icon: Store },
      { label: 'Refunds/Reversals', href: '/pay/refunds', icon: RefreshCw },
      { label: 'Payouts', href: '/pay/payouts', icon: Send },
      { label: 'Risk Monitoring', href: '/pay/risk', icon: Activity },
      { label: 'Reports', href: '/pay/reports', icon: FileText },
    ],
  },
]

const GO_NAV: NavSection[] = [
  {
    title: 'Nexa Go',
    items: [
      { label: 'Overview', href: '/go/overview', icon: LayoutDashboard },
      { label: 'Drivers', href: '/go/drivers', icon: Users },
      { label: 'Vehicles & Documents', href: '/go/vehicles', icon: FileCheck },
      { label: 'Trips', href: '/go/trips', icon: Car },
      { label: 'Live Map', href: '/go/live-map', icon: Map },
      { label: 'Pricing & Zones', href: '/go/pricing', icon: DollarSign },
      { label: 'Incidents', href: '/go/incidents', icon: AlertCircle },
      { label: 'Driver Payouts', href: '/go/payouts', icon: Send },
      { label: 'Promotions', href: '/go/promotions', icon: Gift },
    ],
  },
]

const STAYS_NAV: NavSection[] = [
  {
    title: 'Nexa Stays',
    items: [
      { label: 'Overview', href: '/stays/overview', icon: LayoutDashboard },
      { label: 'Hosts', href: '/stays/host-approval', icon: UserCircle },
      { label: 'Guests', href: '/stays/guests', icon: Users },
      { label: 'Listings', href: '/stays/listings', icon: Building },
      { label: 'Bookings', href: '/stays/bookings', icon: Calendar },
      { label: 'Refunds', href: '/stays/refunds', icon: RefreshCw },
      { label: 'Disputes/Damages', href: '/stays/disputes', icon: Flag },
      { label: 'Host Payouts', href: '/stays/payouts', icon: Send },
      { label: 'Reviews Moderation', href: '/stays/reviews', icon: MessageCircle },
    ],
  },
]

const SHARED_NAV: NavSection[] = [
  {
    title: 'Shared',
    items: [
      { label: 'Support Tickets', href: '/support-tickets', icon: LifeBuoy },
      { label: 'Search', href: '/search', icon: Search },
    ],
  },
]

function getScopeNav(scope: AdminScope): NavSection[] {
  switch (scope) {
    case ADMIN_SCOPES.SUPER:
      return [...SUPER_NAV, ...SHARED_NAV]
    case ADMIN_SCOPES.PAY:
      return [...PAY_NAV, ...SHARED_NAV]
    case ADMIN_SCOPES.GO:
      return [...GO_NAV, ...SHARED_NAV]
    case ADMIN_SCOPES.STAYS:
      return [...STAYS_NAV, ...SHARED_NAV]
    default:
      return SUPER_NAV
  }
}

interface SidebarProps {
  scope: AdminScope
}

export function Sidebar({ scope }: SidebarProps) {
  const location = useLocation()
  const navigation = getScopeNav(scope)

  return (
    <aside className="w-64 flex flex-col h-full bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-nexa">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">Nexa</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Admin Portal</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-6">
          {navigation.map((section, idx) => (
            <div key={idx}>
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== '/' && location.pathname.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
