/**
 * Identity Layer — AION + DNA + Orb (visual renderer)
 *
 * Architecture:
 *   DNA (base seed)  →  AION (identity + AI companion)  →  Orb (visual renderer)
 *
 * The Orb system in src/components/orb/ is the RENDERING ENGINE.
 * This identity layer is the CONCEPTUAL IDENTITY above it.
 */

export type { AIONIdentity, DNAProfile } from './types';
export { DEFAULT_AION_IDENTITY, DEFAULT_DNA_PROFILE } from './types';
export { useAION } from './useAION';
