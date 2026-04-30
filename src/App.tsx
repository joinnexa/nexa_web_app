import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedLayout } from './components/ProtectedLayout'
import { LoginPage } from './pages/LoginPage'
import { Overview } from './pages/Overview'
import { LiveActivity } from './pages/LiveActivity'
import { AllUsers } from './pages/AllUsers'
import { PayDashboard } from './pages/PayDashboard'
import { KycReview } from './pages/KycReview'
import { Transactions } from './pages/Transactions'
import { Wallets } from './pages/Wallets'
import { FraudRisk } from './pages/FraudRisk'
import { Settlements } from './pages/Settlements'
import { GoDashboard } from './pages/GoDashboard'
import { Rides } from './pages/Rides'
import { Drivers } from './pages/Drivers'
import { Delivery } from './pages/Delivery'
import { Merchants } from './pages/Merchants'
import { PricingRules } from './pages/PricingRules'
import { StaysDashboard } from './pages/StaysDashboard'
import { Listings } from './pages/Listings'
import { Bookings } from './pages/Bookings'
import { Hosts } from './pages/Hosts'
import { AdminUsers } from './pages/AdminUsers'
import { Config } from './pages/Config'
import { AuditLogs } from './pages/AuditLogs'
import { WaitlistLeads } from './pages/WaitlistLeads'
import { Operations } from './pages/Operations'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/activity" element={<LiveActivity />} />
          <Route path="/users" element={<AllUsers />} />
          <Route path="/pay" element={<PayDashboard />} />
          <Route path="/kyc" element={<KycReview />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/fraud" element={<FraudRisk />} />
          <Route path="/settlements" element={<Settlements />} />
          <Route path="/waitlist" element={<WaitlistLeads />} />
          <Route path="/go" element={<GoDashboard />} />
          <Route path="/rides" element={<Rides />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/merchants" element={<Merchants />} />
          <Route path="/pricing" element={<PricingRules />} />
          <Route path="/stays" element={<StaysDashboard />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/hosts" element={<Hosts />} />
          <Route path="/admins" element={<AdminUsers />} />
          <Route path="/config" element={<Config />} />
          <Route path="/logs" element={<AuditLogs />} />
          <Route path="/operations" element={<Operations />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
