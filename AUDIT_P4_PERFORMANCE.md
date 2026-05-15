# P4 — Performance / Render / Bundle Audit

## 1. Always-Mounted Providers (root)

22 nested providers wrap every route, including public landing:

Query, Tooltip, Theme, Language, Auth, Environment, Motion, AIONState, AionDecision, AuroraChat, GameState, SoulAvatar, AuthModal, ProfileModal, SubscriptionsModal, WalletModal, CoachesModal, SmartOnboarding, StoryWorld, Overlay, Analytics, FlowAudit.

Cost: every route render walks 22 context consumers + a re-render storm whenever any modal context state flips.

## 2. Always-Mounted Runtimes

- `WorldsRuntime` (subscriptions to world reactivity store)
- `DreamRuntime`
- `AtmosphereLayer`
- `ConsciousnessField`, `MatrixRain` (DOM/canvas overlays)
- `SharedOrbStage` (WebGL canvas, RAF loop)
- `InteractiveAIONHost` + `PersistentWorldOrb`
- `DiagnosticsHost`

These run on `/`, `/blog`, `/founding` — landing pages do not need them.

## 3. Expensive Render Paths

- **Public landing** (`/`) inherits the entire AION+Worlds runtime.
- **ShellV2 outlet swap** triggers RealmTransitionLayer + atmosphere recompute.
- **AuroraChatContext** broadcasts every token of streaming response → any consumer re-renders. Selectors not used.
- **AION orbs in chrome** all render via `CanonicalAionModel` (good), but each instance sets up its own RAF subscription via `useOrbPresenceBehaviour`.

## 4. Repeated Subscriptions

- `useWorldReactivity()` consumed in ≥6 places across worlds + atmosphere; each subscribes to the climate store.
- `useTranslation()` consumed 522× — fine (memoized) but every i18n change re-renders the world.
- Modal contexts: 5 separate providers each emit on open/close.

## 5. Duplicate Canvas / RAF Risks

`<Canvas>` mounts found:
1. `components/orb/v2/SharedOrbStage.tsx` ← canonical
2. `components/avatar/AvatarConfigurator.tsx`
3. `components/avatar/AvatarFullBody.tsx`
4. `components/avatar/AvatarMiniPreview.tsx`
5. `components/docs/visual/VisualWhitepaperScene.tsx`
6. `components/founding/FoundingAvatarGroup.tsx`

Goal: 1. WebGL contexts >4 trigger browser eviction on mobile.

## 6. Heavy npm Packages

| Package | Disk | Notes |
|---|---|---|
| `three` | 31M | Required by orb + avatars |
| `@web3auth/modal` | 12M | Loaded eagerly; lazy-load behind `/founding` + auth modal only |
| `@react-three/{fiber,drei,postprocessing}` | ~10M combined | Already used by OrbView |
| `openai` | ~3M | **Frontend-unsafe** — remove; backend uses aiGateway |
| `@lovable.dev/cloud-auth-js` | — | Lovable-only; replace with Supabase OAuth post-export |

## 7. Frontend-Only Unsafe Packages

- `openai` in `package.json` dependencies — must NOT be imported in frontend (would expose key). Verify zero imports, then drop.
- `@lovable.dev/cloud-auth-js` — Lovable-coupled; replace with `supabase.auth.signInWithOAuth({ provider: 'google' })`.

## 8. Bundle-Split Recommendations

- Split `@web3auth/modal` and `three` ecosystems into dedicated chunks via `vite.config.ts` `manualChunks`:
  - `vendor-three`: three, @react-three/*
  - `vendor-web3`: @web3auth/*, ethers/viem (if any)
  - `vendor-ui`: @radix-ui/*
- Keep the public landing chunk free of AION + Worlds runtimes.

## 9. Lazy-Loading Opportunities

- Defer `WorldsRuntime`, `DreamRuntime`, `AtmosphereLayer`, `SharedOrbStage`, `InteractiveAIONHost`, `PersistentWorldOrb` behind `ProtectedAppShellV2` (mount inside Shell, not in App.tsx).
- Lazy-import Web3Auth on first use of auth modal (dynamic `import()`).
- Lazy-import avatar Canvas components (already partly lazy via routes).

## 10. Memory Leak Risks

- Any uncleaned `requestAnimationFrame` in orb subscribers (verify each `useOrbPresenceBehaviour` returns cleanup).
- AuroraChat SSE: confirm AbortController on unmount.
- Web3Auth localStorage tokens (already proactively cleared in `main.tsx`).
- `WorldsRuntime` global store: ensure no per-route push without unsubscribe.

## 11. Provider Collapse Plan

Replace 22 providers with ~7:
1. `CoreProviders` — Query, Theme, Lang, Auth, Tooltip
2. `AIONRuntime` — AIONState + AionDecision + AuroraChat + SoulAvatar
3. `ModalRouter` — Auth, Profile, Subscriptions, Wallet, Coaches (single reducer)
4. `EnvironmentRuntime` — Environment + Motion + Theme settings
5. `OverlayProvider` (kept)
6. `FlowAudit` (kept, dev-only build flag)
7. Per-shell: `StoryWorld`, `GameState`, `SmartOnboarding` mounted inside Shell only.

## 12. Measurable Cleanup Targets

| Metric | Now | Target |
|---|---:|---:|
| Root providers | 22 | 7 |
| `<Canvas>` mounts | 6 | 1 |
| Orphan files | 309 | <50 |
| JS bundle (initial) | unknown | <450 KB gzip |
| Public-route TTI | unknown | -30% |
| WebGL context count | up to 6 | 1 |
| Eager npm deps | 72 | 65 (after dropping `openai`, lazy web3) |
