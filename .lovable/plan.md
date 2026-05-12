## Problem

The AION floating orb (bottom-right) is wrapped in three decorative layers in `src/components/orb/AIONFloatingWidget.tsx`:

1. A cyan blur halo (`inset-[-22px] bg-cyan-400/20 blur-2xl`)
2. A rotating cyan ring with radial gradient (`inset-[-10px] border border-cyan-300/25 bg-[radial-gradient...]`)
3. A dark slate disk with cyan border + shadow that the orb sits inside (`border-cyan-200/35 bg-slate-950/80 shadow-[0_0_40px_rgba(34,211,238,0.4)] overflow-hidden`)

Together they form the "outsider container" the user sees around the orb.

## Fix

Edit only `src/components/orb/AIONFloatingWidget.tsx`:

- Remove the two outer decorative divs (halo + rotating ring).
- Remove the dark slate disk wrapper around `OrganicOrbCanvas`; render the canvas directly inside the motion wrapper so only the orb itself is visible (transparent background, no border/shadow).
- Keep the floating motion, hover/tap scale, the AION pill (desktop only), the chat-panel toggle, and the hidden-routes logic untouched.

Single file change, presentation only.
