
# Hypnosis Modal Timing & Audio - Comprehensive Audit and Fix Plan

## Executive Summary
After thoroughly reviewing the hypnosis modal implementation, I've identified several areas that could cause timing issues, audio leaks, and race conditions. This plan addresses all of them to create a bulletproof hypnosis player.

## Current Issues Identified

### 1. **Timer Not Reacting to voiceStartedRef Changes**
The progress timer useEffect only depends on `[state, duration]`, but it checks `voiceStartedRef.current` inside. When `voiceStartedRef` changes from false to true, the effect doesn't re-run, meaning the timer may not start immediately when the voice begins.

### 2. **Missing Timeout Cleanup**
The `playSegment` function uses `setTimeout` for:
- Reading time in muted mode (lines 403-408, 501-507)
- Error recovery delays (lines 510-514)

These timeouts are NOT tracked and cannot be cancelled when the modal closes, which could cause audio to continue playing after exit.

### 3. **Potential Race Condition in Prefetch Logic**
When resuming from pause, `currentPlayingSegmentRef.current` is set to `currentSegmentIndex - 1`, but if prefetched audio exists for a different segment, there could be confusion.

### 4. **Multiple playingRef.current = true Statements**
The flag is set in multiple places which could cause confusion:
- Line 196 (startBreathing)
- Line 205 (handleStartSession)
- Line 230 (cached script)
- Line 268 (generated script)
- Line 527 (togglePlayPause resume)

### 5. **Audio Playback Promise Not Cancelled**
When `stopCurrentAudio()` is called, ongoing `playAudioUrl()` promises continue to execute their `onEnd` callbacks, potentially triggering the next segment even after the modal is closed.

### 6. **voiceStartedRef Never Triggers Timer Re-evaluation**
Since the timer effect depends on `[state, duration]` but reads from `voiceStartedRef.current`, when voice actually starts (setting voiceStartedRef to true), the timer interval isn't immediately created.

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     HYPNOSIS MODAL STATE MACHINE                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────┐    ┌────────────┐    ┌──────────┐    ┌─────────┐        │
│   │setup │───▶│ generating │───▶│ playing  │───▶│complete │        │
│   └──────┘    └────────────┘    └────┬─────┘    └─────────┘        │
│                                      │   ▲                          │
│                                      ▼   │                          │
│                                  ┌────────┐                         │
│                                  │ paused │                         │
│                                  └────────┘                         │
│                                                                     │
│   ANY STATE ──────────────── [close modal] ─────────▶ FULL CLEANUP  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        CLEANUP RESPONSIBILITIES                     │
├─────────────────────────────────────────────────────────────────────┤
│  1. Set playingRef.current = false                                  │
│  2. Clear ALL scheduled timeouts (new timeoutRefs tracking)         │
│  3. Stop all audio elements (stopCurrentAudio)                      │
│  4. Stop browser speech synthesis (stopBrowserSpeech)               │
│  5. Abort any pending fetch/synthesis requests                      │
│  6. Reset all refs to initial state                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Add Timeout Tracking System
Create a ref to track all scheduled timeouts so they can be cancelled on cleanup.

**Changes to HypnosisModal.tsx:**
- Add `timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set())`
- Create helper functions: `scheduleTimeout(fn, delay)` and `clearAllTimeouts()`
- Replace all `setTimeout` calls with `scheduleTimeout`
- Call `clearAllTimeouts()` in all cleanup locations

### Phase 2: Fix Timer Re-evaluation Issue
The progress timer needs to react when voice actually starts.

**Changes:**
- Add a state variable `voiceStarted` (not just ref) to trigger re-renders
- Update the timer useEffect to depend on this state
- Set both the ref (for immediate checks) and state (for effect re-trigger)

### Phase 3: Add Abort Controller for Async Operations
Prevent synthesis and fetch operations from completing after modal close.

**Changes:**
- Add `abortControllerRef = useRef<AbortController | null>(null)`
- Pass abort signal to fetch operations
- Abort on cleanup

### Phase 4: Consolidate playingRef Management
Create a single function to manage the playing state consistently.

**Changes:**
- Create `setPlayingState(playing: boolean)` helper
- This function sets the ref, clears timeouts if stopping, and handles all side effects
- Replace all direct `playingRef.current = X` assignments

### Phase 5: Guard Against Stale Closure Callbacks
The `onEnd` and `onError` callbacks in `playAudioUrl` can fire after cleanup.

**Changes:**
- Add a `sessionIdRef` that increments on each new session
- Check session ID in all async callbacks before proceeding

