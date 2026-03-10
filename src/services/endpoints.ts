/**
 * Unified admin API endpoint paths.
 * Merges Pay, Go, and Stay endpoints into a single map.
 */

const P = {
  admin: {
    stats: '/admin/dashboard/stats',
    users: '/admin/users',
    usersCheckDriverCourierConsumer: '/admin/users/check-driver-courier-consumer',
    user: (id: string) => `/admin/users/${id}`,
    userWallet: (id: string) => `/admin/users/${id}/wallet`,
    userKyc: (id: string) => `/admin/users/${id}/kyc`,
    userStatus: (id: string) => `/admin/users/${id}/status`,
    userFreeze: (id: string) => `/admin/users/${id}/freeze`,
    userUnfreeze: (id: string) => `/admin/users/${id}/unfreeze`,
    userForceLogout: (id: string) => `/admin/users/${id}/force-logout`,
    userUntrustDevice: (id: string, deviceId: string) =>
      `/admin/users/${id}/devices/${deviceId}/untrust`,
    userTriggerStepUp: (id: string) => `/admin/users/${id}/step-up`,
    userComplianceTags: (id: string) => `/admin/users/${id}/compliance-tags`,
    wallets: '/admin/wallets',
    wallet: (id: string) => `/admin/wallets/${id}`,
    walletLedger: (id: string) => `/admin/wallets/${id}/ledger`,
    transactions: '/admin/transactions',
    transaction: (id: string) => `/admin/transactions/${id}`,
    transactionsExport: '/admin/transactions/export',
    transactionReverse: (id: string) => `/admin/transactions/${id}/reverse`,
    kycApplications: '/admin/kyc/applications',
    kyc: (id: string) => `/admin/kyc/${id}`,
    kycApprove: (userId: string) => `/admin/kyc/${userId}/approve`,
    kycReject: (userId: string) => `/admin/kyc/${userId}/reject`,
    riskAlerts: '/admin/risk/alerts',
    riskStats: '/admin/risk/stats',
    riskSummary: '/admin/risk/summary',
    riskEscalate: (alertId: string) => `/admin/risk/alerts/${alertId}/escalate`,
    riskFlagTransaction: (transactionId: string) =>
      `/admin/risk/transactions/${transactionId}/flag`,
    fraudEvents: '/admin/fraud/events',
    fraudEventStatus: (id: string) => `/admin/fraud/events/${id}/status`,
    sar: '/admin/sar',
    sarStatus: (id: string) => `/admin/sar/${id}/status`,
    complianceSarStatus: (id: string) => `/compliance/sar/${id}/status`,
    reconciliationIssues: '/admin/reconciliation/issues',
    reconciliationIssueStatus: (id: string) =>
      `/admin/reconciliation/issues/${id}/status`,
    securityEvents: '/admin/security-events',
    auditLogs: '/admin/audit/logs',
    auditLogsExport: '/admin/audit/logs/export',
    support: {
      tickets: '/admin/support/tickets',
      ticket: (id: string) => `/admin/support/tickets/${id}`,
      refunds: '/admin/support/refunds',
      refund: (id: string) => `/admin/support/refunds/${id}`,
    },
    waitlist: '/admin/waitlist',
    system: {
      accounts: '/admin/system/accounts',
      featureFlags: '/admin/system/feature-flags',
      featureFlag: (key: string) => `/admin/system/feature-flags/${key}`,
    },
    finance: {
      revenue: '/admin/finance/revenue',
      commissions: '/admin/finance/commissions',
      driverPayouts: '/admin/finance/driver-payouts',
      merchantSettlements: '/admin/finance/merchant-settlements',
    },

    // Nexa Go
    go: {
      rides: '/go/rides',
      ride: (id: string) => `/go/rides/${id}`,
      drivers: '/go/drivers',
      driver: (id: string) => `/go/drivers/${id}`,
      registrationApplications: '/admin/go/registration-applications',
      registrationApplication: (id: string) => `/admin/go/registration-applications/${id}`,
      registrationApplicationFile: (id: string, filename: string) =>
        `/admin/go/registration-applications/${id}/file/${encodeURIComponent(filename)}`,
      registrationApplicationApprove: (id: string) =>
        `/admin/go/registration-applications/${id}/approve`,
      registrationApplicationReject: (id: string) =>
        `/admin/go/registration-applications/${id}/reject`,
      deliveryOrders: '/go/delivery/orders',
      deliveryOrder: (id: string) => `/go/delivery/orders/${id}`,
      couriers: '/go/delivery/couriers',
      courier: (id: string) => `/go/delivery/couriers/${id}`,
      merchants: '/go/delivery/merchants',
      merchant: (id: string) => `/go/delivery/merchants/${id}`,
    },

    // Nexa Stay
    stays: {
      stats: '/admin/stays/stats',
      health: '/admin/stays/health',
      listings: '/admin/stays/listings',
      listing: (id: string) => `/admin/stays/listings/${id}`,
      listingMedia: (id: string, assetId: string) =>
        `/admin/stays/listings/${id}/media/${encodeURIComponent(assetId)}`,
      approveListing: (id: string) => `/admin/stays/listings/${id}/approve`,
      rejectListing: (id: string) => `/admin/stays/listings/${id}/reject`,
      setListingLive: (id: string) => `/admin/stays/listings/${id}/set-live`,
      hosts: '/admin/stays/hosts',
      approveHost: (id: string) => `/admin/stays/hosts/${id}/approve`,
      rejectHost: (id: string) => `/admin/stays/hosts/${id}/reject`,
      freezeHost: (id: string) => `/admin/stays/hosts/${id}/freeze`,
      unfreezeHost: (id: string) => `/admin/stays/hosts/${id}/unfreeze`,
      bookings: '/admin/stays/bookings',
      booking: (id: string) => `/admin/stays/bookings/${id}`,
    },
  },
  auth: {
    adminLogin: '/auth/admin/login',
  },
  kycFile: (userId: string, filename: string) =>
    `/kyc/files/${userId}/${encodeURIComponent(filename)}`,
} as const;

export const endpoints = P;
