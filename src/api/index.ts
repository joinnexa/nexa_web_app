import { apiClient, setAuthToken, clearAuth } from './client'
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
  approve: (userId: string, source?: string) =>
    apiClient.post(`/admin/kyc/${userId}/approve`, {}, { params: source ? { source } : {} }),
  reject: (userId: string, reason: string, source?: string) =>
    apiClient.post(`/admin/kyc/${userId}/reject`, { reason }, { params: source ? { source } : {} }),
}

const TRANSACTIONS = {
  getList: (params?: { page?: number; limit?: number; status?: string; type?: string; userId?: string; search?: string }) =>
    apiClient.get<AdminTransaction[] | { data: AdminTransaction[]; total?: number }>('/admin/transactions', { params }).then((r) => r.data),
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
}

const USERS = {
  getList: (params?: { page?: number; limit?: number; status?: string; kyc?: string; account_type?: string; search?: string }) =>
    apiClient.get<AdminUser[] | { data: AdminUser[] }>('/admin/users', { params }).then((r) => r.data),
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
  getDriverPayouts: () => apiClient.get('/admin/finance/driver-payouts').then((r) => r.data),
  getMerchantSettlements: () => apiClient.get('/admin/finance/merchant-settlements').then((r) => r.data),
  getSettlementsSummary: () =>
    apiClient.get<{ pendingPayoutsAmount?: number; settledThisWeekAmount?: number; recipientsCount?: number; nextBatchDate?: string }>('/admin/finance/settlements-summary').then((r) => r.data),
}

const SYSTEM = {
  getFeatureFlags: () => apiClient.get<FeatureFlag[] | Record<string, boolean>>('/admin/system/feature-flags').then((r) => r.data),
  updateFeatureFlag: (key: string, enabled: boolean) =>
    apiClient.patch(`/admin/system/feature-flags/${key}`, { enabled }),
  getPayConfig: () =>
    apiClient.get<{ dailyLimitUnverified?: number; dailyLimitKyc?: number; qrExpirySeconds?: number }>('/admin/system/pay-config').then((r) => r.data),
  updatePayConfig: (body: { dailyLimitUnverified?: number; dailyLimitKyc?: number; qrExpirySeconds?: number }) =>
    apiClient.patch('/admin/system/pay-config', body),
}

const STAYS = {
  getStats: () => apiClient.get<StaysStats>('/admin/stays/stats').then((r) => r.data),
  getListings: (params?: { status?: string; limit?: number; offset?: number }) =>
    apiClient.get('/admin/stays/listings', { params }).then((r) => r.data),
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
}

export type { DashboardStats, KycApplication, AdminTransaction, RiskAlert, AuditLogEntry, FeatureFlag, StaysStats, AdminUser, AdminWallet }
