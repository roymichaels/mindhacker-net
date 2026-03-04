/**
 * useLessonTTS — Plays lesson content aloud via ElevenLabs TTS.
 * Splits long text into chunks and plays them sequentially.
 */
import { useState, useRef, useCallback } from 'react';

interface UseLessonTTSOptions {
  voice?: string;
  speed?: number;
}

const hebrewNumbers: Record<number, string> = {
  1: 'אֶחָד', 2: 'שְׁנַיִם', 3: 'שְׁלוֹשָׁה', 4: 'אַרְבָּעָה', 5: 'חֲמִשָּׁה',
  6: 'שִׁשָּׁה', 7: 'שִׁבְעָה', 8: 'שְׁמוֹنָה', 9: 'תִּשְׁעָה', 10: 'עֲשָׂרָה',
  11: 'אַחַד עָשָׂר', 12: 'שְׁנֵים עָשָׂר', 13: 'שְׁלוֹשָׁה עָשָׂר',
  14: 'אַרְבָּעָה עָשָׂר', 15: 'חֲמִשָּׁה עָשָׂר', 16: 'שִׁשָּׁה עָשָׂר',
  17: 'שִׁבְעָה עָשָׂר', 18: 'שְׁמוֹנָה עָשָׂר', 19: 'תִּשְׁעָה עָשָׂר', 20: 'עֶשְׂרִים',
};

function numToHebrew(n: number): string {
  return hebrewNumbers[n] || String(n);
}

const hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];

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

/** Strip Hebrew nikud (vowel marks) to reduce character count for TTS */
function stripNikud(text: string): string {
  // Hebrew nikud range: U+0591–U+05C7
  return text.replace(/[\u0591-\u05C7]/g, '');
}

function extractText(lesson: { lesson_type: string; title: string; content: any }): string {
  const parts: string[] = [lesson.title + '.'];

  switch (lesson.lesson_type) {
    case 'theory': {
      if (lesson.content?.body) {
        parts.push(stripMarkdown(lesson.content.body));
      }
      if (lesson.content?.key_concepts?.length) {
        parts.push('מוּשָׂגֵי מַפְתֵּחַ: ' + lesson.content.key_concepts.join('. ') + '.');
      }
      break;
    }
    case 'practice': {
      if (lesson.content?.instructions) {
        parts.push(stripMarkdown(lesson.content.instructions));
      }
      if (lesson.content?.exercises?.length) {
        lesson.content.exercises.forEach((ex: any, i: number) => {
          parts.push(`תִּרְגּוּל ${numToHebrew(i + 1)}: ${ex.title || ''}. ${ex.description || ''}`);
        });
      }
      break;
    }
    case 'quiz': {
      parts.push('בּוֹאוּ נִקְרָא אֶת שְׁאֵלוֹת הַבֹּחַן.');
      if (lesson.content?.questions?.length) {
        lesson.content.questions.forEach((q: any, i: number) => {
          const optionsStr = (q.options || [])
            .map((o: string, j: number) => `${hebrewLetters[j] || String(j + 1)}, ${o}`)
            .join('. ');
          parts.push(`שְׁאֵלָה ${numToHebrew(i + 1)}: ${q.q}. הָאֶפְשָׁרוּיוֹת הֵן: ${optionsStr}.`);
        });
      }
      break;
    }
    case 'project': {
      if (lesson.content?.brief) parts.push('תֵּאוּר הַפְּרוֹיֶקְט: ' + lesson.content.brief);
      if (lesson.content?.requirements?.length) {
        parts.push('דְּרִישׁוֹת: ' + lesson.content.requirements.join('. ') + '.');
      }
      break;
    }
  }

  return parts.join('\n\n');
}

