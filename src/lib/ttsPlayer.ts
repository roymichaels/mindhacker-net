/**
 * ttsPlayer — Shared TTS playback engine used by Aurora chat, voice mode, and lessons.
 * Handles chunking, nikud stripping, ElevenLabs calls, and browser fallback.
 */

/** Strip Hebrew nikud (vowel marks) to reduce character count for TTS */
function stripNikud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '');
}

/** Strip markdown formatting */
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/[-*]\s/g, '');
}

/** Split text into chunks at sentence boundaries */
function splitTextIntoChunks(text: string, maxLen = 800): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    let splitAt = -1;
    const searchWindow = remaining.substring(0, maxLen);
    for (let i = searchWindow.length - 1; i >= Math.floor(maxLen * 0.5); i--) {
      const ch = searchWindow[i];
      if (ch === '.' || ch === '?' || ch === '!' || ch === '\n') {
        splitAt = i + 1;
        break;
      }
    }
    if (splitAt === -1) splitAt = maxLen;

    chunks.push(remaining.substring(0, splitAt).trim());
    remaining = remaining.substring(splitAt).trim();
  }

  return chunks.filter(c => c.length > 0);
}

export interface TTSPlayOptions {
  voiceId?: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  signal?: AbortSignal;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
}

/** Fetch and play a single chunk via ElevenLabs. Returns audio element or null on failure. */
async function playChunk(
  text: string,
  voiceId: string,
  speed: number,
  signal?: AbortSignal,
  stability?: number,
  similarityBoost?: number,
  style?: number,
): Promise<{ audio: HTMLAudioElement; url: string } | null> {
  const payload: Record<string, unknown> = { text, voiceId, speed };
  if (stability !== undefined) payload.stability = stability;
  if (similarityBoost !== undefined) payload.similarityBoost = similarityBoost;
  if (style !== undefined) payload.style = style;

  // 35-second timeout for the fetch
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), 35000);

  const combinedSignal = (() => {
    const c = new AbortController();
    if (signal) signal.addEventListener('abort', () => c.abort());
    timeoutController.signal.addEventListener('abort', () => c.abort());
    if (signal?.aborted) c.abort();
    return c.signal;
  })();

  try {
    // Get real user session token for auth
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: combinedSignal,
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn('[TTS] Chunk fetch failed:', response.status, errData);
      if (errData.fallback) return null;
      throw new Error(`TTS failed: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('audio')) {
      console.warn('[TTS] Response was not audio:', contentType);
      return null;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    return { audio, url };
  } finally {
    clearTimeout(timeout);
  }
}

/** Wait for an Audio element to finish playing */
function waitForAudioEnd(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Audio playback error'));
    audio.play().catch(reject);
  });
}

/** Browser fallback TTS */
function speakWithBrowserFallback(text: string, speed: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('No speech synthesis'));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    // Detect Hebrew content and set language accordingly
    const hasHebrew = /[\u0590-\u05FF]/.test(text);
    utterance.lang = hasHebrew ? 'he-IL' : 'en-US';
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(hasHebrew ? 'he' : 'en'));
    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error('Browser TTS error'));
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Play text through ElevenLabs TTS with chunking, nikud stripping, and browser fallback.
 * Returns an abort function.
 */
export function playTTS(rawText: string, options: TTSPlayOptions = {}): { cancel: () => void } {
  const {
    voiceId = 'jessica',
    speed = 1.0,
    stability,
    similarityBoost,
    style,
    onStart,
    onEnd,
    onError,
  } = options;

  // Clean and prepare text
  const cleanText = stripNikud(stripMarkdown(rawText));
  if (!cleanText.trim()) {
    onEnd?.();
    return { cancel: () => {} };
  }

  const chunks = splitTextIntoChunks(cleanText);
  const controller = new AbortController();
  const signal = options.signal
    ? combineAbortSignals(options.signal, controller.signal)
    : controller.signal;

  let currentAudio: HTMLAudioElement | null = null;
  let cancelled = false;

  const run = async () => {
    let started = false;

    try {
      for (let i = 0; i < chunks.length; i++) {
        if (cancelled || signal.aborted) return;

        let result: { audio: HTMLAudioElement; url: string } | null = null;

        try {
          result = await playChunk(chunks[i], voiceId, speed, signal, stability, similarityBoost, style);
        } catch (err: any) {
          if (err.name === 'AbortError' || cancelled) return;
          // Retry once
          try {
            result = await playChunk(chunks[i], voiceId, speed, signal, stability, similarityBoost, style);
          } catch (retryErr: any) {
            if (retryErr.name === 'AbortError' || cancelled) return;
            result = null;
          }
        }

        if (!result) {
          // Fallback to browser for remaining chunks
          console.log('[TTS] Falling back to browser for remaining', chunks.length - i, 'chunks');
          if (!started) { onStart?.(); started = true; }
          const remainingText = chunks.slice(i).join('\n\n');
          try {
            await speakWithBrowserFallback(remainingText, speed);
          } catch { /* ignore browser fallback errors */ }
          onEnd?.();
          return;
        }

        if (!started) { onStart?.(); started = true; }
        currentAudio = result.audio;

        try {
          await waitForAudioEnd(result.audio);
        } finally {
          URL.revokeObjectURL(result.url);
          currentAudio = null;
        }
      }

      if (!cancelled) onEnd?.();
    } catch (err: any) {
      if (err.name === 'AbortError' || cancelled) return;
      console.warn('[TTS] playTTS error:', err);
      onError?.(err);
    }
  };

  run();

  return {
    cancel: () => {
      cancelled = true;
      controller.abort();
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      window.speechSynthesis?.cancel();
    },
  };
}

/** Combine two AbortSignals */
function combineAbortSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  a.addEventListener('abort', onAbort);
  b.addEventListener('abort', onAbort);
  if (a.aborted || b.aborted) controller.abort();
  return controller.signal;
}
