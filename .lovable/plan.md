## Dev Diagnostics Panel — Plan

A dev-only floating overlay that proves the brain → environment → memory-writer → graph loop is alive. Zero impact on production users, zero clutter in normal UI.

### Visibility & gating

- Mounted globally inside `App.tsx` next to `<SharedOrbStage />` so it's available on every authenticated route.
- Renders only when `import.meta.env.DEV === true` **OR** `localStorage.getItem('mindos.diag') === '1'` (safe flag for staging/prod debugging by us). Otherwise returns `null`.
- Also auto-hides if there's no logged-in user (avoids public landing).
- A tiny floating **brain icon button** sits at `bottom-20 left-3` (above bottom tab, below safe area), `z-[60]`, 36px, `backdrop-blur` chip. Tap opens a bottom sheet (mobile) / right drawer (≥md). Esc / outside-tap closes.

### File layout (new)

```text
src/diagnostics/
  DiagnosticsHost.tsx        ← mounted in App.tsx; floating button + sheet
  DiagnosticsSheet.tsx       ← layout, sections, refresh control
  sections/
    BrainSection.tsx         ← AION decision row
    EnvironmentSection.tsx   ← EnvironmentProvider state
    MemoryWriterSection.tsx  ← last invocation telemetry
    GraphCountersSection.tsx ← table counts
    LeakGuardSection.tsx     ← last sanitizer outcome
  diagnosticsBus.ts          ← tiny event bus (memory-writer + leak-guard)
  useDiagnosticsFlag.ts      ← DEV || localStorage flag, with `?diag=1` URL toggle
```

No new providers, no context — sections read from the existing hooks (`useAionDecision`, `useEnvironment`, `useAuth`) and from the bus.

### Section contents

**1. AION Brain** — from `useAionDecision().decision`:
- `mode`, `tone`, `density`, `expires_at`
- `focus_target` and `suggestion` rendered as collapsible `<pre>` JSON
- live/expired badge (compare `expires_at` to `Date.now()`)
- "no decision yet — fast-tier in control" empty state

**2. Environment** — from `useEnvironment().state`:
- `mode`, `cognitiveBudget`, `source` (`fast-tier` / `slow-tier`), `reason`, `updatedAt`
- `aionDecision` echo (proves binding works)
- chrome/orb hints from `state` if present (`chromeVisibility`, `orbState` — render only when defined; never assume shape)

**3. Memory Writer** — from `diagnosticsBus`:
- last `source` (chat/journal/hypnosis/mission), `status` (`pending` | `ok` | `error`), `duration_ms`
- counts from response: `inserted`, `reinforced`, `skipped` (derived from `writes.graph[].action`)
- last error string if any
- "Test write" button that calls `supabase.functions.invoke('memory-writer', { body: { source: 'chat', context: { messages: [{role:'user', content:'diag ping'}] } } })` and feeds result back to bus

**4. Graph Counters** — direct `supabase.from(...).select('*', { count: 'exact', head: true })`:
- `aurora_memory_graph` (total + last-24h)
- `aurora_behavioral_patterns` (total)
- `aurora_identity_elements` (total)
- `aion_signals` last 24h
- Manual "Refresh" button + auto-refresh every 30s while sheet is open

**5. Leak Guard** — from `diagnosticsBus`:
- last assistant message length (raw vs sanitized)
- `clean | sanitized | rejected` derived by comparing `stripReasoning(raw).length` vs `raw.length`
- list of matched forbidden patterns (we re-run a small detector that just reports which `THINK_BLOCK` / preamble fired, without mutating the message)

### Wiring (minimal touch outside the new folder)

- `src/App.tsx`: import + render `<DiagnosticsHost />` once, near `<SharedOrbStage />`. ~2 lines.
- `src/hooks/aurora/useAuroraChat.tsx`:
  - On the existing `memory-writer` invoke, capture `{ status, duration_ms, response | error }` and push to `diagnosticsBus.emit('memory-writer', …)`. Already wrapped in try/catch — non-blocking guarantee preserved.
  - Right after `cleanedContent` is computed, push `{ rawLen, cleanLen, matched }` to `diagnosticsBus.emit('leak-guard', …)`.

That's the entire production surface change: one mount, two `emit` calls. Both are no-ops in production builds because subscribers only attach inside the dev-only host.

### Non-blocking guarantee

- `diagnosticsBus` is a synchronous in-memory `EventTarget`; `emit` never throws.
- All section reads are wrapped in `try/catch` and render an inline error chip rather than crashing the panel.
- "Test write" uses `void` + `.catch` like the production path.
- Counter queries use `head: true` so they're cheap.

### Out of scope (explicitly)

- No graph visualisation, no room UI, no homepage changes.
- No new tables, no migrations, no RLS edits.
- No telemetry shipped anywhere — all data is local to the running tab.
- No edits to sanitizer or memory-writer logic — diagnostics observes only.

### Acceptance

- In dev: brain icon visible bottom-left; sheet opens; all 5 sections populate within ≤1s of opening.
- Send a chat → Memory Writer section flips to `ok` with `duration_ms` and counts; Leak Guard updates with `clean`/`sanitized`.
- Mutate a row in `aion_decisions` → Brain + Environment sections update live (existing realtime).
- Production build: panel and button absent from the DOM unless `localStorage['mindos.diag']='1'`.
