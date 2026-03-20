/**
 * AION Identity Layer — Barrel exports
 *
 * Architecture:
 *   DNA (base seed)  →  AION (identity + AI companion)  →  Orb (visual renderer)  →  Avatar (future game body)
 *
 * The Orb system in src/components/orb/ is the RENDERING ENGINE.
 * The wallet/mint system in src/hooks/useSoulWallet.ts handles Web3 ownership.
 * This identity layer is the CONCEPTUAL IDENTITY above both.
 */

// Types
export type { AIONIdentity, DNAProfile, DNASignal, DNASignalSource } from './types';
export { DEFAULT_AION_IDENTITY, DEFAULT_DNA_PROFILE, DNA_SIGNAL_SOURCES } from './types';

// Hooks
export { useAION } from './useAION';

// Aliases — transition-safe wrappers for legacy names
export { useAIONWallet } from './aliases';
export { useAIONWizard, AIONWizardProvider } from './aliases';
