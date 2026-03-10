export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  FINANCE_TREASURY = 'FINANCE_TREASURY',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  RISK_ANALYST = 'RISK_ANALYST',
  AUDITOR = 'AUDITOR',
}

export enum Permission {
  VIEW_USERS = 'VIEW_USERS',
  FREEZE_WALLET = 'FREEZE_WALLET',
  UNFREEZE_WALLET = 'UNFREEZE_WALLET',
  SET_LIMITS = 'SET_LIMITS',
  RESET_PIN = 'RESET_PIN',
  VIEW_USER_TIMELINE = 'VIEW_USER_TIMELINE',

  VIEW_KYC = 'VIEW_KYC',
  APPROVE_KYC = 'APPROVE_KYC',
  REJECT_KYC = 'REJECT_KYC',
  FORCE_KYC_RESUBMISSION = 'FORCE_KYC_RESUBMISSION',

  VIEW_TRANSACTIONS = 'VIEW_TRANSACTIONS',
  VIEW_LEDGER = 'VIEW_LEDGER',
  REVERSE_TRANSACTION = 'REVERSE_TRANSACTION',

  VIEW_RISK_DASHBOARD = 'VIEW_RISK_DASHBOARD',
  FLAG_TRANSACTION = 'FLAG_TRANSACTION',
  ESCALATE_CASE = 'ESCALATE_CASE',

  VIEW_CONFIG = 'VIEW_CONFIG',
  EDIT_CONFIG = 'EDIT_CONFIG',
  EMERGENCY_SHUTDOWN = 'EMERGENCY_SHUTDOWN',

  VIEW_REPORTS = 'VIEW_REPORTS',
  EXPORT_DATA = 'EXPORT_DATA',

  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',

  VIEW_SYSTEM_HEALTH = 'VIEW_SYSTEM_HEALTH',
}

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(Permission),

  [AdminRole.COMPLIANCE_OFFICER]: [
    Permission.VIEW_USERS,
    Permission.VIEW_USER_TIMELINE,
    Permission.VIEW_KYC,
    Permission.APPROVE_KYC,
    Permission.REJECT_KYC,
    Permission.FORCE_KYC_RESUBMISSION,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_RISK_DASHBOARD,
    Permission.FLAG_TRANSACTION,
    Permission.ESCALATE_CASE,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_AUDIT_LOGS,
  ],

  [AdminRole.FINANCE_TREASURY]: [
    Permission.VIEW_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_LEDGER,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_SYSTEM_HEALTH,
  ],

  [AdminRole.SUPPORT_AGENT]: [
    Permission.VIEW_USERS,
    Permission.VIEW_USER_TIMELINE,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_KYC,
    Permission.RESET_PIN,
  ],

  [AdminRole.RISK_ANALYST]: [
    Permission.VIEW_USERS,
    Permission.VIEW_USER_TIMELINE,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_RISK_DASHBOARD,
    Permission.FLAG_TRANSACTION,
    Permission.ESCALATE_CASE,
    Permission.FREEZE_WALLET,
    Permission.VIEW_REPORTS,
  ],

  [AdminRole.AUDITOR]: [
    Permission.VIEW_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_LEDGER,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_SYSTEM_HEALTH,
  ],
}

export interface AdminUser {
  id: string
  email: string
  role: AdminRole
  name: string
  lastLoginAt?: string
  ipWhitelist?: string[]
  twoFactorEnabled: boolean
  permissions: Permission[]
}
