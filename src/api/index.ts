import { apiClient, setAuthToken, clearAuth, downloadBlob } from './client'
import type {
  DashboardStats,
  KycApplication,
  AdminTransaction,
  RiskAlert,
  AuditLogEntry,
  FeatureFlag,
  StaysStats,
  AdminUser,
  AdminWallet,
  WaitlistEntry,
  GoMerchant,
} from './types'

const AUTH = {
  login: (email: string, password: string) =>
    apiClient.post<{
      access_token: string
      user: { id: string; email: string; role?: string; roles?: string[] }
    }>('/auth/admin/login', { email, password }),
  logout: () => { clearAuth() },
  setToken: (token: string) => { setAuthToken(token) },
}

const DASHBOARD = {
  getStats: () => apiClient.get<DashboardStats>('/admin/dashboard/stats').then((r) => r.data),
}

const ECOSYSTEM = {
  getStats: () =>
    apiClient.get<{
      pay: DashboardStats
      go: { ridesToday?: number; deliveriesToday?: number; goRevenueMtd?: number; [key: string]: unknown }
      stays: { activeListings?: number; bookingsMtd?: number; hostsPending?: number; revenueMtd?: number }
      systemStatus?: { api: string; database: string }
    }>('/admin/ecosystem/stats').then((r) => r.data),
}

const GO = {
  getStats: () =>
    apiClient.get<{
      ridesToday?: number
      deliveriesToday?: number
      driversOnline?: number
      couriersOnline?: number
      cancellationRate?: number
      goRevenueMtd?: number
    }>('/admin/go/stats').then((r) => r.data),
  getRides: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<{ data: unknown[]; total: number; page: number; limit: number }>('/admin/go/rides', { params }).then((r) => r.data),
  getDeliveryOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<{ data: unknown[]; total: number; page: number; limit: number }>('/admin/go/delivery/orders', { params }).then((r) => r.data),
  getMerchants: (params?: { page?: number; limit?: number }) =>
    apiClient.get<{ data: GoMerchant[]; total: number; page: number; limit: number }>('/admin/go/merchants', { params }).then((r) => r.data),
  getPricing: () =>
    apiClient.get<GoPricingConfig[]>('/admin/go/pricing').then((r) => r.data),
  getPricingHistory: () =>
    apiClient.get<GoPricingAuditEntry[]>('/admin/go/pricing/history').then((r) => r.data),
  updatePricing: (vehicleType: string, body: Record<string, unknown>) =>
    apiClient.patch(`/admin/go/pricing/${encodeURIComponent(vehicleType)}`, body),
  setSurge: (vehicleType: string, surgeActive: boolean, surgeMultiplier?: number) =>
    apiClient.post('/admin/go/pricing/surge', { vehicleType, surgeActive, surgeMultiplier }),
}

