## Goal

Make login work end-to-end on Lovable Cloud (managed Google OAuth + email/password) and remove the Web3Auth layer that's interfering.

## Problems

1. Auth log shows `400: Unsupported provider: missing OAuth secret` on `/authorize` → Google provider isn't configured for the managed Cloud auth.
2. Auth log shows `403: invalid claim: missing sub claim` → stale Web3Auth-issued JWT in storage is being sent to Cloud auth.
3. `Web3AuthProviderWrapper` still wraps the entire app (`src/App.tsx`), pulling in the Web3Auth SDK and polyfills on every load even though no UI uses it anymore.
4. `CloudAuthModal` calls `supabase.auth.signInWithOAuth("google", …)` directly. With Lovable Cloud managed OAuth we should use `lovable.auth.signInWithOAuth` from `src/integrations/lovable/index.ts` instead.

## Plan

1. **Enable managed Google OAuth** via `supabase--configure_social_auth` with `providers: ["google"]`. This scaffolds `src/integrations/lovable/` and installs `@lovable.dev/cloud-auth-js`. Email/password stays enabled (do NOT pass `disable_providers`).
2. **Update `src/components/auth/CloudAuthModal.tsx`**:
   - Replace the Google handler with `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` from `@/integrations/lovable`.
   - Keep email/password flow on `supabase.auth` as-is.
3. **Remove Web3Auth from the runtime path**:
   - In `src/App.tsx`: drop the `<Web3AuthProviderWrapper>` wrapper and its import.
   - In `src/main.tsx`: remove the Web3Auth browser polyfills block.
   - Delete `src/providers/Web3AuthProviderWrapper.tsx`, `src/lib/web3auth.ts`, `src/lib/web3authConfig.ts`, `src/components/auth/Web3AuthLoginButton.tsx`, `src/components/auth/Web3AuthModalBridge.tsx`. (Already not used anywhere.)
   - In `src/components/web3/SoulAvatarMintWizard.tsx` (only remaining web3 reference): replace the wallet-connection check with the Cloud-auth user check, or stub the wallet step out — confirm during implementation.
4. **Clear stale tokens**: add a one-time effect that, if `localStorage` contains `openlogin_store` / `Web3Auth-cachedAdapter`, removes them so the bad JWT stops being attached.
5. Verify: open the auth modal → "Continue with Google" routes through Lovable's OAuth broker; email signup/login still works.

## Out of scope

- The pre-existing TypeScript errors in unrelated files (already silenced with `// @ts-nocheck`).
- Apple / SAML / phone auth.
