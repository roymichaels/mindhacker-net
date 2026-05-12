## Problem

The page content is wrapped inside a secondary "world surface" card (`StorySurfaceHost`) — a max-width 1380px rounded-[32px] bordered container that sits on top of the `StoryWorldShell` background scene. On mobile this:

- creates the visible bordered card with a leaking right edge (the AION orb sits outside it)
- shifts content right and clips the page chrome
- appears across all main hubs (`/mindos`, `/fm`, `/community`, `/learn`, `/strategy`, `/work`)

## Fix

Disable both world-shell wrappers app-wide so each page renders directly inside the main scroll container with no inner card.

In `src/lib/featureFlags.ts`:

- Default `enableStoryWorld` → `false` (removes the background scene + decorative orb overlay layer in `DashboardLayout`).
- Default `enableModalWorldShell` → `false` (makes `StorySurfaceHost` a transparent passthrough that renders `children` directly, removing the rounded inner card and its title bar).

No component logic changes; the env vars still allow re-enabling later. Header, bottom tab bar, AION dock, and page contents stay intact — they just sit flat against the page background instead of inside a nested card.

Single file edit: `src/lib/featureFlags.ts`.
