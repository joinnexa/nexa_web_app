import RegistrationApplications from '../nexago/RegistrationApplications'

/**
 * Courier Applications — dedicated section for courier onboarding.
 * Identity KYC is handled in Unified KYC; this focuses on courier
 * operational approval.
 */
export default function CourierApplications() {
  return (
    <RegistrationApplications
      roleFilter="courier"
      title="Courier Applications"
      subtitle="Operational approval for courier accounts. Identity verification is handled in Unified KYC."
    />
  )
}