export interface GoPricingConfig {
  id: string
  vehicle_type: string
  base_fare: number
  per_km_rate: number
  per_min_rate: number
  min_fare: number
  booking_fee: number
  commission_type: string
  commission_rate: number | null
  commission_min: number
  cancellation_window_secs: number
  cancellation_fee: number
  surge_multiplier: number
  surge_active: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GoPricingAuditEntry {
  id: string
  vehicle_type: string
  changed_by: string
  changed_at: string
  field_name: string
  old_value: string | null
  new_value: string | null
}

const ACTIVITY = {
  getRecent: (params?: { limit?: number; since?: string }) =>
    apiClient.get<{ events: Array<{ id: string; type: string; product: string; payload: Record<string, unknown>; created_at: string }> }>('/admin/activity', { params }).then((r) => r.data),
}

const DRIVERS = {
  getList: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<{ data: unknown[]; total: number; page: number; limit: number }>('/go/drivers', { params }).then((r) => r.data),
}

const KYC = {
  getApplications: (params?: {
    source?: string
    status?: string
    page?: number
    limit?: number
    search?: string
    document_category?: string
  }) =>
    apiClient.get<{ items: KycApplication[]; total?: number } | KycApplication[]>('/admin/kyc/applications', { params }).then((r) => r.data),
  getCase: (id: string) => apiClient.get<KycApplication>(`/admin/kyc/${id}`).then((r) => r.data),
}

const TRANSACTIONS = {
  getList: (params?: { page?: number; limit?: number; status?: string; type?: string; userId?: string; search?: string }) =>
    apiClient.get<AdminTransaction[] | { data: AdminTransaction[]; total?: number }>('/admin/transactions', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<AdminTransaction>(`/admin/transactions/${id}`).then((r) => r.data),
  exportCsv: (params?: { page?: number; limit?: number; status?: string; type?: string; userId?: string; search?: string }) =>
    apiClient.get('/admin/transactions/export', { params, responseType: 'blob' }).then((r) => r.data),
  reverse: (id: string, reason: string) => apiClient.post(`/admin/transactions/${id}/reverse`, { reason }).then((r) => r.data),
}

const RISK = {
  getAlerts: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get<RiskAlert[] | { items: RiskAlert[] }>('/admin/risk/alerts', { params }).then((r) => r.data),
  getStats: () => apiClient.get<{ critical?: number; medium?: number; resolved?: number; [key: string]: unknown }>('/admin/risk/stats').then((r) => r.data),
  escalate: (alertId: string) => apiClient.post(`/admin/risk/alerts/${alertId}/escalate`),
  flagTransaction: (transactionId: string, reason: string) =>
    apiClient.post(`/admin/risk/transactions/${transactionId}/flag`, { reason }),
}

const AUDIT = {
  getLogs: (params?: { page?: number; limit?: number }) =>
    apiClient.get<AuditLogEntry[] | { items: AuditLogEntry[]; total?: number }>('/admin/audit/logs', { params }).then((r) => r.data),
  exportLogsCsv: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/admin/audit/logs/export', { params, responseType: 'blob' }).then((r) => r.data),
}

const USERS = {
  getList: (params?: { page?: number; limit?: number; status?: string; kyc?: string; account_type?: string; search?: string }) =>
    apiClient
      .get<
        AdminUser[] | {
          data: AdminUser[]
          total: number
          page: number
          limit: number
          total_pages: number
        }
      >('/admin/users', { params })
      .then((r) => r.data),
  getById: (id: string) => apiClient.get<AdminUser>(`/admin/users/${id}`).then((r) => r.data),
  freeze: (userId: string) => apiClient.post(`/admin/users/${userId}/freeze`),
  unfreeze: (userId: string) => apiClient.post(`/admin/users/${userId}/unfreeze`),
  inviteAdmin: (email: string, role?: string) =>
    apiClient.post<{ success: boolean; message?: string; email?: string; role?: string }>('/admin/users/invite', { email, role: role ?? 'ADMIN' }),
}

const WALLETS = {
  getList: (params?: { status?: string; search?: string }) =>
    apiClient.get<AdminWallet[] | { data: AdminWallet[] }>('/admin/wallets', { params }).then((r) => r.data),
}

const FINANCE = {
  getRevenue: () => apiClient.get('/admin/finance/revenue').then((r) => r.data),
  getCommissions: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<{
        commissions: unknown[]
        summary?: {
          total_commissions?: number
          nexapay_commissions?: number
          nexago_commissions?: number
          nexago_delivery_commissions?: number
        }
      }>('/admin/finance/commissions', { params })
      .then((r) => r.data),
  getDriverPayouts: () => apiClient.get('/admin/finance/driver-payouts').then((r) => r.data),
  getMerchantSettlements: () => apiClient.get('/admin/finance/merchant-settlements').then((r) => r.data),
  getSettlementsSummary: () =>
    apiClient.get<{ pendingPayoutsAmount?: number; settledThisWeekAmount?: number; recipientsCount?: number; nextBatchDate?: string }>('/admin/finance/settlements-summary').then((r) => r.data),
}

const SUPPORT = {
  getTickets: (params?: { page?: number; limit?: number }) =>
    apiClient.get<unknown[]>('/admin/support/tickets', { params }).then((r) => r.data),
  getTicket: (id: string) => apiClient.get(`/admin/support/tickets/${id}`).then((r) => r.data),
  getRefunds: (params?: { page?: number; limit?: number }) =>
    apiClient.get<unknown[]>('/admin/support/refunds', { params }).then((r) => r.data),
  getRefund: (id: string) => apiClient.get(`/admin/support/refunds/${id}`).then((r) => r.data),
}

type MonitoringPage<T> = { page?: number; limit?: number; total?: number; data?: T[] }

const SAR = {
  getReports: (params?: { page?: number; limit?: number; status?: string; severity?: string; search?: string }) =>
    apiClient.get<MonitoringPage<unknown>>('/admin/sar', { params }).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/admin/sar/${id}/status`, { status }).then((r) => r.data),
}

const RECONCILIATION = {
  getIssues: (params?: { page?: number; limit?: number; status?: string; severity?: string; search?: string }) =>
    apiClient.get<MonitoringPage<unknown>>('/admin/reconciliation/issues', { params }).then((r) => r.data),
  updateIssueStatus: (id: string, status: string) =>
    apiClient.patch(`/admin/reconciliation/issues/${id}/status`, { status }).then((r) => r.data),
}

const COMPLIANCE_FRAUD = {
  getEvents: (params?: { page?: number; limit?: number; status?: string; severity?: string; search?: string }) =>
    apiClient.get<MonitoringPage<unknown>>('/admin/fraud/events', { params }).then((r) => r.data),
  updateEventStatus: (
    id: string,
    body: {
      status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'FALSE_POSITIVE'
      assigned_owner?: string
      internal_note?: string
    },
  ) => apiClient.patch(`/admin/fraud/events/${id}/status`, body).then((r) => r.data),
}

const GO_REGISTRATION = {
  list: (params?: { status?: string; role?: string; limit?: number; offset?: number }) =>
    apiClient.get<{ items: Record<string, unknown>[]; total: number }>('/admin/go/registration-applications', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get(`/admin/go/registration-applications/${id}`).then((r) => r.data),
  approve: (id: string) => apiClient.post(`/admin/go/registration-applications/${id}/approve`).then((r) => r.data),
  reject: (id: string, reason?: string) =>
    apiClient.post(`/admin/go/registration-applications/${id}/reject`, { reason }).then((r) => r.data),
  fetchFile: (applicationId: string, filename: string) =>
    apiClient
      .get(`/admin/go/registration-applications/${applicationId}/file/${encodeURIComponent(filename)}`, { responseType: 'blob' })
      .then((r) => r.data as Blob),
}

const SYSTEM = {
  getFeatureFlags: () => apiClient.get<FeatureFlag[] | Record<string, boolean>>('/admin/system/feature-flags').then((r) => r.data),
  updateFeatureFlag: (key: string, enabled: boolean) =>
    apiClient.patch(`/admin/system/feature-flags/${key}`, { enabled }),
  getPayConfig: () =>
    apiClient.get<{ dailyLimitUnverified?: number; dailyLimitKyc?: number; qrExpirySeconds?: number }>('/admin/system/pay-config').then((r) => r.data),
  updatePayConfig: (body: { dailyLimitUnverified?: number; dailyLimitKyc?: number; qrExpirySeconds?: number }) =>
    apiClient.patch('/admin/system/pay-config', body),
  getSystemAccounts: () =>
    apiClient.get<Array<{ id: string; account_type: string; balance: number | null }>>('/admin/system/accounts').then((r) => r.data),
}

const STAYS = {
  getStats: () => apiClient.get<StaysStats>('/admin/stays/stats').then((r) => r.data),
  getListings: (params?: { status?: string; limit?: number; offset?: number }) =>
    apiClient.get('/admin/stays/listings', { params }).then((r) => r.data),
  getListing: (id: string) => apiClient.get(`/admin/stays/listings/${id}`).then((r) => r.data),
  approveListing: (id: string) => apiClient.post(`/admin/stays/listings/${id}/approve`),
  rejectListing: (id: string, reason: string) =>
    apiClient.post(`/admin/stays/listings/${id}/reject`, { reason }),
  setListingLive: (id: string) => apiClient.post(`/admin/stays/listings/${id}/set-live`),
  getBookings: (params?: { status?: string; limit?: number; offset?: number }) =>
    apiClient.get('/admin/stays/bookings', { params }).then((r) => r.data),
  getHosts: (params?: { status?: string; limit?: number; offset?: number }) =>
    apiClient.get('/admin/stays/hosts', { params }).then((r) => r.data),
  getHostApplications: (params?: { status?: string; limit?: number; offset?: number }) =>
    apiClient.get('/admin/stays/host-applications', { params }).then((r) => r.data),
  approveHost: (id: string) => apiClient.post(`/admin/stays/hosts/${id}/approve`),
  rejectHost: (id: string, reason: string) => apiClient.post(`/admin/stays/hosts/${id}/reject`, { reason }),
  approveHostApplication: (id: string) => apiClient.post(`/admin/stays/host-applications/${id}/approve`),
  rejectHostApplication: (id: string, reason: string) => apiClient.post(`/admin/stays/host-applications/${id}/reject`, { reason }),
}

const SEARCH = {
  search: (q: string, limit?: number) =>
    apiClient.get<{ users: unknown[]; transactions: unknown[]; rides: unknown[] }>('/admin/search', { params: { q, limit } }).then((r) => r.data),
}

const NOTIFICATIONS = {
  getSummary: () =>
    apiClient.get<{ pendingKyc?: number; openRiskAlerts?: number; pendingHostApplications?: number; total?: number }>(
      '/admin/notifications/summary',
    ).then((r) => r.data),
}

const WAITLIST = {
  getList: (params?: { page?: number; limit?: number; source?: string; user_type?: string }) =>
    apiClient
      .get<{ data: WaitlistEntry[]; total: number; page: number; limit: number; total_pages: number }>(
        '/admin/waitlist',
        { params },
      )
      .then((r) => r.data),
}

export const api = {
  AUTH,
  DASHBOARD,
  ECOSYSTEM,
  GO,
  ACTIVITY,
  DRIVERS,
  KYC,
  TRANSACTIONS,
  RISK,
  AUDIT,
  USERS,
  WALLETS,
  FINANCE,
  SYSTEM,
  STAYS,
  SEARCH,
  NOTIFICATIONS,
  WAITLIST,
  SUPPORT,
  SAR,
  RECONCILIATION,
  COMPLIANCE_FRAUD,
  GO_REGISTRATION,
}

export { downloadBlob }

export type {
  DashboardStats,
  KycApplication,
  AdminTransaction,
  RiskAlert,
  AuditLogEntry,
  FeatureFlag,
  StaysStats,
  AdminUser,
  AdminWallet,
}
