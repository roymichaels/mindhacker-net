import { supabase } from "@/integrations/supabase/client";

export type VoiceId = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface VoiceConfig {
  voice: VoiceId;
  speed: number;
  name: string;
  description: string;
}

export const AVAILABLE_VOICES: VoiceConfig[] = [
  { voice: 'nova', speed: 0.9, name: 'Nova', description: 'Warm and calming female voice' },
  { voice: 'alloy', speed: 0.9, name: 'Alloy', description: 'Neutral and balanced' },
  { voice: 'echo', speed: 0.85, name: 'Echo', description: 'Deep and resonant male voice' },
  { voice: 'fable', speed: 0.9, name: 'Fable', description: 'Expressive British accent' },
  { voice: 'onyx', speed: 0.85, name: 'Onyx', description: 'Deep authoritative male voice' },
  { voice: 'shimmer', speed: 0.9, name: 'Shimmer', description: 'Gentle and soothing female voice' },
];

export const DEFAULT_VOICE: VoiceConfig = AVAILABLE_VOICES[0]; // Nova

/**
 * Synthesize speech from text using the TTS edge function
 * Falls back to browser TTS if the API fails
 */
export async function synthesizeSpeech(
  text: string,
  options: {
    voice?: VoiceId;
    speed?: number;
  } = {}
): Promise<{ audioUrl: string; usedFallback: boolean } | null> {
  const { voice = 'nova', speed = 0.9 } = options;

  try {
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { text, voice, speed },
    });

    if (error) {
      console.warn('TTS API error, will try fallback:', error);
      return tryBrowserFallback(text, speed);
    }

    // The response should be audio data
    if (data instanceof ArrayBuffer || data instanceof Blob) {
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      return { audioUrl, usedFallback: false };
    }

    // Check if API signaled to use fallback
    if (data?.fallback) {
      return tryBrowserFallback(text, speed);
    }

    console.warn('Unexpected TTS response format');
    return tryBrowserFallback(text, speed);

  } catch (error) {
    console.error('TTS synthesis failed:', error);
    return tryBrowserFallback(text, speed);
  }
}

/**
 * Try browser's built-in speech synthesis as fallback
 */
async function tryBrowserFallback(
  text: string, 
  speed: number
): Promise<{ audioUrl: string; usedFallback: boolean } | null> {
  if (!('speechSynthesis' in window)) {
    console.warn('Browser speech synthesis not available');
    return null;
  }

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.pitch = 1;
    
    // Try to find a good Hebrew or English voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('he') || 
      (v.lang.startsWith('en') && v.name.includes('Female'))
    ) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Browser TTS doesn't give us an audio URL, so we'll handle it differently
    // Return a special marker that the player should use speechSynthesis
    resolve({ 
      audioUrl: `browser-tts://${encodeURIComponent(text.substring(0, 100))}`, 
      usedFallback: true 
    });
  });
}

/**
 * Play text using browser's speech synthesis directly
 */
export function speakWithBrowser(
  text: string,
  options: {
    rate?: number;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  } = {}
): SpeechSynthesisUtterance | null {
  if (!('speechSynthesis' in window)) {
    options.onError?.(new Error('Speech synthesis not supported'));
    return null;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 0.9;
  utterance.pitch = 1;

  // Try to find a suitable voice
  const voices = speechSynthesis.getVoices();
  const hebrewVoice = voices.find(v => v.lang.startsWith('he'));
  const englishFemaleVoice = voices.find(v => 
    v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
  );
  
  utterance.voice = hebrewVoice || englishFemaleVoice || voices[0] || null;

  utterance.onend = () => options.onEnd?.();
  utterance.onerror = (event) => options.onError?.(new Error(event.error));

  speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Stop any ongoing browser speech
 */
export function stopBrowserSpeech(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

/**
 * Check if browser TTS is available
 */
export function isBrowserTTSAvailable(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * Preload voices (some browsers need this)
 */
export function preloadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voices to load
    speechSynthesis.onvoiceschanged = () => {
      resolve(speechSynthesis.getVoices());
    };

    // Timeout after 2 seconds
    setTimeout(() => resolve(speechSynthesis.getVoices()), 2000);
  });
}
