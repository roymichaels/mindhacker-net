

# Soul Avatar NFT — Web3 Onboarding & Minting System

## Overview
Transform the existing orb system into a "Soul Avatar NFT" with Web3Auth wallet creation, a minting wizard, and play-to-earn integration. The wizard triggers from multiple entry points: Market tab (first visit), a dedicated mint button on the profile card, and post-onboarding.

## Architecture

```text
┌─────────────────────────────────────────────┐
│           Entry Points (3)                  │
│  Market Tab │ Orb NFT Card │ Post-Onboard   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│        Web3 Onboarding Wizard (Modal)       │
│  Step 1: Welcome — "Enter the Soul Realm"   │
│  Step 2: Explain Web3 (what is it, why)     │
│  Step 3: Create Wallet (Web3Auth)           │
│  Step 4: Mint Soul Avatar NFT (animation)   │
│  Step 5: Welcome to Play2Earn               │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│        Database: soul_wallets table         │
│  user_id, wallet_address, provider,         │
│  is_minted, minted_at, nft_metadata         │
└─────────────────────────────────────────────┘
```

## Step-by-Step Plan

### 1. Database — `soul_wallets` table
New table to track wallet + mint status:
- `id`, `user_id` (FK profiles), `wallet_address`, `wallet_provider` (web3auth), `is_minted` (bool), `minted_at`, `nft_metadata` (jsonb — stores avatar traits, rarity, geometry, material), `created_at`
- RLS: users can read/update only their own row
- Add `is_web3_onboarded` boolean column to `profiles` table (or use soul_wallets existence as gate)

### 2. Web3Auth Integration — Edge Function
Create `supabase/functions/web3-wallet/index.ts`:
- Initializes Web3Auth server-side verification
- Stores wallet address after client-side Web3Auth login
- Signs "mint" metadata (Soul Avatar traits from orb_profiles)
- Returns wallet info + mint confirmation

On the frontend, use `@web3auth/modal` SDK (client-side):
- Initialize Web3Auth with project client ID (needs secret: `WEB3AUTH_CLIENT_ID`)
- On successful login → get wallet address → call edge function to persist

### 3. Web3 Onboarding Wizard Component
`src/components/web3/SoulAvatarMintWizard.tsx` — Full-screen modal (portal to body, z-[99999]):

**Step 1 — "The Soul Realm"**: Epic intro screen with the user's current orb animating, text explaining "Your growth is about to become permanent"

**Step 2 — "What is Web3?"**: Simple visual explainer — digital ownership, your avatar lives on-chain, earn real rewards. Bilingual HE/EN.

**Step 3 — "Create Your Wallet"**: Web3Auth login button (Google/email — no seed phrases). Shows wallet address after creation. Clean, non-scary UX.

**Step 4 — "Mint Your Soul Avatar"**: Cinematic minting animation — orb transforms into NFT card with rarity border, traits, geometry. Writes to `soul_wallets` + marks `is_minted = true`.

**Step 5 — "Welcome to Play2Earn"**: Celebration screen, shows MOS balance, links to FM marketplace, bounties.

### 4. Entry Point Gating
- **Market tab** (`BottomTabBar.tsx` / `FMAppShell`): Check if `soul_wallets` row exists for user. If not → open wizard instead of FM page.
- **OrbNFTCard**: Add "Mint Soul Avatar" button if not yet minted. Change "Minted" footer to show real on-chain status.
- **Post-onboarding** (`OnboardingPlanGeneration.tsx`): After plan generation, auto-trigger wizard.

### 5. Terminology Updates
Rename across the codebase:
- "Orb" → "Soul Avatar" in user-facing text (keep code names as-is for stability)
- "Minted" date on OrbNFTCard → real mint date from `soul_wallets`
- OrbNFTCard title → "Soul Avatar NFT"
- SidebarOrbWidget tooltip → "Soul Avatar"

### 6. Play2Earn Gate
After minting, the user's FM experience unlocks:
- FM wallet becomes "Web3 Wallet" with real address displayed
- Bounty rewards tagged as "on-chain claimable"
- Achievement cards show "mintable" badge

## Technical Requirements

- **Secret needed**: `WEB3AUTH_CLIENT_ID` — user must create a Web3Auth project at https://dashboard.web3auth.io
- **NPM package**: `@web3auth/modal`, `@web3auth/base` (client-side)
- **Edge function**: `web3-wallet` for server-side wallet verification + mint recording
- **Migration**: New `soul_wallets` table with RLS

## Files to Create/Modify

| File | Action |
|------|--------|
| `soul_wallets` table | Create (migration) |
| `supabase/functions/web3-wallet/index.ts` | Create |
| `src/components/web3/SoulAvatarMintWizard.tsx` | Create |
| `src/hooks/useSoulWallet.ts` | Create |
| `src/components/gamification/OrbNFTCard.tsx` | Update labels + mint button |
| `src/components/sidebar/SidebarOrbWidget.tsx` | Update labels |
| `src/components/navigation/BottomTabBar.tsx` | Add mint gate on Market tab |
| `src/components/fm/FMAppShell.tsx` | Add mint gate wrapper |
| `src/components/onboarding/OnboardingPlanGeneration.tsx` | Trigger wizard post-onboarding |

## Sequence
1. Add `WEB3AUTH_CLIENT_ID` secret
2. Create `soul_wallets` table migration
3. Create edge function for wallet persistence
4. Build the 5-step wizard component
5. Create `useSoulWallet` hook (check mint status, trigger wizard)
6. Wire entry points (Market tab, NFT card, post-onboarding)
7. Update terminology across UI

