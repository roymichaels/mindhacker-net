/**
 * OnboardingGate — DISABLED.
 *
 * AION conversation is the new onboarding. The legacy gate used to redirect
 * uncompleted users to `/onboarding`; that auto-launch is removed. Onboarding
 * is now an optional artifact summoned by AION, never a hard redirect.
 *
 * Kept as a no-op passthrough so existing imports keep compiling.
 */
interface OnboardingGateProps {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  return <>{children}</>;
}
