# Plan: Make AION chat feel like the Lovable mobile app

Light, scoped UI polish to `src/pages/AuroraPage.tsx` (and supporting bits) so the home chat surface mirrors the Lovable app screenshot.

## Visual changes

1. **Top bar** (replace current `AIONHeader` on the home chat only)
   - Left: circular ghost icon button (hamburger / menu — opens existing left sidebar/profile drawer)
   - Center: pill-shaped selector showing current context (e.g. "MindOS ▾" or active pillar) — tap = no-op for now
   - Right: circular ghost icon button (▶ play / quick action)
   - Flat dark, no borders, generous spacing

2. **Conversation surface**
   - Remove the gradient radial background; use solid near-black (`bg-background`) like Lovable
   - Center a small timestamp divider ("12 May at 00:52") at the top of each session
   - User bubbles: pill-shaped, subtle muted gray, right-aligned, italic-friendly
   - AION replies: no bubble — plain text, left-aligned, muted label like "Thought for Ns" above when applicable
   - Inline "Edited file.tsx — short reasoning" cards as compact rounded rows with chevron (re-style existing tool/result chips)

3. **Suggestion chips row** (just above composer)
   - Horizontal scroll of 3–4 short prompt chips (use existing quick actions, restyled): rounded-full, dark surface, single-line, fade on right edge
   - Replaces the current colored gradient quick-action squares on this page only (keep them in the orb modal)

4. **Composer** (restyle `GlobalChatInput` wrapper on this page)
   - Single rounded-3xl pill containing placeholder "Queue follow-up…"
   - Bottom row inside the pill: left = `+` and `…` ghost circles; right = map/route, mic, send/stop circles
   - Soft inner border, no harsh top divider

5. **Spacing & chrome**
   - Tighten vertical paddings to match screenshot density
   - Keep header + bottom tab bar untouched (already correct)
   - Hide the floating AION orb on this route only (it's redundant when chat is the page)

## Scope guardrails
- Frontend/presentation only. No routing, data, or backend changes.
- Changes limited to: `src/pages/AuroraPage.tsx`, a small new `AIONHomeHeader` component, light wrapper styles around `GlobalChatInput` and `AuroraChatBubbles`, and a one-line `HIDDEN_ROUTES` addition in `AIONFloatingWidget.tsx` for `/mindos/chat`.
- Orb modal (`AIONChatPanel`) keeps its current look — only the home page changes.

## Out of scope
- Building a real project switcher / menu drawer behavior
- Restyling messages globally (only on the home chat surface)
- Any change to AI behavior, tools, or message data shape