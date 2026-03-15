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
    apiClient.post<{ access_token: string; user: { id: string; email: string; roles?: string[] } }>('/auth/admin/login', { email, password }),
  logout: () => { clearAuth() },
  setToken: (token: string) => { setAuthToken(token) },
}

const DASHBOARD = {
  getStats: () => apiClient.get<DashboardStats>('/admin/dashboard/stats').then((r) => r.data),
}

const KYC = {
  getApplications: (params?: { source?: string; status?: string; page?: number; limit?: number; search?: string }) =>
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
}

const WALLETS = {
  getList: (params?: { status?: string; search?: string }) =>
    apiClient.get<AdminWallet[] | { data: AdminWallet[] }>('/admin/wallets', { params }).then((r) => r.data),
}

const FINANCE = {
  getRevenue: () => apiClient.get('/admin/finance/revenue').then((r) => r.data),
  getDriverPayouts: () => apiClient.get('/admin/finance/driver-payouts').then((r) => r.data),
  getMerchantSettlements: () => apiClient.get('/admin/finance/merchant-settlements').then((r) => r.data),
}

const SYSTEM = {
  getFeatureFlags: () => apiClient.get<FeatureFlag[] | Record<string, boolean>>('/admin/system/feature-flags').then((r) => r.data),
  updateFeatureFlag: (key: string, enabled: boolean) =>
    apiClient.patch(`/admin/system/feature-flags/${key}`, { enabled }),
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

export const api = {
  AUTH,
  DASHBOARD,
  KYC,
  TRANSACTIONS,
  RISK,
  AUDIT,
  USERS,
  WALLETS,
  FINANCE,
  SYSTEM,
  STAYS,
}

export type { DashboardStats, KycApplication, AdminTransaction, RiskAlert, AuditLogEntry, FeatureFlag, StaysStats, AdminUser, AdminWallet }
