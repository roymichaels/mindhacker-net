/**
 * useLessonTTS — Plays lesson content aloud via ElevenLabs TTS.
 * Extracts readable text from lesson content based on type, 
 * then streams it through Aurora's voice.
 */
import { useState, useRef, useCallback } from 'react';

interface UseLessonTTSOptions {
  voice?: string;
  speed?: number;
}

const hebrewNumbers: Record<number, string> = {
  1: 'אֶחָד', 2: 'שְׁנַיִם', 3: 'שְׁלוֹשָׁה', 4: 'אַרְבָּעָה', 5: 'חֲמִשָּׁה',
  6: 'שִׁשָּׁה', 7: 'שִׁבְעָה', 8: 'שְׁמוֹנָה', 9: 'תִּשְׁעָה', 10: 'עֲשָׂרָה',
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

export function useLessonTTS(options: UseLessonTTSOptions = {}) {
  const { voice = 'sarah', speed = 1.0 } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    // Cancel browser TTS fallback if active
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    abortRef.current?.abort();
    abortRef.current = null;
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const play = useCallback(async (lesson: { lesson_type: string; title: string; content: any }) => {
    // If already playing, stop
    if (isPlaying || isLoading) {
      stop();
      return;
    }

    const text = extractText(lesson);
    if (!text.trim()) return;

    // Limit to 5000 chars for TTS
    const truncated = text.length > 5000 ? text.substring(0, 5000) : text;

    setIsLoading(true);
    abortRef.current = new AbortController();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: truncated, voiceId: voice, speed }),
          signal: abortRef.current.signal,
        }
      );

      if (!response.ok) {
        // Check for fallback/quota
        const errData = await response.json().catch(() => ({}));
        if (errData.fallback) {
          // Use browser TTS fallback
          speakWithBrowserFallback(truncated, speed);
          return;
        }
        throw new Error(`TTS failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onplay = () => { setIsPlaying(true); setIsLoading(false); };
      audio.onended = () => { stop(); };
      audio.onerror = () => { 
        stop();
        // fallback to browser
        speakWithBrowserFallback(truncated, speed);
      };
      
      await audio.play();
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('ElevenLabs TTS error, falling back to browser:', err);
      setIsLoading(false);
      speakWithBrowserFallback(truncated, speed);
    }
  }, [isPlaying, isLoading, voice, speed, stop]);

  const speakWithBrowserFallback = useCallback((text: string, rate: number) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.onstart = () => { setIsPlaying(true); setIsLoading(false); };
    utterance.onend = () => { setIsPlaying(false); };
    utterance.onerror = () => { setIsPlaying(false); };
    window.speechSynthesis.speak(utterance);
  }, []);

  return { play, stop, isPlaying, isLoading };
}
