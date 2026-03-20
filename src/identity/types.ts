/**
 * AION Identity Layer — Type definitions
 *
 * AION is the user's evolving AI companion identity.
 * The Orb is the VISUAL RENDERER for AION — it renders the visual representation.
 * DNA is the BASE IDENTITY LAYER (future) — the seed from which AION grows.
 *
 * Hierarchy:
 *   DNA (base seed, future) → AION (identity + companion) → Orb (visual renderer)
 */

/** Future DNA base layer — the seed identity from which AION grows */
export interface DNAProfile {
  /** Unique seed derived from user's behavioral + assessment data */
  dnaSeed: string;
  /** Core trait weights derived from pillar assessments */
  dnaTraits: Record<string, number>;
  /** Dominant archetype (e.g. 'guardian', 'explorer', 'creator') */
  dominantArchetype: string;
  /** Secondary archetype blend */
  secondaryArchetype: string | null;
  /** Timestamp of last DNA recalculation */
  lastComputedAt: string | null;
}

/** AION — the evolving AI companion identity */
export interface AIONIdentity {
  /** User ID this AION belongs to */
  userId: string;
  /** Display name for the AION companion */
  name: string;
  /** Current evolution level */
  level: number;
  /** Current ego state / archetype */
  egoState: string;
  /** DNA base layer (future — nullable until implemented) */
  dna: DNAProfile | null;
  /** Visual profile key — links to the Orb rendering system */
  visualProfileId: string | null;
  /** Whether the AION has been minted as an NFT */
  isMinted: boolean;
  /** Wallet address if minted */
  walletAddress: string | null;
}

/** Default DNA profile placeholder */
export const DEFAULT_DNA_PROFILE: DNAProfile = {
  dnaSeed: '',
  dnaTraits: {},
  dominantArchetype: 'guardian',
  secondaryArchetype: null,
  lastComputedAt: null,
};

/** Default AION identity */
export const DEFAULT_AION_IDENTITY: AIONIdentity = {
  userId: '',
  name: 'AION',
  level: 1,
  egoState: 'guardian',
  dna: null,
  visualProfileId: null,
  isMinted: false,
  walletAddress: null,
};
