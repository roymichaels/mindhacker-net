
## Goal
Fix the remaining voice fallback issues where:
- Browser TTS says only “dash” and stops
- Session completes ~30 seconds / ~1 minute without real voice
- Karaoke starts even though voice effectively didn’t start (or only “dash” happened)

This is happening because the fallback TTS path is still receiving text that begins with markdown/bullets/separators (e.g. “- …”, “---”), and some browsers literally speak the bullet dash (“dash”) and then silently fail/stop. When that happens, our current logic can still reach `onEnd()` and mark the session complete.

---

## What I found in the code (current behavior)
### 1) We already normalize some dashes, but not bullet prefixes / markdown separators
In `src/components/dashboard/HypnosisModal.tsx` `sanitizeScriptForTTS()`:
- Replaces `–` and `—`, and replaces spaced ` - `.
- Does **not** remove:
  - bullet prefixes like `- ` at line start
  - markdown horizontal rules like `---`
  - “* ” bullets
  - numbered list prefixes like `1. `
So a script that contains markdown formatting can produce leading chunks like `-` or `---`.

In `src/services/voice.ts` `speakWithBrowser()`:
- Also normalizes `–` and `—` and `\s-\s`.
- But if the text contains bullet markers, the browser may speak “dash …” or even only “dash”.

### 2) Session completes because browser TTS can “end” quickly but still counts as success
Even with the “ended without starting” protections, the browser can:
- Fire `onstart`, speak “dash”, then `onend` almost immediately
- We treat that as a normal completion if chunks are done
- That triggers `HypnosisModal`’s `onEnd()` → `handleSessionComplete()`
So we need a “meaningful speech” check, not just “did onstart fire”.

---

## Implementation plan

### A) Strengthen text sanitization before ANY TTS attempt (HypnosisModal)
**File:** `src/components/dashboard/HypnosisModal.tsx`

Update `sanitizeScriptForTTS()` to remove markdown/list formatting that often causes “dash”:

1) Remove horizontal rules / separators:
- Lines that are only dashes, underscores, or asterisks:
  - `---`, `____`, `***`, etc.

2) Remove bullet/list prefixes at line starts:
- `- `, `– `, `— `, `• `, `* `
- Also numbered lists: `1. `, `2) `, etc.

3) Normalize remaining hyphen-minus characters more broadly:
- Replace hyphen-minus `-` when used as punctuation (especially around spaces) into `, `
- Remove repeated hyphens `--` or `---` inside lines

4) Hard guard: if sanitized text becomes too short (e.g. < 50 chars or < 10 words), fall back to a less aggressive sanitization (so we don’t accidentally strip the script down to almost nothing).

**Outcome:** the text sent to OpenAI/Browser fallback starts with real words, not “-” or “---”.

---

### B) Make browser TTS reject “dash-only” / non-meaningful speech (voice.ts)
**File:** `src/services/voice.ts`

Add additional reliability checks in `speakWithBrowser()`:

1) Pre-sanitize again (defensive), specifically stripping bullet prefixes and separators even if caller forgot:
- This keeps behavior consistent across the app (not only HypnosisModal).

2) Detect “meaningless” chunks:
- If the chunk text (after trimming) is:
  - empty
  - only punctuation
  - or equals “dash” / “hyphen” (case-insensitive)
  then skip it and move to the next chunk without speaking it.

3) Add a “minimum real speech time” heuristic:
- Track `firstStartAt` and count `spokenCharacters` (sum of chunk lengths that actually started).
- If the entire run ends with:
  - `spokenCharacters < N` (e.g. < 80 chars), or
  - total speaking time < 2 seconds,
  then call `options.onError(...)` instead of `onEnd()`.

**Outcome:** if the browser only says “dash” and stops, we will treat it as a failure, not a successful completion.

---

### C) Ensure HypnosisModal never completes the session on “voice failed” (already mostly done, but tighten)
**File:** `src/components/dashboard/HypnosisModal.tsx`

Right now `onError` inside `playAudioUrl()` triggers `startMutedFallback()`, which is good. The problem is: if browser TTS ends quickly but does not error, we still complete.

So we’ll:
1) Add a guard in the `onEnd` passed to `playAudioUrl()` when the provider is `browser`:
- If `elapsedTime < min(30s, estimatedDuration * 0.2)` or `audioProgress < 0.2`, treat it as suspicious end and trigger muted fallback instead of completing.

2) Track “voice produced meaningful progress”:
- Set a ref like `hadMeaningfulAudioRef` once we pass, say, 5 seconds or 10% progress.
- If `onEnd` happens and `hadMeaningfulAudioRef` is false → `startMutedFallback()`.

**Outcome:** even if the browser reports a clean “end” after saying “dash”, the session will not complete; it will switch to reading mode.

---

### D) Verify the ElevenLabs quota error doesn’t crash the app UI
You reported:
- “Runtime error / blank screen”
- Edge function returned 402 with `{ fallback: true }`

We’ll confirm:
- The client is not treating the 402 as a fatal error (it should just fall back).
- If there’s any uncaught exception in the ElevenLabs edge function response parsing path (e.g., trying to parse audio as JSON), we’ll patch client error handling to always `.json().catch(() => ({}))` for non-ok responses (already done in `tryElevenLabsTTS`, but we’ll check any other call-sites).

If needed, we’ll add a small UI-safe error boundary behavior (toast + fallback) so “quota exceeded” never produces a blank screen.

---

## How we’ll test (end-to-end)
1) Trigger a hypnosis session with ElevenLabs quota exceeded (so it must fall back).
2) Confirm browser TTS does not say “dash” first; it should start with real words.
3) If browser TTS still fails on the device, confirm:
   - It switches to “Reading mode” (muted fallback)
   - The session does not complete early
   - Karaoke progresses smoothly for the full estimated duration
4) Repeat on:
   - Desktop Chrome
   - iOS Safari (common speechSynthesis quirks)
   - Android Chrome (voice loading quirks)

---

## Files to change
- `src/components/dashboard/HypnosisModal.tsx`
  - stronger `sanitizeScriptForTTS`
  - treat suspicious early browser-TTS end as failure → muted fallback
  - track “meaningful audio started” before allowing completion
- `src/services/voice.ts`
  - strip bullets/separators defensively
  - skip punctuation-only chunks
  - treat “dash-only / too-short speech” as `onError` (not success)

---

## Notes / tradeoffs
- This approach does not try to “make browser TTS Hebrew perfect” (that’s device-dependent).
- It guarantees that when browser TTS is unreliable, the user experience remains stable:
  - no early completion
  - no karaoke racing
  - reading mode continues the session at hypnosis pace

