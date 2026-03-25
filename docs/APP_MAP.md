# APP_MAP.md

Last updated: 2026-03-25

This is the route and shell map for the current repo state.

## Bottom Navigation

Source of truth: [src/navigation/osNav.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\navigation\osNav.ts)

| Tab | Route |
|---|---|
| `Free Market` | `/fm` |
| `MindOS` | `/mindos/chat` |
| `Community` | `/community` |
| `Study` | `/learn` |

## MindOS Internal Sections

Source of truth: [src/pages/MindOSPage.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\pages\MindOSPage.tsx)

| Section | Route |
|---|---|
| `Chat` | `/mindos/chat` |
| `Tactics` | `/mindos/tactics` |
| `Strategy` | `/mindos/strategy` |
| `Work` | `/mindos/work` |
| `Journal` | `/mindos/journal` |

## Public Routes

Defined in [src/App.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\App.tsx).

| Route | Surface |
|---|---|
| `/` | landing |
| `/founding` | founding landing |
| `/onboarding` | onboarding |
| `/ceremony` | onboarding ceremony |
| `/go` | go page |
| `/courses` | courses listing |
| `/courses/:slug` | course detail |
| `/courses/:slug/watch` | course watch |
| `/blog` | blog |
| `/blog/:slug` | blog post |
| `/docs` | documentation |
| `/subscriptions` | subscriptions |
| `/install` | install |
| `/audio/:token` | tokenized audio |
| `/video/:token` | tokenized video |
| `/privacy-policy` | legal |
| `/terms-of-service` | legal |
| `/affiliate-signup` | affiliate signup |
| `/unsubscribe` | unsubscribe |
| `/features/:slug` | feature page |
| `/practitioner/:slug` | coach redirect |
| `/practitioners/:slug` | coach redirect |
| `/coach/:slug` | coach redirect |
| `/orbs` | orb gallery |
| `/dev/orb-gallery` | dev orb gallery |

## Protected Routes

### Full-screen protected route

| Route | Surface |
|---|---|
| `/avatar` | avatar configurator |

### Main protected shell

| Route | Surface |
|---|---|
| `/mindos/*` | MindOS shell |
| `/community` | community |
| `/community/post/:postId` | community thread |
| `/messages` | messages |
| `/messages/:conversationId` | message thread |
| `/coaches` | coaches |
| `/admin-hub` | admin hub |
| `/launchpad/complete` | launchpad complete |
| `/quests/:pillar` | quest runner |
| `/learn` | study |
| `/fm` | free market shell |
| `/business` | business hub |
| `/business/journey` | business journey |
| `/business/:businessId` | business dashboard |
| `/freelancer` | freelancer |
| `/creator` | creator |
| `/therapist` | therapist |
| `/success` | success |

## Strategy / Assessment Routes

The top-level strategic entry is now `MindOS`, but detailed assessment routes remain on the legacy `strategy` tree for now.

| Route pattern | Purpose |
|---|---|
| `/strategy/presence/*` | presence flows |
| `/strategy/power/*` | power flows |
| `/strategy/vitality/*` | vitality flows |
| `/strategy/focus/*` | focus flows |
| `/strategy/combat/*` | combat flows |
| `/strategy/expansion/*` | expansion flows |
| `/strategy/consciousness/*` | consciousness flows |
| `/strategy/wealth/*` | arena assessment |
| `/strategy/influence/*` | arena assessment |
| `/strategy/relationships/*` | arena assessment |
| `/strategy/business/*` | arena assessment |
| `/strategy/projects/*` | arena assessment |
| `/strategy/play/*` | arena assessment |
| `/strategy/:domainId` | domain landing |

## Redirect Policy

Source of truth: [src/routes/redirects.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\routes\redirects.tsx)

Main redirects:

- `/aurora` -> `/mindos/chat`
- `/play` -> `/mindos/tactics`
- `/now` -> `/mindos/tactics`
- `/plan` -> `/mindos/tactics`
- `/profile` -> `/mindos/tactics`
- `/strategy` -> `/mindos/strategy`
- `/work` -> `/mindos/work`
- `/dashboard` -> `/mindos/tactics`
- `/today` -> `/mindos/tactics`
- `/messages/ai` -> `/mindos/chat`
- `/admin` and `/panel/*` -> `/admin-hub`
- `/coach` and `/practitioners` aliases -> `/coaches`

## Navigation Notes

- `Aurora` is no longer a primary bottom tab
- `MindOS` is the protected coaching hub
- deep strategy/pillar flows are still in transition
- the route truth is [src/App.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\App.tsx), even where older docs say otherwise
