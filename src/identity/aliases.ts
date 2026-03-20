/**
 * AION Identity Aliases — transition-safe wrappers for legacy names.
 *
 * These re-export legacy hooks/contexts under AION-oriented names so that:
 * - New code naturally uses AION naming
 * - Old code continues to work via original imports
 * - Future migration can swap implementations without changing consumers
 *
 * DO NOT rename database tables yet.
 * DO NOT break existing imports.
 */

// ── Wallet ──
// Legacy: useSoulWallet → AION: useAIONWallet
export { useSoulWallet as useAIONWallet } from '@/hooks/useSoulWallet';

// ── Wizard Context ──
// Legacy: useSoulAvatarWizard / SoulAvatarProvider
// AION: useAIONWizard / AIONWizardProvider
export { useSoulAvatarWizard as useAIONWizard } from '@/contexts/SoulAvatarContext';
export { SoulAvatarProvider as AIONWizardProvider } from '@/contexts/SoulAvatarContext';