/** Split text into chunks of ~maxLen characters at sentence boundaries */
function splitTextIntoChunks(text: string, maxLen = 2000): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    // Find the last sentence-ending punctuation within maxLen
    let splitAt = -1;
    const searchWindow = remaining.substring(0, maxLen);
    
    // Look for sentence boundaries: period, newline, question mark, exclamation
    for (let i = searchWindow.length - 1; i >= Math.floor(maxLen * 0.5); i--) {
      const ch = searchWindow[i];
      if (ch === '.' || ch === '?' || ch === '!' || ch === '\n') {
        splitAt = i + 1;
        break;
      }
    }

    // If no good split point found, just split at maxLen
    if (splitAt === -1) splitAt = maxLen;

    chunks.push(remaining.substring(0, splitAt).trim());
    remaining = remaining.substring(splitAt).trim();
  }

  return chunks.filter(c => c.length > 0);
}

export function useLessonTTS(options: UseLessonTTSOptions = {}) {
  const { voice = 'sarah', speed = 1.0 } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const playingRef = useRef(false);

  const stop = useCallback(() => {
    playingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    abortRef.current?.abort();
    abortRef.current = null;
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  /** Fetch and play a single chunk. Returns a promise that resolves when done. */
  const playChunk = useCallback(async (
    text: string, 
    signal: AbortSignal,
  ): Promise<boolean> => {
    console.log('[TTS] Playing chunk:', { length: text.length });
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, voiceId: voice, speed }),
        signal,
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn('[TTS] Chunk fetch failed:', response.status, errData);
      if (errData.fallback) return false;
      throw new Error(`TTS failed: ${response.status}`);
    }

    const blob = await response.blob();
    console.log('[TTS] Chunk audio received:', { size: blob.size });
    const url = URL.createObjectURL(blob);
    
    return new Promise<boolean>((resolve, reject) => {
      if (!playingRef.current) {
        URL.revokeObjectURL(url);
        resolve(true);
        return;
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => { 
        console.log('[TTS] Audio playing');
        setIsPlaying(true); 
        setIsLoading(false); 
      };
      audio.onended = () => {
        console.log('[TTS] Audio chunk ended naturally');
        URL.revokeObjectURL(url);
        audioRef.current = null;
        resolve(true);
      };
      audio.onerror = (e) => {
        console.warn('[TTS] Audio element error:', e);
        URL.revokeObjectURL(url);
        audioRef.current = null;
        resolve(false);
      };

      audio.play().catch((err) => {
        console.warn('[TTS] play() rejected:', err);
        URL.revokeObjectURL(url);
        reject(err);
      });
    });
  }, [voice, speed]);

  const play = useCallback(async (lesson: { lesson_type: string; title: string; content: any }) => {
    if (isPlaying || isLoading) {
      stop();
      return;
    }

    const rawText = extractText(lesson);
    if (!rawText.trim()) return;

    // Strip nikud to reduce character count — TTS handles Hebrew fine without them
    const text = stripNikud(rawText);
    console.log('[TTS] Text prepared:', { rawLen: rawText.length, cleanLen: text.length });

    const chunks = splitTextIntoChunks(text);
    console.log('[TTS] Split into', chunks.length, 'chunks:', chunks.map(c => c.length));

    setIsLoading(true);
    playingRef.current = true;
    abortRef.current = new AbortController();

    try {
      for (let i = 0; i < chunks.length; i++) {
        if (!playingRef.current) break;

        const success = await playChunk(
          chunks[i],
          abortRef.current!.signal,
        );

        if (!success) {
          // Fallback: play remaining text with browser TTS
          const remainingText = chunks.slice(i).join('\n\n');
          speakWithBrowserFallback(remainingText, speed);
          return;
        }
      }

      // All chunks done
      if (playingRef.current) {
        playingRef.current = false;
        setIsPlaying(false);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('ElevenLabs TTS error, falling back to browser:', err);
      setIsLoading(false);
      const remainingText = text;
      speakWithBrowserFallback(remainingText, speed);
    }
  }, [isPlaying, isLoading, speed, stop, playChunk]);

  const speakWithBrowserFallback = useCallback((text: string, rate: number) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.onstart = () => { setIsPlaying(true); setIsLoading(false); };
    utterance.onend = () => { setIsPlaying(false); playingRef.current = false; };
    utterance.onerror = () => { setIsPlaying(false); playingRef.current = false; };
    window.speechSynthesis.speak(utterance);
  }, []);

  return { play, stop, isPlaying, isLoading };
}
