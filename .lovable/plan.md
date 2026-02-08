

# Project Cleanup: Remove Redundancies and Unused Files

## Overview
After thorough analysis of the codebase, here are the unused and redundant items identified, organized by category.

---

## 1. Unused Components (Safe to Delete)

### `src/components/chat/` (entire directory)
- `ChatPanel.tsx`, `ChatInput.tsx`, `ChatMessage.tsx`
- **Reason**: Not imported anywhere in the app. The chat system has been fully replaced by the Aurora chat components (`src/components/aurora/`).

### `src/components/platform/` (entire directory)
- `PlatformHeroSection.tsx`, `AuroraPromoSection.tsx`, `HowItWorksSection.tsx`, `FeaturedPractitionersSection.tsx`, `index.ts`
- **Reason**: Zero imports anywhere in the project. Completely unused.

### `src/components/HeroSection.tsx` (root-level)
- **Reason**: Not imported anywhere. The homepage uses `GameHeroSection` from `components/home/`. This root-level file is a legacy duplicate.

### `src/components/practitioners/PractitionerMiniOfferCard.tsx`
- **Reason**: Only exported from the index barrel file but never actually imported/used by any component. It was replaced by `PractitionerMiniItemCard.tsx`.

### Legacy home sections (4 files)
- `src/components/home/WhatIsThisSection.tsx`
- `src/components/home/GamificationFeaturesSection.tsx`
- `src/components/home/JobShowcaseSection.tsx`
- `src/components/home/PractitionerShowcaseSection.tsx`
- **Reason**: Marked as "Legacy sections (kept for potential future use)" in `index.ts` -- no imports anywhere.

### Simplified home sections (4 files)
- `src/components/home/HeroSection.tsx`
- `src/components/home/FeaturesSection.tsx`
- `src/components/home/HowItWorksSection.tsx`
- `src/components/home/CTASection.tsx`
- **Reason**: Marked as "Simplified components (kept for potential future use)" in `index.ts` -- no imports anywhere.

---

## 2. Deprecated Edge Function

### `supabase/functions/chat-assistant/`
- **Reason**: File header explicitly says `@deprecated - Use aurora-chat with mode='widget' instead`. It just proxies to `aurora-chat`. Only one reference remains in `MessageThread.tsx` which should be updated to call `aurora-chat` directly.

---

## 3. Code Fixes for Remaining References

### `src/pages/MessageThread.tsx`
- Update the `chat-assistant` function URL to use `aurora-chat` directly (with `mode: 'widget'`), then the deprecated edge function can be deleted.

### `src/components/home/index.ts`
- Remove all 8 legacy/simplified exports that reference deleted files.

### `src/components/practitioners/index.ts`
- Remove the `PractitionerMiniOfferCard` export line.

---

## 4. Summary

| Category | Files Removed | 
|----------|--------------|
| Unused components | 14 files |
| Deprecated edge function | 1 directory |
| Index barrel cleanups | 2 files edited |
| Reference fix | 1 file edited |
| **Total files deleted** | **~15** |

All deletions are verified as safe -- no imports reference these files anywhere in the active codebase.

