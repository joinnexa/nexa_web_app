import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { PermissionGuard } from './PermissionGuard'
import { Permission } from '../types/roles'
import {
  LayoutDashboard,
  Wallet,
  Users,
  FileText,
  BookOpen,
  ShieldCheck,
  DollarSign,
  CreditCard,
  TrendingUp,
  MessageSquare,
  RotateCcw,
  FileSearch,
  AlertTriangle,
  Flag,
  Settings,
  LogOut,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
  Shield,
  ShieldAlert,
  FileWarning,
  Scale,
  UserCog,
  Car,
  Package,
  Truck,
  Store,
  FileCheck,
  Home,
  CalendarCheck,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: any
  permission?: Permission | null
  children?: NavItem[]
}

export default function Layout() {
  const { logout, adminUser } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['identity&compliance', 'nexapay', 'nexago', 'nexastays'])
  )

  const navigation: NavItem[] = [
    { name: 'Overview', href: '/', icon: LayoutDashboard, permission: null },

    // ── Identity & Compliance (unified across ecosystem) ──
    {
      name: 'Identity & Compliance',
      href: '#',
      icon: ShieldCheck,
      permission: null,
      children: [
        { name: 'Unified KYC', href: '/admin/kyc', icon: FileCheck, permission: Permission.VIEW_KYC },
        { name: 'Driver Applications', href: '/admin/driver-applications', icon: Car, permission: null },
        { name: 'Courier Applications', href: '/admin/courier-applications', icon: Truck, permission: null },
      ],
    },

    // ── Nexa Pay ──
    {
      name: 'Nexa Pay',
      href: '#',
      icon: Wallet,
      permission: null,
      children: [
        { name: 'Users', href: '/pay/users', icon: Users, permission: Permission.VIEW_USERS },
        { name: 'Wallets', href: '/pay/wallets', icon: Wallet, permission: Permission.VIEW_USERS },
        { name: 'Transactions', href: '/pay/transactions', icon: FileText, permission: Permission.VIEW_TRANSACTIONS },
        { name: 'Ledger', href: '/pay/ledger', icon: BookOpen, permission: Permission.VIEW_TRANSACTIONS },
        { name: 'KYC & Risk', href: '/pay/kyc-risk', icon: ShieldCheck, permission: Permission.VIEW_KYC },
      ],
    },

    // ── Nexa Go ──
    {
      name: 'Nexa Go',
      href: '#',
      icon: Car,
      permission: null,
      children: [
        { name: 'Rides (Taxi)', href: '/go/rides', icon: Car },
        { name: 'Drivers', href: '/go/drivers', icon: Car },
        { name: 'Orders (Delivery)', href: '/go/orders', icon: Package },
        { name: 'Couriers', href: '/go/couriers', icon: Truck },
        { name: 'Merchants', href: '/go/merchants', icon: Store },
      ],
    },

    // ── Nexa Stay ──
    {
      name: 'Nexa Stay',
      href: '#',
      icon: Home,
      permission: null,
      children: [
        { name: 'Listings', href: '/stay/listings', icon: Home },
        { name: 'Hosts', href: '/stay/hosts', icon: Users },
        { name: 'Bookings', href: '/stay/bookings', icon: CalendarCheck },
        { name: 'Revenue', href: '/stay/revenue', icon: TrendingUp },
      ],
    },

    // ── Finance (shared) ──
    {
      name: 'Finance',
      href: '#',
      icon: DollarSign,
      permission: null,
      children: [
        { name: 'Revenue', href: '/finance/revenue', icon: TrendingUp, permission: Permission.VIEW_REPORTS },
        { name: 'Commissions', href: '/finance/commissions', icon: CreditCard, permission: Permission.VIEW_REPORTS },
        { name: 'Driver Payouts', href: '/finance/driver-payouts', icon: DollarSign, permission: Permission.VIEW_REPORTS },
        { name: 'Merchant Settlements', href: '/finance/merchant-settlements', icon: CreditCard, permission: Permission.VIEW_REPORTS },
      ],
    },

    // ── Support ──
    {
      name: 'Support',
      href: '#',
      icon: MessageSquare,
      permission: null,
      children: [
        { name: 'Tickets', href: '/support/tickets', icon: MessageSquare, permission: null },
        { name: 'Refunds', href: '/support/refunds', icon: RotateCcw, permission: null },
      ],
    },

    { name: 'Waitlist', href: '/waitlist', icon: ClipboardList, permission: null },

    // ── Risk & Compliance ──
    {
      name: 'Risk & Compliance',
      href: '#',
      icon: Shield,
      permission: Permission.VIEW_RISK_DASHBOARD,
      children: [
        { name: 'Overview', href: '/risk-compliance/overview', icon: LayoutDashboard, permission: Permission.VIEW_RISK_DASHBOARD },
        { name: 'Fraud Events', href: '/risk-compliance/fraud-events', icon: ShieldAlert, permission: Permission.VIEW_RISK_DASHBOARD },
        { name: 'SAR Reports', href: '/risk-compliance/sar-reports', icon: FileWarning, permission: Permission.VIEW_RISK_DASHBOARD },
        { name: 'Reconciliation Issues', href: '/risk-compliance/reconciliation-issues', icon: Scale, permission: Permission.VIEW_RISK_DASHBOARD },
        { name: 'Users / Wallet Controls', href: '/risk-compliance/user-wallet-controls', icon: UserCog, permission: Permission.VIEW_USERS },
      ],
    },

    // ── System ──
    {
      name: 'System',
      href: '#',
      icon: Settings,
      permission: null,
      children: [
        { name: 'Audit Logs', href: '/system/audit-logs', icon: FileSearch, permission: Permission.VIEW_AUDIT_LOGS },
        { name: 'Risk Alerts', href: '/system/risk-alerts', icon: AlertTriangle, permission: Permission.VIEW_RISK_DASHBOARD },
        { name: 'Feature Flags', href: '/system/feature-flags', icon: Flag, permission: Permission.VIEW_CONFIG },
      ],
    },
  ]

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName)
    } else {
      newExpanded.add(sectionName)
    }
    setExpandedSections(newExpanded)
  }

  const isSectionExpanded = (sectionName: string) => expandedSections.has(sectionName)

  const isActive = (href: string) => {
    if (href === '#') return false
    if (href === '/') return location.pathname === '/'
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const isParentActive = (children?: NavItem[]) => {
    if (!children) return false
    return children.some(child => isActive(child.href))
  }

  const productColor = (name: string) => {
    switch (name) {
      case 'Identity & Compliance': return { active: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300', child: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300' }
      case 'Nexa Pay': return { active: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300', child: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300' }
      case 'Nexa Go': return { active: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', child: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' }
      case 'Nexa Stay': return { active: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', child: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' }
      default: return { active: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300', child: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Nexa Admin</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unified Dashboard</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const colors = productColor(item.name)

            if (item.children) {
              const sectionKey = item.name.toLowerCase().replace(/\s+/g, '')
              const expanded = isSectionExpanded(sectionKey)
              const parentActive = isParentActive(item.children)

              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      parentActive
                        ? colors.active
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </div>
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {expanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => {
                        if (child.permission) {
                          return (
                            <PermissionGuard
                              key={child.name}
                              permission={child.permission}
                              fallback={null}
                            >
                              <NavLink item={child} isActive={isActive(child.href)} colors={colors} />
                            </PermissionGuard>
                          )
                        }
                        return <NavLink key={child.name} item={child} isActive={isActive(child.href)} colors={colors} />
                      })}
                    </div>
                  )}
                </div>
              )
            }

            if (item.permission) {
              return (
                <PermissionGuard key={item.name} permission={item.permission} fallback={null}>
                  <NavLink item={item} isActive={isActive(item.href)} colors={colors} />
                </PermissionGuard>
              )
            }
            return <NavLink key={item.name} item={item} isActive={isActive(item.href)} colors={colors} />
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {adminUser && (
            <div className="mb-3 text-sm">
              <div className="font-medium text-gray-900 dark:text-gray-100">{adminUser.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{adminUser.role.replace('_', ' ')}</div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NavLink({ item, isActive, colors }: { item: NavItem; isActive: boolean; colors: { active: string; child: string } }) {
  const Icon = item.icon

  return (
    <Link
      to={item.href}
      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
        isActive
          ? `${colors.child} font-medium`
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="mr-3 h-4 w-4" />
      {item.name}
    </Link>
  )
}
