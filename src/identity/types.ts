/**
 * AION Identity Layer — Type definitions
 *
 * Architecture (bottom → top):
 *   DNA (base seed, future) → AION (identity + AI companion) → Orb (visual renderer) → Avatar (future game body)
 *
 * AION is the user's evolving AI companion identity.
 * The Orb is the VISUAL RENDERER for AION — it renders the visual representation.
 * DNA is the BASE IDENTITY LAYER (future) — the seed from which AION grows.
 * Avatar is the GAME BODY LAYER (future) — the player's in-world representation.
 */

/* ── DNA Base Layer (future) ── */

/** Sources that can feed into the DNA computation */
export type DNASignalSource =
  | 'pillar_assessment'    // Results from any of the 15 pillar assessments
  | 'habit_pattern'        // Recurring habit completion patterns
  | 'aurora_conversation'  // Insights from Aurora AI interactions
  | 'energy_pattern'       // Time-of-day energy/productivity patterns
  | 'ego_state'            // Current ego state from game engine
  | 'streak_consistency'   // Long-term streak maintenance
  | 'skill_distribution'   // Skill XP distribution across pillars
  | 'community_activity';  // Community engagement patterns

/** A single DNA signal contributing to the profile */
export interface DNASignal {
  source: DNASignalSource;
  pillar?: string;
  weight: number;
  value: number;
  lastUpdated: string;
}

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
  /** Raw signals that contributed to this DNA (future) */
  signals?: DNASignal[];
  /** Timestamp of last DNA recalculation */
  lastComputedAt: string | null;
}

/* ── AION Identity ── */

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

/* ── Orb Visual Layer (rendering responsibility) ── */

/**
 * The Orb is the visual rendering engine for AION.
 * It does NOT represent identity itself — it visualizes it.
 *
 * Orb rendering components live in src/components/orb/.
 * Orb profile data lives in the orb_profiles database table.
 *
 * Rendering pipeline:
 *   AIONIdentity → orbProfile → OrbRenderer (PersonalizedOrb/SharedOrbView)
 */

/* ── Avatar Game Layer (future) ── */

/**
 * The Avatar layer is a future game-body concept.
 * When implemented, it will provide an in-world visual representation
 * separate from the Orb. The Orb will remain as the identity/soul
 * visualization, while the Avatar will be the game character.
 *
 * Not implemented yet — placeholder for architecture clarity.
 */

/* ── Defaults ── */

/** Default DNA profile placeholder */
export const DEFAULT_DNA_PROFILE: DNAProfile = {
  dnaSeed: '',
  dnaTraits: {},
  dominantArchetype: 'guardian',
  secondaryArchetype: null,
  signals: [],
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

/**
 * Maps which existing user data signals will eventually feed DNA computation.
 * This is a readiness map — NOT an implementation.
 *
 * Signal → Where it lives today:
 *   pillar_assessment   → domain_assessments table / strategy assessment results
 *   habit_pattern       → action_items (type='habit') + daily_habit_logs
 *   aurora_conversation → aurora_memory_graph + aurora_conversation_memory
 *   energy_pattern      → aurora_onboarding_progress.energy_level + aurora_energy_patterns
 *   ego_state           → profiles.ego_state / game state
 *   streak_consistency  → profiles.streak / streak_history
 *   skill_distribution  → user_skill_progress table
 *   community_activity  → community_posts + community_comments + community_likes
 */
export const DNA_SIGNAL_SOURCES: Record<DNASignalSource, { table: string; description: string }> = {
  pillar_assessment:   { table: 'domain_assessments', description: 'Results from 15-pillar assessments' },
  habit_pattern:       { table: 'action_items', description: 'Habit completion patterns' },
  aurora_conversation: { table: 'aurora_memory_graph', description: 'Aurora AI interaction insights' },
  energy_pattern:      { table: 'aurora_energy_patterns', description: 'Energy/productivity patterns' },
  ego_state:           { table: 'profiles', description: 'Current ego state' },
  streak_consistency:  { table: 'profiles', description: 'Streak maintenance' },
  skill_distribution:  { table: 'user_skill_progress', description: 'Skill XP distribution' },
  community_activity:  { table: 'community_posts', description: 'Community engagement' },
};
