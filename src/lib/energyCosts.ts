/**
 * Energy Economy - Cost Configuration
 * All energy costs for premium features
 */

export const ENERGY_COSTS = {
  HYPNOSIS_STANDARD: 5,
  HYPNOSIS_PREMIUM: 10,
  ONBOARDING_RERUN: 15,
  AURORA_MESSAGE: 2,
  PDF_90DAY: 10,
} as const;

export type EnergyCostKey = keyof typeof ENERGY_COSTS;
