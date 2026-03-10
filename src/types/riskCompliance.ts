export type Severity = 'LOW' | 'MEDIUM' | 'HIGH'

export interface PaginatedResponse<T> {
  page: number
  limit: number
  total: number
  data: T[]
}

export interface RiskSummary {
  window: {
    from_date: string | null
    to_date: string | null
    severity: string
  }
  totals: {
    risk_alerts: number
    fraud_events: number
    sar_reports: number
    reconciliation_issues: number
  }
  open: {
    risk_alerts: number
    sar_reports: number
    reconciliation_issues: number
  }
}

export interface FraudEvent {
  id: string
  user_id: string
  transaction_type: string
  amount: number
  risk_score: number
  reason_code: string
  severity: Severity
  action: string
  status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'FALSE_POSITIVE'
  assigned_owner?: string | null
  internal_note?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
  updated_at?: string
}

export interface SarReport {
  id: string
  user_id: string
  transaction_id: string | null
  risk_reason: string
  risk_score: number
  severity: Severity
  status: 'OPEN' | 'UNDER_REVIEW' | 'REPORTED' | 'DISMISSED'
  device_context?: Record<string, unknown> | null
  created_at: string
}

export interface ReconciliationIssue {
  id: string
  report_date: string
  issue_type: string
  severity: Severity
  description: string
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'IGNORED'
  metadata?: Record<string, unknown> | null
  created_at: string
}

export interface AdminActionResponse {
  success: boolean
}

export interface QueryParams {
  [key: string]: string | number | undefined
  page?: number
  limit?: number
  from_date?: string
  to_date?: string
  severity?: string
  status?: string
  user_id?: string
  transaction_id?: string
  search?: string
}