### Phase 6: Cleanup Comprehensive Audit
Ensure ALL cleanup paths are covered:
- Modal close via X button
- Modal close via outside click
- Modal close via onOpenChange(false)
- Component unmount (route change)
- Session complete

## Detailed Code Changes

### New Refs and State
```typescript
// Timeout tracking
const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());

// Session ID for stale callback detection
const sessionIdRef = useRef<number>(0);

// State (not just ref) for timer reactivity
const [voiceStarted, setVoiceStarted] = useState(false);

// Abort controller for async operations
const abortControllerRef = useRef<AbortController | null>(null);
```

### Helper Functions
```typescript
const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
  const id = setTimeout(() => {
    timeoutRefs.current.delete(id);
    fn();
  }, delay);
  timeoutRefs.current.add(id);
  return id;
}, []);

const clearAllTimeouts = useCallback(() => {
  timeoutRefs.current.forEach(id => clearTimeout(id));
  timeoutRefs.current.clear();
}, []);

const fullCleanup = useCallback(() => {
  playingRef.current = false;
  clearAllTimeouts();
  stopCurrentAudio();
  stopBrowserSpeech();
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
}, [clearAllTimeouts]);
```

### Updated Timer Effect
```typescript
useEffect(() => {
  if (state !== 'playing') return;
  if (!voiceStarted) return; // Now reacts to state change
  
  const interval = setInterval(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    setElapsedTime(elapsed);
    const totalSeconds = duration * 60;
    setProgress(Math.min((elapsed / totalSeconds) * 100, 100));
  }, 100);

  return () => clearInterval(interval);
}, [state, duration, voiceStarted]); // Added voiceStarted dependency
```

### Updated markVoiceStarted
```typescript
const markVoiceStarted = () => {
  if (!voiceStartedRef.current) {
    voiceStartedRef.current = true;
    setVoiceStarted(true); // Trigger state update for timer
    startTimeRef.current = Date.now();
  }
};
```

### Protected Callbacks in playSegment
```typescript
const currentSessionId = sessionIdRef.current;

await playAudioUrl(url, {
  onStart: markVoiceStarted,
  onEnd: () => {
    // Guard against stale callbacks
    if (sessionIdRef.current !== currentSessionId) return;
    if (playingRef.current) {
      playSegment(index + 1, activeScript, activeCachedPaths);
    }
  },
  onError: () => {
    if (sessionIdRef.current !== currentSessionId) return;
    if (playingRef.current) {
      scheduleTimeout(() => {
        if (playingRef.current && sessionIdRef.current === currentSessionId) {
          playSegment(index + 1, activeScript, activeCachedPaths);
        }
      }, 500);
    }
  },
});
```

### Updated Cleanup on Modal Close
```typescript
useEffect(() => {
  if (!open) {
    sessionIdRef.current++; // Invalidate all pending callbacks
    fullCleanup();
    
    // Reset all state
    setState('setup');
    setVoiceStarted(false);
    // ... rest of resets
  }
}, [open, fullCleanup]);
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/HypnosisModal.tsx` | Add timeout tracking, session ID, abort controller, consolidated cleanup |
| `src/services/voice.ts` | Add optional AbortSignal support to synthesizeSpeech and playAudioUrl |

## Testing Scenarios

After implementation, these scenarios should be verified:

1. **Close during generation** - Audio should NOT play
2. **Close during playback** - Audio stops immediately, no residual sound
3. **Close and reopen quickly** - Previous session doesn't interfere
4. **Pause and close** - No audio after close
5. **Complete session** - XP awarded, no errors
6. **Progress timer accuracy** - Timer starts when voice starts, not before
7. **Resume from pause** - Continues from correct segment
8. **Muted mode timing** - Reading time works correctly without audio
9. **Network error recovery** - Graceful fallback, no stuck states
10. **Route change during session** - Full cleanup, no audio leaks

## Technical Considerations

### Why Session ID Instead of Just playingRef?
The `playingRef.current = false` happens synchronously, but JavaScript's event loop may have already queued the `onEnd` callback. By using a session ID that increments on cleanup, we can detect stale callbacks that were scheduled before cleanup.

### Why Both Ref and State for voiceStarted?
- **Ref**: For immediate synchronous checks in callbacks
- **State**: To trigger React's effect system and re-render the timer

### Timeout vs AbortController
- **Timeouts**: For delays in playSegment error recovery
- **AbortController**: For cancelling in-flight network requests to TTS services

This comprehensive overhaul will make the hypnosis modal timing bulletproof and eliminate all audio leaks.
