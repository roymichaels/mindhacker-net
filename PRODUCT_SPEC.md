# PRODUCT_SPEC.md

Last updated: 2026-03-25

This file is the current product contract for the live repo state. It replaces the older 5-tab `FM | AION | Play | Community | Study` interpretation.

## Brand Model

- `Evolve` = the platform brand
- `MindOS` = the AI coaching and execution layer inside Evolve
- `AION` = the visual/presence layer
- `MindOS` is the single AI brain, powered by OpenClaw

## Primary Navigation

Current visible app tabs are defined in [src/navigation/osNav.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\navigation\osNav.ts).

| Tab | Route | Purpose |
|---|---|---|
| `Free Market` | `/fm` | Marketplace, wallet, earning, monetization |
| `MindOS` | `/mindos/chat` | Coaching and execution hub |
| `Community` | `/community` | Social feed, stories, interaction |
| `Study` | `/learn` | Courses and education |

## MindOS Structure

`MindOS` is now the main protected coaching surface:

| Section | Route | Purpose |
|---|---|---|
| `Chat` | `/mindos/chat` | MindOS conversation and coaching |
| `Tactics` | `/mindos/tactics` | Daily execution and operational focus |
| `Strategy` | `/mindos/strategy` | Domain strategy hub and assessment entry |
| `Work` | `/mindos/work` | Projects, milestones, work execution |
| `Journal` | `/mindos/journal` | Reflection and journaling surfaces |

The section shell is implemented in [src/pages/MindOSPage.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\pages\MindOSPage.tsx).

## Legacy Route Policy

Legacy routes remain valid through redirects:

- `/aurora` -> `/mindos/chat` (legacy redirect into AION chat)
- `/play` -> `/mindos/tactics`
- `/now` -> `/mindos/tactics`
- `/plan` -> `/mindos/tactics`
- `/work` -> `/mindos/work`
- `/strategy` -> `/mindos/strategy`
- `/messages/ai` -> `/mindos/chat`
- `/arena/:domainId/*` -> `/mindos/strategy...`

Important transitional note:

- top-level MindOS routes are live
- deep pillar flows still physically live under `/strategy/*` in the router
- `/mindos/strategy` is the new strategic landing layer, not yet a full replacement for every old pillar path

## Identity Model

Canonical product identity stack:

```text
DNA -> AION -> MindOS Layer -> Avatar
```

- `DNA` is computed in [src/identity/computeDNA.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\identity\computeDNA.ts)
- `AION` is the current canonical presence/visual identity name
- `MindOS Layer` is the unified AI interface and reasoning surface
- `Avatar` is the customizable body layer

## Onboarding Contract

Current onboarding flow:

1. public landing
2. `/onboarding`
3. `/ceremony`
4. avatar configuration
5. protected entry into `MindOS`

Recent update:

- community username setup is now captured inside the avatar configurator instead of being blocked later on Community
- the username field lives at the top of the avatar sidebar in [src/components/avatar/AvatarConfiguratorUI.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\components\avatar\AvatarConfiguratorUI.tsx)

## AI Contract

Current AI runtime is hybrid:

- conversational migration path uses Vercel `/api/mindos-chat` and `/api/domain-assess`
- many legacy AI flows still exist in `supabase/functions`
- backend OpenClaw alignment now starts from `backend/openclaw/`

## Subscription / Gating

Current gating remains based on Supabase subscription state plus app-side guards.

Key realities:

- Free users are still gated on certain AI usage limits
- Commerce and billing remain Stripe + Supabase driven
- Wallet onboarding still depends on Web3Auth plus Supabase bridge flows

## Non-Negotiable Current Truths

1. `Evolve` is the platform name
2. `MindOS` is not the whole app, it is the internal coaching layer
3. `MindOS` is the single AI brain across chat, assessment, and planning
4. the main protected destination is now `MindOS`, not `Play`
5. docs that still describe a 5-tab app are obsolete
