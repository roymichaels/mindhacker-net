
# Fix Aurora Hypnosis Modal - Gender, Pause, and Voice Issues

## Summary of Issues

Based on detailed code analysis, I've identified three distinct bugs:

### Issue 1: "את\אתה" Gender Addressing
**Root Cause**: The user's profile in the database doesn't have a `gender` field saved in `aurora_preferences`. The database shows only `intensity` and `tone` are stored. When the code reads the gender:
```typescript
const userGender = (profileRes.data?.aurora_preferences as { gender?: string } | null)?.gender || 'neutral';
```
It falls back to `'neutral'`, which causes the AI to use combined forms like "אתה/את מרגיש/ה".

**Solution**: 
1. Add default gender detection or prompt users to set their gender
2. Clear the script cache so new scripts are generated with correct gender

### Issue 2: Session Completing Too Fast on Pause
**Root Cause**: In `HypnosisModal.tsx`, when pause is clicked:
1. `stopCurrentAudio()` stops the audio
2. This triggers the audio's `onerror` callback
3. The error handler has: `setTimeout(() => playSegment(index + 1...)` 
4. Since `playingRef.current` is now `false`, the segment check fails, but the cascade can still cause issues
5. Additionally, segments that were prefetched might have pending promises that resolve and try to continue

**Solution**: Add a more robust stop mechanism and clear pending timeouts

### Issue 3: Voice Continues After Session Complete
**Root Cause**: In `handleSessionComplete()` (line 267-291), the function sets `playingRef.current = false` but **does NOT call `stopCurrentAudio()` or `stopBrowserSpeech()`**. The audio that was already playing continues to play.

**Solution**: Add explicit audio stop calls in `handleSessionComplete()`

---

## Implementation Plan

### File 1: `src/components/dashboard/HypnosisModal.tsx`

#### Fix 3A: Stop audio when session completes
```typescript
// Line 267-291: handleSessionComplete
const handleSessionComplete = useCallback(async () => {
  setState('complete');
  playingRef.current = false;
  
  // ADD: Stop any currently playing audio
  stopCurrentAudio();
  stopBrowserSpeech();
  
  impact('heavy');
  hapticPattern('success');
  // ... rest of function
}, [/* deps */]);
```

#### Fix 2A: Add abort controller for segment playback
Add a ref to track if we should abort pending operations:
```typescript
const abortControllerRef = useRef<AbortController | null>(null);
```

#### Fix 2B: Update togglePlayPause to cancel pending operations
```typescript
const togglePlayPause = () => {
  impact('medium');
  if (state === 'playing') {
    setState('paused');
    playingRef.current = false;
    
    // Cancel any pending segment callbacks
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    stopCurrentAudio();
    stopBrowserSpeech();
  } else if (state === 'paused' && scriptRef.current) {
    setState('playing');
    playingRef.current = true;
    abortControllerRef.current = new AbortController();
    playSegment(currentSegmentIndex, scriptRef.current);
  }
};
```

#### Fix 2C: Guard segment transitions more robustly
In `playSegment`, add early return checks:
```typescript
const playSegment = useCallback(async (index: number, ...) => {
  // ADD: Double-check we should still be playing
  if (!playingRef.current) {
    return; // Session was paused/stopped
  }
  // ... rest of function
```

And in the callbacks:
```typescript
onEnd: () => {
  // Check BEFORE scheduling next segment
  if (playingRef.current) {
    playSegment(index + 1, activeScript, activeCachedPaths);
  }
},
onError: () => {
  // Only continue if still playing
  if (playingRef.current) {
    setTimeout(() => {
      if (playingRef.current) { // Double check
        playSegment(index + 1, activeScript, activeCachedPaths);
      }
    }, 500);
  }
},
```

### File 2: `supabase/functions/generate-hypnosis-script/index.ts`

#### Fix 1A: Improve neutral gender handling
The current neutral instruction is:
```typescript
hebrewGrammarInstruction = `CRITICAL HEBREW GRAMMAR: Use NEUTRAL or inclusive Hebrew addressing. 
Prefer forms that work for all genders like: "מרגישים", "נושמים", or use second person with both options: "אתה/את מרגיש/ה".`;
```

**Change to more natural default (masculine as Hebrew default):**
```typescript
} else {
  // Default to masculine in Hebrew (grammatical convention) when no preference set
  hebrewGrammarInstruction = `CRITICAL HEBREW GRAMMAR: The user hasn't set a gender preference. 
Use MASCULINE singular forms as the default Hebrew convention (לשון זכר יחיד).
Use forms like: "אתה מרגיש", "אתה נושם", "תן לעצמך", "הרגש את", "אתה יכול".
Do NOT mix forms like "אתה/את" - pick one consistent form.`;
}
```

---

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/dashboard/HypnosisModal.tsx` | **Modify** | Add `stopCurrentAudio()` to `handleSessionComplete`, improve pause/play guards |
| `supabase/functions/generate-hypnosis-script/index.ts` | **Modify** | Change neutral gender default to masculine (Hebrew convention) |

---

## Technical Details

### Why the Pause Issue Happens
The current flow when clicking pause:
1. `togglePlayPause()` sets `playingRef.current = false`
2. `stopCurrentAudio()` is called, which pauses the audio element
3. Audio's `pause()` doesn't trigger `onended`, but if audio fails to stop cleanly, `onerror` might fire
4. Error callbacks have delayed `playSegment` calls that can still execute
5. If segment finishes loading async and the callback runs, it might skip to completion

### Why Voice Continues
When `handleSessionComplete()` is called:
1. `playingRef.current = false` is set
2. BUT the currently playing `HTMLAudioElement` is NOT stopped
3. The audio continues playing until it naturally ends
4. Since the modal shows "Session Complete!", user expects silence

### Cache Consideration
Existing cached scripts will still have the "את/אתה" issue until:
1. Cache expires naturally
2. Users re-run with different parameters (creating new cache key)
3. Or we clear the cache for affected users

---

## Testing Checklist

After implementing:
1. Set gender preference in Aurora settings → Start hypnosis → Verify correct gender forms used
2. Start session → Click pause mid-segment → Verify audio stops immediately
3. Wait a few seconds while paused → Resume → Verify session continues correctly
4. Complete a session → Verify audio stops when "Session Complete!" appears
5. Close modal during playback → Verify all audio stops
