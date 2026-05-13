# AppShell (consolidation phase)

Final unified shell — replaces `src/shellv2/*`, `src/shell/overlay/*`,
`src/hallway/HallwayShell.tsx`, `src/presence/PresenceShell.tsx`,
and the per-page `<Header/>` usages.

Mount tree:

```
AppShell
 ├─ ChromeLayer       header + bottom tab nav (legacy aesthetic)
 ├─ BackgroundLayer   theme background (single source)
 ├─ <Outlet/>         current surface
 ├─ ChatLayer         pinned AION composer + orb
 ├─ OverlayHost       single OverlayManager portal
 └─ BlockingLayer     auth / onboarding / welcome gates
```

Status: skeleton only. Off behind `ff_app_shell` (see `src/app-shell/featureFlag.ts`).
Routes still mount under `ProtectedAppShellV2` until P6.