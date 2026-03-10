import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Login from './pages/Login'
import Layout from './components/Layout'

import Overview from './pages/Overview'

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
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Overview />} />

        {/* ── Nexa Pay ── */}
        <Route path="pay/users" element={<NexaPayUsers />} />
        <Route path="pay/users/:id" element={<NexaPayUserDetail />} />
        <Route path="pay/wallets/:id" element={<NexaPayWalletDetail />} />
        <Route path="pay/wallets" element={<NexaPayWallets />} />
        <Route path="pay/transactions/:id" element={<NexaPayTransactionReceipt />} />
        <Route path="pay/transactions" element={<NexaPayTransactions />} />
        <Route path="pay/ledger" element={<NexaPayLedger />} />
        <Route path="pay/kyc-risk" element={<NexaPayKycRisk />} />

        {/* ── Nexa Go ── */}
        <Route path="go/rides" element={<NexaGoRides />} />
        <Route path="go/drivers" element={<NexaGoDrivers />} />
        <Route path="go/orders" element={<NexaGoOrders />} />
        <Route path="go/couriers" element={<NexaGoCouriers />} />
        <Route path="go/merchants" element={<NexaGoMerchants />} />
        <Route path="go/registration-applications" element={<NexaGoRegistrationApplications />} />
        <Route path="go/users/:id" element={<GoUserDetail />} />
        <Route path="go/kyc" element={<Navigate to="/admin/kyc" replace />} />

        {/* Identity & Compliance (unified) */}
        <Route path="admin/kyc" element={<UnifiedKyc />} />
        <Route path="admin/driver-applications" element={<DriverApplications />} />
        <Route path="admin/courier-applications" element={<CourierApplications />} />

        {/* ── Nexa Stay ── */}
        <Route path="stay/listings" element={<StayListings />} />
        <Route path="stay/hosts" element={<StayHosts />} />
        <Route path="stay/bookings" element={<StayBookings />} />
        <Route path="stay/kyc" element={<Navigate to="/admin/kyc" replace />} />
        <Route path="stay/revenue" element={<StayRevenue />} />

        {/* ── Finance (shared) ── */}
        <Route path="finance/revenue" element={<FinanceRevenue />} />
        <Route path="finance/commissions" element={<FinanceCommissions />} />
        <Route path="finance/driver-payouts" element={<FinanceDriverPayouts />} />
        <Route path="finance/merchant-settlements" element={<FinanceMerchantSettlements />} />

        {/* ── Support ── */}
        <Route path="support/tickets" element={<SupportTickets />} />
        <Route path="support/refunds" element={<SupportRefunds />} />

        {/* ── Waitlist ── */}
        <Route path="waitlist" element={<Waitlist />} />

        {/* ── System ── */}
        <Route path="system/audit-logs" element={<AuditLogs />} />
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
