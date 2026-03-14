import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AdminLayout } from './layouts/AdminLayout'
import { LoginPage } from './pages/admin/LoginPage'
import { SuperAdminOverview } from './pages/admin/SuperAdminOverview'
import { PayOverview } from './pages/admin/PayOverview'
import { GoOverview } from './pages/admin/GoOverview'
import { StaysOverview } from './pages/admin/StaysOverview'
// ── Nexa Pay ──
import NexaPayUsers from './pages/nexapay/Users'
import NexaPayUserDetail from './pages/nexapay/UserDetail'
import NexaPayWallets from './pages/nexapay/Wallets'
import NexaPayWalletDetail from './pages/nexapay/WalletDetail'
import NexaPayTransactions from './pages/nexapay/Transactions'
import NexaPayTransactionReceipt from './pages/nexapay/TransactionReceipt'
import NexaPayLedger from './pages/nexapay/Ledger'
import NexaPayKycRisk from './pages/nexapay/KycRisk'

// ── Nexa Go ──
import NexaGoRides from './pages/nexago/Rides'
import NexaGoDrivers from './pages/nexago/Drivers'
import NexaGoOrders from './pages/nexago/Orders'
import NexaGoCouriers from './pages/nexago/Couriers'
import NexaGoMerchants from './pages/nexago/Merchants'
import NexaGoRegistrationApplications from './pages/nexago/RegistrationApplications'
import GoUserDetail from './pages/UserDetail'
import GoKycQueue from './pages/KycQueue'

// ── Admin Identity & Compliance (unified) ──
import UnifiedKyc from './pages/admin/UnifiedKyc'
import DriverApplications from './pages/admin/DriverApplications'
import CourierApplications from './pages/admin/CourierApplications'

// ── Nexa Stay ──
import StayListings from './pages/nexastays/Listings'
import StayHosts from './pages/nexastays/Hosts'
import StayBookings from './pages/nexastays/Bookings'
import StayKycQueue from './pages/nexastays/KycQueue'
import StayRevenue from './pages/nexastays/Revenue'

// ── Finance (shared) ──
import FinanceRevenue from './pages/finance/Revenue'
import FinanceCommissions from './pages/finance/Commissions'
import FinanceDriverPayouts from './pages/finance/DriverPayouts'
import FinanceMerchantSettlements from './pages/finance/MerchantSettlements'

// ── Support ──
import SupportTickets from './pages/support/Tickets'
import SupportRefunds from './pages/support/Refunds'

// ── Waitlist ──
import Waitlist from './pages/Waitlist'

// ── System ──
import AuditLogs from './pages/AuditLogs'
import SystemRiskAlerts from './pages/system/RiskAlerts'
import SystemFeatureFlags from './pages/system/FeatureFlags'

// ── Pay (new) ──
import PayMerchants from './pages/pay/Merchants'
import PayReports from './pages/pay/Reports'

// ── Go (new) ──
import GoVehicles from './pages/go/Vehicles'
import GoLiveMap from './pages/go/LiveMap'
import GoPromotions from './pages/go/Promotions'
import GoPricing from './pages/go/Pricing'

// ── Stays (new) ──
import StaysGuests from './pages/stays/Guests'
import StaysDisputes from './pages/stays/Disputes'
import StaysReviews from './pages/stays/Reviews'

// ── Super Admin (new) ──
import SuperAnalytics from './pages/super/Analytics'
import SuperAdmins from './pages/super/Admins'
import SuperRoles from './pages/super/Roles'
import SuperControls from './pages/super/Controls'
import SuperNotifications from './pages/super/Notifications'

// ── Shared (new) ──
import SearchPage from './pages/shared/SearchPage'

