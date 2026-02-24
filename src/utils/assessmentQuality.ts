/**
 * Client-side assessment quality validator.
 * Mirrors the backend DOMAIN_REQUIRED_METRICS contract from assessment-quality.ts
 * so that pillar cards show the correct "needs assessment" status.
 */

const DOMAIN_REQUIRED_METRICS: Record<string, string[]> = {
  consciousness: ['consciousness_metrics'],
  presence: ['presence_metrics'],
  power: ['power_metrics'],
  vitality: ['vitality_metrics'],
  focus: ['focus_metrics'],
  combat: ['combat_metrics'],
  expansion: ['expansion_metrics'],
  wealth: ['wealth_metrics'],
  influence: ['influence_metrics'],
  relationships: ['relationships_metrics'],
  business: ['business_metrics'],
  projects: ['projects_metrics'],
  play: ['play_metrics'],
  order: ['order_metrics'],
};

/**
 * Check if a domain's assessment meets the backend quality gate.
 * Returns true only if ALL required data is present.
 */
export function isAssessmentReady(
  domainId: string,
  domainConfig: Record<string, any> | null | undefined,
): boolean {
  if (!domainConfig) return false;

  const latest = domainConfig.latest_assessment;

  // No latest_assessment → not ready (even if `completed` is true)
  if (!latest) return false;

  // Global required: subscores, assessed_at, confidence
  if (!latest.subscores || Object.keys(latest.subscores).length < 3) return false;
  if (!latest.assessed_at) return false;
  if (!latest.confidence) return false;

  // Willingness check
  if (
    !latest.willingness ||
    (!latest.willingness.willing_to_do?.length && !latest.willingness.not_willing_to_do?.length)
  ) {
    return false;
  }

  // Domain-specific metrics
  const requiredFields = DOMAIN_REQUIRED_METRICS[domainId];
  if (requiredFields) {
    for (const field of requiredFields) {
      const metricsData = latest[field] || latest.metrics?.[field] || latest.domain_metrics;
      if (!metricsData || (typeof metricsData === 'object' && Object.keys(metricsData).length === 0)) {
        return false;
      }
    }
  }

  // Low confidence = soft fail
  if (latest.confidence === 'low') return false;

  return true;
}
