/**
 * AION Identity Layer — Barrel exports
 *
 * Architecture:
 *   DNA (base seed, SSOT)  →  AION (identity + AI companion)  →  Orb (visual renderer)  →  Avatar (future game body)
 *
 * DNA is the SINGLE SOURCE OF TRUTH for identity.
 * AION depends ONLY on DNA.
 * The Orb system in src/components/orb/ is the RENDERING ENGINE.
 * The wallet/mint system in src/hooks/useSoulWallet.ts handles Web3 ownership.
 */

// Types
export type { AIONIdentity, DNAProfile, DNASignal, DNASignalSource } from './types';
export { DEFAULT_AION_IDENTITY, DEFAULT_DNA_PROFILE, DNA_SIGNAL_SOURCES } from './types';

// DNA — Single Source of Truth
export { useDNA } from './useDNA';
export { computeDNA, type DNAInputSignals } from './computeDNA';

// AION — Depends on DNA
export { useAION } from './useAION';

// Aliases — transition-safe wrappers for legacy names
export { useAIONWallet } from './aliases';
export { useAIONWizard, AIONWizardProvider } from './aliases';