// ── Risk & Compliance ──
import RiskComplianceOverview from './pages/risk-compliance/Overview'
import FraudEventsPage from './pages/risk-compliance/FraudEvents'
import SarReportsPage from './pages/risk-compliance/SarReports'
import ReconciliationIssuesPage from './pages/risk-compliance/ReconciliationIssues'
import UserWalletControlsPage from './pages/risk-compliance/UserWalletControls'
import { AdminOnlyGuard } from './components/AdminOnlyGuard'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  let authContext
  try {
    authContext = useAuth()
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    )
  }
  const { isAuthenticated, isLoading } = authContext

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        {/* ── Super Admin & New Design ── */}
        <Route index element={<SuperAdminOverview />} />

        {/* ── Nexa Pay ── */}
        <Route path="pay/overview" element={<PayOverview />} />
        <Route path="pay/users" element={<NexaPayUsers />} />
        <Route path="pay/users/:id" element={<NexaPayUserDetail />} />
        <Route path="pay/wallets/:id" element={<NexaPayWalletDetail />} />
        <Route path="pay/wallets" element={<NexaPayWallets />} />
        <Route path="pay/transactions/:id" element={<NexaPayTransactionReceipt />} />
        <Route path="pay/transactions" element={<NexaPayTransactions />} />
        <Route path="pay/kyc-review" element={<UnifiedKyc />} />
        <Route path="pay/ledger" element={<NexaPayLedger />} />
        <Route path="pay/kyc-risk" element={<NexaPayKycRisk />} />
        <Route path="pay/merchants" element={<PayMerchants />} />
        <Route path="pay/refunds" element={<SupportRefunds />} />
        <Route path="pay/payouts" element={<FinanceMerchantSettlements />} />
        <Route path="pay/risk" element={<SystemRiskAlerts />} />
        <Route path="pay/reports" element={<PayReports />} />

        {/* ── Nexa Go ── */}
        <Route path="go/overview" element={<GoOverview />} />
        <Route path="go/rides" element={<NexaGoRides />} />
        <Route path="go/drivers" element={<NexaGoDrivers />} />
        <Route path="go/orders" element={<NexaGoOrders />} />
        <Route path="go/couriers" element={<NexaGoCouriers />} />
        <Route path="go/merchants" element={<NexaGoMerchants />} />
        <Route path="go/registration-applications" element={<NexaGoRegistrationApplications />} />
        <Route path="go/users/:id" element={<GoUserDetail />} />
        <Route path="go/kyc" element={<Navigate to="/admin/kyc" replace />} />
        <Route path="go/vehicles" element={<GoVehicles />} />
        <Route path="go/trips" element={<Navigate to="/go/rides" replace />} />
        <Route path="go/live-map" element={<GoLiveMap />} />
        <Route path="go/pricing" element={<GoPricing />} />
        <Route path="go/incidents" element={<SystemRiskAlerts />} />
        <Route path="go/payouts" element={<FinanceDriverPayouts />} />
        <Route path="go/promotions" element={<GoPromotions />} />

        {/* Identity & Compliance (unified) */}
        <Route path="admin/kyc" element={<UnifiedKyc />} />
        <Route path="admin/driver-applications" element={<DriverApplications />} />
        <Route path="admin/courier-applications" element={<CourierApplications />} />

        {/* ── Nexa Stays ── */}
        <Route path="stays/overview" element={<StaysOverview />} />
        <Route path="stays/host-approval" element={<StayHosts />} />
        <Route path="stays/guests" element={<StaysGuests />} />
        <Route path="stays/listings" element={<StayListings />} />
        <Route path="stays/bookings" element={<StayBookings />} />
        <Route path="stays/refunds" element={<SupportRefunds />} />
        <Route path="stays/disputes" element={<StaysDisputes />} />
        <Route path="stays/payouts" element={<FinanceMerchantSettlements />} />
        <Route path="stays/reviews" element={<StaysReviews />} />
        {/* Legacy stay routes */}
        <Route path="stay/listings" element={<Navigate to="/stays/listings" replace />} />
        <Route path="stay/hosts" element={<Navigate to="/stays/host-approval" replace />} />
        <Route path="stay/bookings" element={<Navigate to="/stays/bookings" replace />} />
        <Route path="stay/kyc" element={<Navigate to="/admin/kyc" replace />} />
        <Route path="stay/revenue" element={<StayRevenue />} />

        {/* ── Shared ── */}
        <Route path="support-tickets" element={<SupportTickets />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="search" element={<SearchPage />} />

        {/* ── Finance (shared) ── */}
        <Route path="finance/revenue" element={<FinanceRevenue />} />
        <Route path="finance/commissions" element={<FinanceCommissions />} />
        <Route path="finance/driver-payouts" element={<FinanceDriverPayouts />} />
        <Route path="finance/merchant-settlements" element={<FinanceMerchantSettlements />} />

        {/* ── Support (legacy paths) ── */}
        <Route path="support/tickets" element={<Navigate to="/support-tickets" replace />} />
        <Route path="support/refunds" element={<SupportRefunds />} />

        {/* ── Waitlist ── */}
        <Route path="waitlist" element={<Waitlist />} />

        {/* ── Super Admin placeholder routes ── */}
        <Route path="super/overview" element={<Navigate to="/" replace />} />
        <Route path="super/analytics" element={<SuperAnalytics />} />
        <Route path="super/admins" element={<SuperAdmins />} />
        <Route path="super/roles" element={<SuperRoles />} />
        <Route path="super/risk" element={<Navigate to="/risk-compliance/overview" replace />} />
        <Route path="super/escalations" element={<SupportTickets />} />
        <Route path="super/controls" element={<SuperControls />} />
        <Route path="super/notifications" element={<SuperNotifications />} />
        <Route path="super/settings" element={<SystemFeatureFlags />} />

        {/* ── System ── */}
        <Route path="system/audit-logs" element={<Navigate to="/audit-logs" replace />} />
        <Route path="system/risk-alerts" element={<SystemRiskAlerts />} />
        <Route path="system/feature-flags" element={<SystemFeatureFlags />} />

        {/* ── Risk & Compliance (admin-only) ── */}
        <Route path="risk-compliance/overview" element={<AdminOnlyGuard><RiskComplianceOverview /></AdminOnlyGuard>} />
        <Route path="risk-compliance/fraud-events" element={<AdminOnlyGuard><FraudEventsPage /></AdminOnlyGuard>} />
        <Route path="risk-compliance/sar-reports" element={<AdminOnlyGuard><SarReportsPage /></AdminOnlyGuard>} />
        <Route path="risk-compliance/reconciliation-issues" element={<AdminOnlyGuard><ReconciliationIssuesPage /></AdminOnlyGuard>} />
        <Route path="risk-compliance/user-wallet-controls" element={<AdminOnlyGuard><UserWalletControlsPage /></AdminOnlyGuard>} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
