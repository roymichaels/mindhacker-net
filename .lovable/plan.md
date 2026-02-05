
# Hypnosis Modal Fixes: Layout Clipping & Script Repetition

## Issues Identified

### Issue 1: Content and Action Buttons Cut Off
Looking at the screenshots, the modal UI is being clipped both during the "generating" state (first image shows only the orb, no other content) and during "playing" state (second image shows controls partially cut off).

**Root Cause Analysis:**
- The modal uses `h-[85svh]` but on mobile, this may not account for iOS/Android browser chrome
- The "generating" state layout has `pt-10` extra padding that may be pushing content out
- The `DialogContent` uses `overflow-hidden` which clips children
- The mobile viewport (`svh` - small viewport height) can be problematic on iOS Safari

### Issue 2: Hypnosis Script Repeating "Week 1" Content
The network request shows the cache key includes the goal text:
```
cache_key=eq.personalized_שבוע_1:_ניקוי_רעלים_וביטול_העו_5_he
```

**Root Cause Analysis:**
The `generateCacheKey` function in `src/services/hypnosis.ts` (lines 162-175) creates a cache key based on:
- `egoState`
- `goal` (truncated to 30 chars)
- `durationMinutes`
- `language`

This means if the user's current milestone is "Week 1: ניקוי רעלים וביטול העומס", the **same cached script** will be returned every time - even days later when context has changed (time of day, what the user has accomplished, etc.).

The AI is already hyper-personalized based on:
- Time of day
- Day of week  
- Today's habits completion
- Weekly stats
- Recent activity

BUT the caching ignores all of this temporal context! The cache key doesn't include:
- The date
- Time of day
- User's activity progress

### Issue 3: Session Text Not Showing During Playback
The second screenshot shows the segment label "WARM" and Hebrew text, but the layout may be problematic on smaller viewports.

---

## Solution Plan

### Phase 1: Fix Layout Clipping Issues

**1.1 DialogContent Sizing**
- Change from `h-[85svh]` to `min-h-[85svh] max-h-[92svh]` for more flexibility
- Add safe-area-inset handling for iOS notches/home indicators
- Use `flex-1 min-h-0` pattern for scrollable areas

**1.2 Generating State Layout**
- Reduce `pt-10` to `pt-4` on the generating state to prevent overflow
- Ensure the orb container has bounded dimensions

**1.3 Playing State Layout**
- Add `pb-safe` (safe-area-inset-bottom) to the controls section
- Ensure the text scroll area uses `flex-1 min-h-0 overflow-y-auto` correctly
- Reduce orb area padding on mobile

### Phase 2: Fix Script Caching to be Time-Aware

**2.1 Update Cache Key Generation**
Add temporal context to the cache key so scripts are fresh daily and time-appropriate:
```typescript
export function generateCacheKey(options: {
  egoState: string;
  goal: string;
  durationMinutes: number;
  language: 'he' | 'en';
}): string {
  // Get current date (Israel timezone) for daily uniqueness
  const now = new Date();
  const israelDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
  
  // Get time-of-day bucket (morning/afternoon/evening/night)
  const israelHour = parseInt(
    now.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Jerusalem', 
      hour: 'numeric', 
      hour12: false 
    })
  );
  
  let timeBucket: string;
  if (israelHour >= 5 && israelHour < 12) timeBucket = 'morning';
  else if (israelHour >= 12 && israelHour < 17) timeBucket = 'afternoon';
  else if (israelHour >= 17 && israelHour < 21) timeBucket = 'evening';
  else timeBucket = 'night';
  
  const goalHash = options.goal
    .toLowerCase()
    .replace(/\s+/g, '_')
    .substring(0, 30);
  
  // Include date and time bucket for daily/time-appropriate freshness
  return `${options.egoState}_${goalHash}_${options.durationMinutes}_${options.language}_${israelDate}_${timeBucket}`;
}
```

This ensures:
- Scripts are fresh each day
- Morning sessions are different from evening sessions
- The AI's time-aware content (morning energizing vs night relaxation) is properly cached

**2.2 Optionally: Add Bypass for "Fresh" Mode**
Add an optional parameter to force a fresh generation when the user wants something new, even within the same time window.

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/HypnosisModal.tsx` | Fix layout: remove extra padding, improve flex structure, add safe-area handling |
| `src/services/hypnosis.ts` | Update `generateCacheKey` to include date and time-of-day bucket |

### Layout Changes Detail (HypnosisModal.tsx)

**DialogContent:**
```diff
- className="max-w-2xl h-[85svh] max-h-[85svh] p-0 overflow-hidden bg-background"
+ className="max-w-2xl min-h-[60svh] max-h-[92svh] h-auto p-0 flex flex-col overflow-hidden bg-background"
```

**Generating State:**
```diff
- className="flex-1 flex flex-col items-center justify-center p-6 pt-10 space-y-6"
+ className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 space-y-4 sm:space-y-6"
```

**Playing State - Orb Area:**
```diff
- className="flex-shrink-0 flex items-center justify-center p-4 pt-8 sm:p-6 overflow-visible"
+ className="flex-shrink-0 flex items-center justify-center p-2 pt-4 sm:p-6 overflow-visible"
```

**Playing State - Controls:**
```diff
- className="flex-shrink-0 flex items-center justify-center gap-4 p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))]"
+ className="flex-shrink-0 flex items-center justify-center gap-4 p-3 sm:p-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
```

### Cache Key Change Detail (hypnosis.ts)

The new cache key format ensures:
1. **Daily Freshness:** Date component (`2026-02-05`) ensures new scripts each day
2. **Time Awareness:** Time bucket (`morning`, `afternoon`, `evening`, `night`) ensures appropriate tone
3. **Goal Specificity:** Still respects the goal/milestone for personalization

---

## Expected Outcomes

1. **Layout:** Full visibility of all content, orb, text, progress bar, and controls on all mobile devices
2. **Script Freshness:** Each day generates a fresh script; morning and evening sessions have different content
3. **Time Awareness:** The AI's time-appropriate suggestions (energizing morning vs relaxing evening) are properly cached per time bucket

---

## Testing Checklist

After implementation:
- [ ] Open modal on mobile - verify all elements visible
- [ ] Check "generating" state - orb and messages should not be clipped
- [ ] Check "playing" state - controls (play/pause, volume) fully visible
- [ ] Run a session in morning - verify morning-specific language
- [ ] Run another session same day evening - should be different script
- [ ] Run session next day - should generate fresh script even with same goal
