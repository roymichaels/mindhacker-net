
## What’s happening (root causes)

Based on the current code and your screenshot (showing **elapsed 11:43** but **total 0:02**), there are two separate failures that combine into the “karaoke finishes instantly + TTS only says 0400” behavior:

1) **Bad / corrupted audio duration is being treated as truth**
- In `HypnosisModal.tsx`, karaoke progress (`audioProgress`) is computed as:
  - `audioProgress = currentTime / audioDuration`
- If `audioDuration` is **wrongly tiny** (like ~2 seconds), then `currentTime / audioDuration` becomes huge almost immediately, and karaoke highlights the entire script in ~1 second.

2) **Cached audio can be “valid enough to play” but still wrong**
- The flow tries cached audio first (`cachedUrl → signedUrl → playAudioUrl()`).
- If the cached MP3 is malformed/too short (or is not actually an MP3 even if it has the extension), the browser may still “play” it and report a tiny duration, and it ends quickly without triggering an error.
- That produces:
  - “session completes quickly”
  - karaoke jumps to the end
  - you hear only the first thing that exists in that short audio (in your case it’s “0400”)

3) **WPM mismatch still exists in the modal**
- `src/services/voice.ts` was adjusted to 85 WPM, but `HypnosisModal.tsx` still calculates `calculatedDuration` using **130 WPM** in `playScript()`.
- This isn’t the main cause of “1-second over 100 words”, but it does cause instability and inconsistent timing.

4) “0400” is very likely a time token in the text or cached audio
- Even if the visible script looks fine, it only takes a hidden token like `04:00` (or a cached audio generated from a script version that included it) to produce the voice “0400”.
- The more important issue is that audio ends after that, which points strongly to “cached audio is short/invalid”, not just pronunciation.

---

## The fix (high-confidence approach)

### A) Make karaoke progress robust (never allow bad duration to blow it up)
In `src/components/dashboard/HypnosisModal.tsx`:

1. **Clamp** karaoke progress:
   - `setAudioProgress(clamp(currentTime / audioDuration, 0, 1))`

2. **Ignore suspicious duration updates**
   Add guards so we only accept `audioDuration` if it’s sane:
   - must be `Number.isFinite(audioDuration)`
   - must be `audioDuration >= 30` seconds (or another threshold like 20s)
   - must not be wildly smaller than the word-count estimate (e.g. `< estimated * 0.3`)
   - must not be wildly larger (e.g. `> estimated * 2.5`)

3. **Do not overwrite `estimatedDuration` from audioDuration unless it passes the sanity check**
   - Right now, `handleTimeUpdate()` can replace `estimatedDuration` with whatever it gets.
   - We’ll only update it when the duration looks real.

Result: even if the audio element reports `0:02`, karaoke won’t instantly finish.

---

### B) Detect and bypass bad cached audio automatically
Still in `HypnosisModal.tsx`, when using cached audio:

1. Call `playAudioUrl(signedUrl, ...)` but track the first “real duration” we see.
2. If within the first ~1–2 seconds we observe:
   - `duration < 30s` (or `< estimatedDuration * 0.3`)
   - OR progress jumps near 1 immediately
   - OR playback ends too early
   Then:
   - Stop playback
   - Immediately fallback to `synthesizeAndPlay()` (browser TTS or provider)
   - Optionally mark the cached audio as “bad” for this session so we don’t retry it again.

This prevents old broken cache entries from poisoning the experience.

---

### C) Align WPM everywhere to the hypnosis pace (85 WPM)
In `HypnosisModal.tsx`:

- Change:
  - `calculatedDuration = (wordCount / 130) * 60`
  to:
  - `calculatedDuration = (wordCount / 85) * 60`

Also fix muted simulation:
- Change `wordsPerMinute = 130` to `85` so muted mode timing matches.

---

### D) Sanitize the script before sending to TTS (prevents “04:00” being spoken)
Before calling `synthesizeSpeech(text, ...)`, normalize the script:

- Remove leading timecodes and inline time markers:
  - beginning of script: `^\s*\d{1,2}:\d{2}\s*`
  - bracketed: `[\(\[]?\d{1,2}:\d{2}[\)\]]?`
- Remove “metadata-ish” lines if any slip in (defensive):
  - lines starting with `CURRENT TIME:` / `DAY:` / etc. (English/Hebrew variants if needed)

This is a defensive fix; even if the current visible script looks OK, it ensures time tokens don’t cause weird speech output.

---

### E) Make browser TTS progress calculation independent of chunk boundaries (optional but recommended)
In `src/services/voice.ts` (`speakWithBrowser`):

Current behavior uses a chunk-based interval that starts once and does not restart cleanly per chunk, which can cause inaccurate progress behavior in long texts.

We’ll adjust it to:
- Track an overall `sessionStartTime`
- Compute progress by overall elapsed vs overall estimated total duration
- Still speak by chunks, but progress is time-based globally, not per chunk

This makes karaoke progress stable and predictable when using browser TTS.

---

## How we’ll verify (fast, concrete checks)

1. Open hypnosis modal and start a session.
2. Confirm the **total duration** shown at bottom-right is no longer “0:02”.
3. Confirm karaoke does not race ahead (100+ words should take well over a minute at hypnosis pace).
4. Force cached audio path:
   - If a cached file is bad, we should see fallback to synthesis automatically (and not “complete in seconds”).
5. Confirm “0400” no longer happens:
   - If it still happens, we’ll log the *first 200 characters* of the exact text sent to TTS (in dev console) to confirm whether `04:00` exists in the payload.

---

## Files we will change

1. `src/components/dashboard/HypnosisModal.tsx`
   - Fix WPM (130 → 85)
   - Add duration sanity checks
   - Clamp karaoke progress
   - Auto-bypass bad cached audio
   - Sanitize text before TTS

2. `src/services/voice.ts`
   - Improve browser TTS progress algorithm to be global/time-based (more reliable)
   - (Keep existing 85 WPM baseline)

---

## Notes / expected outcome

- Even if ElevenLabs quota is exceeded and we’re using Browser TTS, karaoke will remain smooth and correctly paced.
- Even if there is a corrupted cached MP3 in storage, the app will detect it and fall back automatically instead of “highlighting everything instantly”.

