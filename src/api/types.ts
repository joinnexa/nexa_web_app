// Response shapes from nexa_backend (align with backend DTOs/entities)

export interface DashboardStats {
  totalUsers: number
  verifiedUsers: number
  pendingKyc: number
  totalWalletBalance: number
  dailyTransactions: number
  failedTransactions: number
  activeUsers: number
  totalWallets: number
  dailyVolume: number
  successRate: number
  flaggedTransactions: number
  systemStatus?: { api: string; database: string; queue?: string }
}

export interface KycApplication {
  id: string
  user_id: string
  user_phone?: string
  user_name?: string
  status: string
  level?: string
  provider?: string
  submitted_at: string
  reviewed_at?: string
  rejection_reason?: string
  document_type?: string
  document_country?: string
  national_id_number?: string
  national_id_number_extracted?: string
  full_name?: string
  kyc_full_name?: string
  user_full_name?: string
  email?: string
  kyc_email?: string
  user_email?: string
  city?: string
  date_of_birth?: string
  nationality?: string
  /** Absolute or same-origin paths under /api/v1/kyc/files/… */
  document_file_url_front?: string | null
  document_file_url_back?: string | null
  selfie_file_url?: string | null
  source?: string
  account_type?: string
  documents?: unknown
  kycProfile?: Record<string, unknown>
}

export interface AdminTransaction {
  id: string
  reference: string
  type: string
  amount: number
  fee?: number
  status: string
  created_at: string
  sender_user_id?: string
  receiver_user_id?: string
  sender_phone?: string
  receiver_phone?: string
}

export interface RiskAlert {
  id: string
  user_id?: string
  transaction_id?: string
  type?: string
  status: string
  risk_score?: number
  amount?: number
  description?: string
  created_at: string
  [key: string]: unknown
}

export interface AuditLogEntry {
  id: string
  action: string
  admin_id?: string
  admin_email?: string
  target_type?: string
  target_id?: string
  details?: string
  ip_address?: string
  created_at: string
  [key: string]: unknown
}

export interface FeatureFlag {
  key: string
  enabled: boolean
  description?: string
}

export interface StaysStats {
  activeListings?: number
  bookingsMtd?: number
  hostsPending?: number
  revenueMtd?: number
  totalListings?: number
  liveListings?: number
  totalHosts?: number
  pendingHostVerification?: number
  approvedHosts?: number
  totalBookings?: number
  todayBookings?: number
  confirmedBookings?: number
  totalRevenue?: number
  todayRevenue?: number
  [key: string]: unknown
}

export interface AdminUser {
  id: string
  phone_number?: string
  full_name?: string
  email?: string
  account_type?: string
  account_status?: string
  kyc_status?: string
  balance?: number
  created_at?: string
  last_login_at?: string
}

export interface AdminWallet {
  id: string
  user_id: string
  currency: string
  status: string
  balance: number
  created_at: string
  user?: { id: string; phone_number?: string; full_name?: string }
}
