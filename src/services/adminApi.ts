import { api } from './api';
import { endpoints } from './endpoints';
import { adminClient } from './adminClient';
import type {
  AdminActionResponse,
  FraudEvent,
  PaginatedResponse,
  QueryParams,
  ReconciliationIssue,
  RiskSummary,
  SarReport,
} from '../types/riskCompliance';

/**
 * Unified admin API client — Pay + Go + Stay.
 */
export const adminApi = {
  // ── Dashboard ──
  getDashboardStats: () => api.get(endpoints.admin.stats),

  // ── Users ──
  getUsers: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.users, { params }),
  getUsersCheckDriverCourierConsumer: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.usersCheckDriverCourierConsumer, { params }),
  getUser: (id: string) => api.get(endpoints.admin.user(id)),
  getUserWallet: (id: string) => api.get(endpoints.admin.userWallet(id)),
  getUserKyc: (id: string) => api.get(endpoints.admin.userKyc(id)),
  updateUserStatus: (id: string, status: string) =>
    api.patch(endpoints.admin.userStatus(id), { status }),
  freezeUser: (userId: string) => api.post(endpoints.admin.userFreeze(userId)),
  unfreezeUser: (userId: string) =>
    api.post(endpoints.admin.userUnfreeze(userId)),
  forceLogoutUser: (userId: string) =>
    adminClient.post<AdminActionResponse>(endpoints.admin.userForceLogout(userId)),
  untrustDevice: (userId: string, deviceId: string) =>
    adminClient.post<AdminActionResponse>(
      endpoints.admin.userUntrustDevice(userId, deviceId),
    ),
  triggerStepUp: (userId: string, reason: string) =>
    adminClient.post<AdminActionResponse>(
      endpoints.admin.userTriggerStepUp(userId),
      { reason },
    ),
  addComplianceTag: (userId: string, tag: string) =>
    adminClient.post<AdminActionResponse>(endpoints.admin.userComplianceTags(userId), {
      tag,
    }),

  // ── Wallets ──
  getWallets: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.wallets, { params }),
  getWallet: (id: string) => api.get(endpoints.admin.wallet(id)),
  getWalletLedger: (id: string) => api.get(endpoints.admin.walletLedger(id)),

  // ── Transactions ──
  getTransactions: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.transactions, { params }),
  getTransaction: (id: string) => api.get(endpoints.admin.transaction(id)),
  exportTransactions: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.transactionsExport, { params }),
  reverseTransaction: (id: string, reason: string) =>
    api.post(endpoints.admin.transactionReverse(id), { reason }),

  // ── KYC (product-aware) ──
  getKycQueue: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.kycApplications, { params }),
  getKycCase: (id: string) => api.get(endpoints.admin.kyc(id)),
  getKycFile: (userId: string, filename: string) =>
    api.get(endpoints.kycFile(userId, filename), { responseType: 'blob' }),
  approveKyc: (userId: string, product: 'PAY' | 'GO' | 'STAYS' = 'PAY') =>
    api.post(endpoints.admin.kycApprove(userId), undefined, {
      headers: { 'X-Nexa-Product': product },
    }),
  rejectKyc: (userId: string, reason: string, product: 'PAY' | 'GO' | 'STAYS' = 'PAY') =>
    api.post(endpoints.admin.kycReject(userId), { reason }, {
      headers: { 'X-Nexa-Product': product },
    }),

  // ── Risk & Compliance ──
  getRiskAlerts: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.riskAlerts, { params }),
  getRiskStats: () => api.get(endpoints.admin.riskStats),
  getRiskSummary: (params?: QueryParams) =>
    adminClient.get<RiskSummary>(endpoints.admin.riskSummary, params),
  getFraudEvents: (params?: QueryParams) =>
    adminClient.get<PaginatedResponse<FraudEvent>>(
      endpoints.admin.fraudEvents,
      params,
    ),
  updateFraudEventStatus: (
    id: string,
    payload: {
      status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'FALSE_POSITIVE';
      assigned_owner?: string;
      internal_note?: string;
    },
  ) =>
    adminClient.patch<AdminActionResponse>(
      endpoints.admin.fraudEventStatus(id),
      payload,
    ),
  getSarReports: (params?: QueryParams) =>
    adminClient.get<PaginatedResponse<SarReport>>(endpoints.admin.sar, params),
  updateSarStatus: (id: string, status: string) =>
    adminClient.patch<AdminActionResponse>(endpoints.admin.sarStatus(id), {
      status,
    }),
  updateComplianceSarStatus: (id: string, status: string) =>
    adminClient.patch<AdminActionResponse>(
      endpoints.admin.complianceSarStatus(id),
      { status },
    ),
  exportSarReports: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.sar, { params: { ...params, format: 'csv' } }),
  getReconciliationIssues: (params?: QueryParams) =>
    adminClient.get<PaginatedResponse<ReconciliationIssue>>(
      endpoints.admin.reconciliationIssues,
      params,
    ),
  getSecurityEvents: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.securityEvents, { params }),
  updateReconciliationIssueStatus: (id: string, status: string) =>
    adminClient.patch<AdminActionResponse>(
      endpoints.admin.reconciliationIssueStatus(id),
      { status },
    ),
  exportReconciliationReport: (params?: Record<string, unknown>) =>
    api.get('/reconciliation/report', { params: { ...params, format: 'csv' } }),
  escalateCase: (alertId: string) =>
    api.post(endpoints.admin.riskEscalate(alertId)),
  flagTransaction: (transactionId: string, reason: string) =>
    api.post(endpoints.admin.riskFlagTransaction(transactionId), { reason }),

  // ── Audit ──
  getAuditLogs: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.auditLogs, { params }),
  exportAuditLogs: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.auditLogsExport, { params }),

  // ── Support ──
  getTickets: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.support.tickets, { params }),
  getTicket: (id: string) => api.get(endpoints.admin.support.ticket(id)),
  getRefunds: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.support.refunds, { params }),
  getRefund: (id: string) => api.get(endpoints.admin.support.refund(id)),

  // ── Waitlist ──
  getWaitlist: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.waitlist, { params }),

  // ── System ──
  getSystemAccounts: () => api.get(endpoints.admin.system.accounts),
  getFeatureFlags: () => api.get(endpoints.admin.system.featureFlags),
  updateFeatureFlag: (flag: string, enabled: boolean) =>
    api.patch(endpoints.admin.system.featureFlag(flag), { enabled }),

  // ── Finance ──
  getRevenue: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.finance.revenue, { params }),
  getCommissions: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.finance.commissions, { params }),
  getDriverPayouts: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.finance.driverPayouts, { params }),
  getMerchantSettlements: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.finance.merchantSettlements, { params }),

  // ── Nexa Go ──
  getRides: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.go.rides, { params }),
  getRide: (id: string) => api.get(endpoints.admin.go.ride(id)),
  getDrivers: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.go.drivers, { params }),
  getDriver: (id: string) => api.get(endpoints.admin.go.driver(id)),
  getDeliveryOrders: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.go.deliveryOrders, { params }),
  getDeliveryOrder: (id: string) => api.get(endpoints.admin.go.deliveryOrder(id)),
  getCouriers: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.go.couriers, { params }),
  getCourier: (id: string) => api.get(endpoints.admin.go.courier(id)),
  getMerchants: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.go.merchants, { params }),
  getMerchant: (id: string) => api.get(endpoints.admin.go.merchant(id)),
  getRegistrationApplications: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.go.registrationApplications, { params }),
  getRegistrationApplication: (id: string) =>
    api.get(endpoints.admin.go.registrationApplication(id)),
  getRegistrationApplicationFile: (id: string, filename: string) =>
    api.get(endpoints.admin.go.registrationApplicationFile(id, filename), {
      responseType: 'blob',
    }),
  approveRegistrationApplication: (id: string) =>
    api.post(endpoints.admin.go.registrationApplicationApprove(id)),
  rejectRegistrationApplication: (id: string, reason: string) =>
    api.post(endpoints.admin.go.registrationApplicationReject(id), { reason }),

  // ── Nexa Stay ──
  getStaysStats: () => api.get(endpoints.admin.stays.stats),
  getStaysHealth: () => api.get(endpoints.admin.stays.health),
  getListings: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.stays.listings, { params }),
  getListing: (id: string) => api.get(endpoints.admin.stays.listing(id)),
  getListingMediaFile: (listingId: string, assetId: string) =>
    api.get(endpoints.admin.stays.listingMedia(listingId, assetId), {
      responseType: 'blob',
    }),
  approveListing: (id: string) =>
    api.post(endpoints.admin.stays.approveListing(id)),
  rejectListing: (id: string, reason: string) =>
    api.post(endpoints.admin.stays.rejectListing(id), { reason }),
  setListingLive: (id: string) =>
    api.post(endpoints.admin.stays.setListingLive(id)),
  getHosts: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.stays.hosts, { params }),
  approveHost: (id: string) =>
    api.post(endpoints.admin.stays.approveHost(id)),
  rejectHost: (id: string, reason: string) =>
    api.post(endpoints.admin.stays.rejectHost(id), { reason }),
  freezeHost: (id: string) =>
    api.post(endpoints.admin.stays.freezeHost(id)),
  unfreezeHost: (id: string) =>
    api.post(endpoints.admin.stays.unfreezeHost(id)),
  getBookings: (params?: Record<string, unknown>) =>
    api.get(endpoints.admin.stays.bookings, { params }),
  getBooking: (id: string) => api.get(endpoints.admin.stays.booking(id)),
};
