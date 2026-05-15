# P3 — Component Dependency Deep Dive

Source: `scripts/audit-deadcode.mjs` static graph from `main.tsx`/`App.tsx`.

## 1. Top Dependency Hubs (incoming refs)

| Refs | File | Role |
|---:|---|---|
| 522 | `hooks/useTranslation.ts` | i18n — universal |
| 389 | `lib/utils.ts` | `cn()` helper — universal |
| 352 | `integrations/supabase/client.ts` | DB/auth client |
| 308 | `components/ui/button.tsx` | shadcn primitive |
| 214 | `contexts/AuthContext.tsx` | Session/auth |
| 149 | `components/ui/card.tsx` | shadcn primitive |
| 117 | `components/ui/badge.tsx` | shadcn primitive |
| 109 | `components/ui/dialog.tsx` | Modal base |
|  47 | `worlds/types.ts` | Worlds ontology |
|  41 | `navigation/lifeDomains.ts` | Domain registry |
|  34 | `components/aurora-ui/PageShell.tsx` | Page wrapper |
|  32 | `components/orb/types.ts` | Orb types |
|  30 | `contexts/AuroraChatContext.tsx` | Chat state |
|  25 | `contexts/LanguageContext.tsx` | i18n |

## 2. Most Dangerous to Delete

Order = blast radius (do not touch without full sweep):

1. `integrations/supabase/client.ts` (352) — auto-regen file.
2. `lib/utils.ts` (389) — touched by ~all UI.
3. `hooks/useTranslation.ts` (522) — every screen string.
4. `contexts/AuthContext.tsx` (214) — every protected surface.
5. `components/ui/button|card|badge|dialog` — shadcn base.
6. `worlds/types.ts` (47) — entire worlds ontology.
7. `navigation/lifeDomains.ts` (41) — pillar registry.

## 3. Duplicate Component Families

| Family | Generations | Canonical | Legacy |
|---|---|---|---|
| Orb | 4 (legacy/components/orb, gallery morph, personalized, v2) | `components/orb/v2/OrbView.tsx` | rest |
| Shell | 2 (`shell/`, `shellv2/`) | `shellv2/` | `shell/` overlay still used |
| Artifacts | 3 (lib/aion/artifact*, components/artifacts, hallway surfaces) | `components/artifacts/` + `lib/aion/artifact*` | hallway/surfaces |
| Hallway | full subtree | none | all of `src/hallway/` |
| Avatar canvas | 5 mounts | consolidate behind one shared Canvas | rest |

## 4. Orphan Families (309 total)

See `scripts/orphans.snapshot.txt`. Largest clusters:
- `src/_legacy/onboarding/*`
- `src/hallway/surfaces/*`
- older `pages/dev/*` exploratory
- unreferenced `components/orb/Personalized*`
- legacy strategy/pillar maze components (replaced by `StrategyMazeRedirect`)

## 5. Cross-Cutting Contexts

22 providers at root. High-touch:
- AuthContext, LanguageContext, ThemeProvider — required everywhere.
- AuroraChatContext (30 refs), AIONStateContext, AionDecisionContext — AION runtime.
- 5 modal contexts (Auth/Profile/Subscriptions/Wallet/Coaches) — collapse target.
- StoryWorldContext, SmartOnboardingContext, GameStateContext — feature-scoped, mount lower.

## 6. Subsystem Dependency Notes

- **Artifacts**: rendered via `components/artifacts/*` consuming `lib/aion/artifact*`. No inbound from pages outside Shell.
- **Chat / Stream**: `AuroraChatContext` → `aiGateway` edge fn. SSE handled in `lib/aion/*`.
- **Web3 / NFT**: `@web3auth/modal`, `@lovable.dev/cloud-auth-js`, integration in `src/integrations/lovable/index.ts`. Single OAuth call site.
- **Voice**: `aion/voice.ts` → ElevenLabs edge fn (cached TTS). UI hooks in `aion/presence/*`.
- **Orb**: only `components/orb/v2/OrbView.tsx` should mount; all chrome orbs render via `CanonicalAionModel`.
- **World / Atmosphere**: `worlds/runtime/useWorldReactivity` + `worlds/atmosphere/*` + `WorldAtmosphere` per-world.

## 7. Cleanup Dependency Order (post-export only)

1. **Wave 1 — orphans**: delete files in `scripts/orphans.snapshot.txt` that are still orphans after a clean re-run.
2. **Wave 2 — hallway**: archive `src/hallway/` (already redirected).
3. **Wave 3 — orbs**: migrate non-v2 orb usages → `OrbView`, delete legacy orb files.
4. **Wave 4 — avatar canvases**: lift the 5 extra `<Canvas>` mounts onto `SharedOrbStage` or render-to-texture.
5. **Wave 5 — modal contexts**: introduce `ModalRouterProvider`, delete the 5 single-purpose modal contexts.
6. **Wave 6 — _legacy**: delete `src/_legacy/*` once nothing imports it (verify via audit script).

Never run waves 3–6 before export + green build externally.
