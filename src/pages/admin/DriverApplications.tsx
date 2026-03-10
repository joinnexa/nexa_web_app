import RegistrationApplications from '../nexago/RegistrationApplications'

/**
 * Driver Applications — dedicated section for driver onboarding.
 * Identity KYC is handled in Unified KYC; this focuses on driver-specific
 * approval (vehicle, license, insurance, etc.).
 */
export default function DriverApplications() {
  return (
    <RegistrationApplications roleFilter="driver" title="Driver Applications" subtitle="Operational approval for driver accounts. Identity verification is handled in Unified KYC." />
  )
}
