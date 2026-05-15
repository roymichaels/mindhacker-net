// Wave 1 fallback — minimal type stubs for orphan coach/results pages.
// Real implementation removed; these keep the build alive for surfaces
// that aren't on the active routing graph but still typecheck.
export type SubsystemId = string;
export interface CombatDomainConfig {
  id: string;
  label?: string;
  [k: string]: unknown;
}
export interface CombatAssessmentResult {
  id?: string;
  score?: number;
  subsystems?: Record<string, unknown>;
  [k: string]: unknown;
}