/**
 * @deprecated Superseded by `src/navigation/canonicalSurfaces.ts` (5 surfaces).
 * This file's 7-surface model is no longer authoritative. Scheduled for deletion
 * in Phase B of the System Consolidation Plan (`.lovable/plan.md`).
 */
import { CANONICAL_SURFACES } from "@/navigation/canonicalSurfaces";

export const SURFACES = CANONICAL_SURFACES.map((s) => ({
  id: s.id,
  path: s.path,
  label: s.labelEn,
})) as ReadonlyArray<{ id: string; path: string; label: string }>;

export type SurfaceId = (typeof SURFACES)[number]["id"];