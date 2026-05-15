/**
 * Phase 5F.6 — Canonical Atmosphere Runtime Collapse.
 *
 * This module previously hosted a parallel cinematic atmosphere
 * implementation (presence-driven nebulae, vignette, particle haze).
 * It is now a thin shim around the canonical ShellV2 atmosphere
 * runtime so there is exactly one source of truth for AION's living
 * field. The canonical runtime self-deduplicates via a singleton
 * mount guard (only the first mounted instance renders DOM).
 *
 * Direct imports of this path remain valid; new code should import
 * directly from `@/shellv2/layers/AtmosphereLayer`.
 */
export { default } from '@/shellv2/layers/AtmosphereLayer';
