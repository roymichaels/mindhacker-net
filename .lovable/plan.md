## Goal
Reset the authenticated experience so the core OS routes render only ShellV2-owned DOM, while preserving the header pattern you want as a ShellV2-only component.

## Overlap audit
**Existing systems that overlap with the requested behavior**
- **Shell systems:** `ProtectedAppShell`, `DashboardLayout`, `SmartRoot`, `ProtectedAppShellV2`, direct `ShellV2` mounting in `BrainPage`
- **Legacy route surfaces:** `StrategyPage`, `HypnosisPage`, `FMAppShell`, `UserDashboard`, pillar pages, `JournalingHub`, `MindOSWorkPage`
- **Legacy overlays/sheets/modals:** `MindOSSheet`, `HubModalHost`, old drawers, onboarding ceremony/wizards, global wizard/modal mounts
- **Artifact fallback leak:** `PlanArtifact` currently renders raw placeholder text (`PlanArtifact placeholder. params: ...`)

**Classification**
- This work should be a **route + shell quarantine pass**, plus one **runtime guard**, not a new feature.
- It **removes old paradigms** instead of adding new ones.
- It **reduces architectural complexity** by collapsing duplicated shells and route surfaces.

## Plan
### 1) Make ShellV2 the only authenticated shell for core routes
- Rework the core route tree so authenticated access to `/`, `/aurora`, `/brain`, and `/outer-world` resolves only through **`ProtectedAppShellV2`**.
- Stop using the current authenticated `SmartRoot` branch for `/` as a direct shell owner.
- Normalize `/brain` so it no longer mounts its own parallel shell path outside the shared V2 wrapper.
- Keep unauthenticated `/` on the public marketing page only.

### 2) Quarantine legacy route surfaces instead of rendering them
- Replace the following legacy route outputs with redirects to `/` or a clean ShellV2 artifact placeholder path:
  - `/strategy`
  - `/hypnosis`
  - `/fm` and nested FM pages
  - `/journal`
  - `/work`
- Hard-block legacy pillar and mission surfaces from the ShellV2 routes so they cannot appear under `/`, `/aurora`, `/brain`, or `/outer-world`.
- Remove any `fallback={<StrategyPage />}`-style behavior that can silently remount old UI when an artifact route fails.

### 3) Restore only the header, as a ShellV2-only fixed top bar
- Convert the current ShellV2 header pattern into the **single canonical fixed top header** for the four ShellV2 routes.
- Header contract:
  - **left:** history icon
  - **center:** `MINDOS / current surface`
  - **right:** menu icon
  - fixed top, mobile-native spacing, premium Outer World feel
- Do **not** restore any legacy chrome behaviors from `DashboardLayout`, `OSDrawer`, `MindOSSheet`, or hubs.
- Adjust ShellV2 content padding so chat/brain/outer-world content sits below the fixed header without reintroducing old page headers.

### 4) Add a runtime legacy kill switch
- Introduce **`LegacyMountGuard`** inside the ShellV2 tree.
- Guard behavior:
  - if a banned legacy component attempts to mount while ShellV2 is active, log the component name for diagnostics
  - return `null` so the component never renders DOM
- First guard list:
  - `StrategyPage`
  - `FMAppShell`
  - `HypnosisPage`
  - `DashboardLayout`
  - `MobileHeroGrid`
  - `MindOSSheet`
  - `HubModalHost`
  - `OnboardingCeremony`
  - `PresenceShell`
  - `HallwayShell`
  - `UserDashboard`
- Wire the guard at the component entry points most likely to leak into authenticated flows.

### 5) Remove noisy artifact placeholder output
- Replace the raw `PlanArtifact placeholder. params: ...` fallback with either:
  - no render at all, or
  - a clean native empty artifact card
- Ensure missing artifact renderers do not dump debug strings into the chat DOM.

### 6) Validate the DOM contract on `/`
Target runtime tree for authenticated `/`:
```text
ShellV2
├─ ShellV2Header
├─ ShellV2Chat
├─ ShellV2Composer
└─ UnifiedOverlayHost
```
- `BrainView` appears only on `/brain`
- `OuterWorldIndex` appears only on `/outer-world`
- No `StrategyPage`, `FMAppShell`, `DashboardLayout`, `PresenceShell`, dashboard cards, mission widgets, hypnosis modal, or duplicate composer on `/`

## Acceptance proof to return after implementation
- **Route table** showing active wrapper per core route
- **Deleted/quarantined mounts** list
- **Runtime component tree for `/`** showing only ShellV2-owned layers
- **Remaining overlay root count**
- **Composer mount count**
- **Final z-index map** for ShellV2 layers/header/overlay
- **Legacy wrappers still active outside ShellV2**, if any
- **Screenshot proof** on mobile viewport confirming:
  - no Strategy UI
  - no Free Market UI
  - no dashboard cards
  - no hypnosis wizard
  - no duplicate composer
  - no old modal

## Technical notes
- This pass is strictly a **cleanup/quarantine** pass.
- No new routes unless required for a clean redirect target.
- No redesign beyond restoring the fixed ShellV2 header pattern.
- No reactivation of `DashboardLayout`, old drawers, old hubs, legacy cards, or wizard-first flows.