import { supabase } from "@/integrations/supabase/client";

export type VoiceProvider = 'openai' | 'elevenlabs' | 'browser';
export type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
export type ElevenLabsVoice = 'sarah' | 'roger' | 'laura' | 'charlie' | 'matilda' | 'lily' | 'brian' | 'daniel';

export interface VoiceConfig {
  provider: VoiceProvider;
  voice: string;
  speed: number;
  name: string;
  description: string;
}

export const OPENAI_VOICES: VoiceConfig[] = [
  { provider: 'openai', voice: 'nova', speed: 0.9, name: 'Nova', description: 'Warm and calming female voice' },
  { provider: 'openai', voice: 'alloy', speed: 0.9, name: 'Alloy', description: 'Neutral and balanced' },
  { provider: 'openai', voice: 'echo', speed: 0.85, name: 'Echo', description: 'Deep and resonant male voice' },
  { provider: 'openai', voice: 'fable', speed: 0.9, name: 'Fable', description: 'Expressive British accent' },
  { provider: 'openai', voice: 'onyx', speed: 0.85, name: 'Onyx', description: 'Deep authoritative male voice' },
  { provider: 'openai', voice: 'shimmer', speed: 0.9, name: 'Shimmer', description: 'Gentle and soothing female voice' },
];

export const ELEVENLABS_VOICES: VoiceConfig[] = [
  { provider: 'elevenlabs', voice: 'sarah', speed: 1.0, name: 'Sarah', description: 'Warm, professional female voice' },
  { provider: 'elevenlabs', voice: 'laura', speed: 1.0, name: 'Laura', description: 'Calm, soothing female voice' },
  { provider: 'elevenlabs', voice: 'matilda', speed: 1.0, name: 'Matilda', description: 'Gentle, nurturing female voice' },
  { provider: 'elevenlabs', voice: 'lily', speed: 1.0, name: 'Lily', description: 'Soft, meditative female voice' },
  { provider: 'elevenlabs', voice: 'roger', speed: 1.0, name: 'Roger', description: 'Deep, authoritative male voice' },
  { provider: 'elevenlabs', voice: 'brian', speed: 1.0, name: 'Brian', description: 'Calm, reassuring male voice' },
  { provider: 'elevenlabs', voice: 'daniel', speed: 1.0, name: 'Daniel', description: 'Clear, guided male voice' },
];

export const ALL_VOICES: VoiceConfig[] = [...ELEVENLABS_VOICES, ...OPENAI_VOICES];

export const DEFAULT_VOICE: VoiceConfig = ELEVENLABS_VOICES[0]; // Sarah (ElevenLabs)

/**
 * Synthesize speech using the appropriate TTS provider
 * Falls back through: ElevenLabs → OpenAI → Browser
 */
export async function synthesizeSpeech(
  text: string,
  options: {
    provider?: VoiceProvider;
    voice?: string;
    speed?: number;
  } = {}
): Promise<{ audioUrl: string; usedFallback: boolean; provider: VoiceProvider } | null> {
  const { provider = 'elevenlabs', voice = 'sarah', speed = 1.0 } = options;

  // Try ElevenLabs first
  if (provider === 'elevenlabs' || provider === 'openai') {
    const result = await tryElevenLabsTTS(text, voice, speed);
    if (result) return result;

    // Fallback to OpenAI
    const openaiResult = await tryOpenAITTS(text, voice, speed);
    if (openaiResult) return openaiResult;
  }

  // Final fallback to browser
  return tryBrowserFallback(text, speed);
}

/**
 * Try ElevenLabs TTS
 */
async function tryElevenLabsTTS(
  text: string,
  voice: string,
  speed: number
): Promise<{ audioUrl: string; usedFallback: boolean; provider: VoiceProvider } | null> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, voiceId: voice, speed }),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.fallback) {
        console.warn('ElevenLabs signaled fallback');
        return null;
      }
      throw new Error(`ElevenLabs TTS failed: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('audio')) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return { audioUrl, usedFallback: false, provider: 'elevenlabs' };
    }

    // JSON response means fallback
    return null;

  } catch (error) {
    console.warn('ElevenLabs TTS error:', error);
    return null;
  }
}

/**
 * Try OpenAI TTS via Lovable Gateway
 */
async function tryOpenAITTS(
  text: string,
  voice: string,
  speed: number
): Promise<{ audioUrl: string; usedFallback: boolean; provider: VoiceProvider } | null> {
  try {
    // Map ElevenLabs voices to OpenAI equivalents
    const openaiVoice = mapToOpenAIVoice(voice);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, voice: openaiVoice, speed }),
      }
    );

    // Check for fallback signal first
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json().catch(() => ({}));
      if (data.fallback) {
        console.warn('OpenAI TTS signaled fallback');
        return null;
      }
    }

    if (!response.ok) {
      throw new Error(`OpenAI TTS failed: ${response.status}`);
    }

    if (contentType?.includes('audio')) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return { audioUrl, usedFallback: false, provider: 'openai' };
    }

    return null;

  } catch (error) {
    console.warn('OpenAI TTS error:', error);
    return null;
  }
}

/**
 * Map voice names to OpenAI voices
 */
function mapToOpenAIVoice(voice: string): OpenAIVoice {
  const voiceMap: Record<string, OpenAIVoice> = {
    // ElevenLabs female → OpenAI female
    'sarah': 'nova',
    'laura': 'shimmer',
    'matilda': 'nova',
    'lily': 'shimmer',
    // ElevenLabs male → OpenAI male
    'roger': 'onyx',
    'brian': 'echo',
    'daniel': 'alloy',
    'charlie': 'fable',
  };
  return voiceMap[voice.toLowerCase()] || (voice as OpenAIVoice) || 'nova';
}

/**
 * Try browser's built-in speech synthesis as fallback
 */
async function tryBrowserFallback(
  text: string, 
  speed: number
): Promise<{ audioUrl: string; usedFallback: boolean; provider: VoiceProvider } | null> {
  if (!('speechSynthesis' in window)) {
    console.warn('Browser speech synthesis not available');
    return null;
  }

  console.log('Using browser TTS fallback for', text.length, 'characters');
  
  // Browser TTS doesn't give us an audio URL
  // Return a special marker that the player should use speechSynthesis
  // Store the FULL text, not truncated
  return { 
    audioUrl: `browser-tts://${encodeURIComponent(text)}`, 
    usedFallback: true,
    provider: 'browser',
  };
}

/**
 * Play text using browser's speech synthesis directly
 * Handles long text by chunking into sentences
 */
export function speakWithBrowser(
  text: string,
  options: {
    rate?: number;
    onStart?: () => void;
    onProgress?: (progress: number) => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  } = {}
): { cancel: () => void } | null {
  if (!('speechSynthesis' in window)) {
    options.onError?.(new Error('Speech synthesis not supported'));
    return null;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  // For long texts, chunk into sentences for better reliability
  const chunks = text.length > 500 
    ? text.split(/(?<=[.!?])\s+/).filter(c => c.trim())
    : [text];
  
  let currentChunk = 0;
  let hasStarted = false;

  // Preload voices first
  const loadVoicesAndSpeak = () => {
    const voices = speechSynthesis.getVoices();
    
    const speakChunk = () => {
      if (currentChunk >= chunks.length) {
        options.onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
      utterance.rate = options.rate || 0.85;
      utterance.pitch = 1;

      // Try to find a suitable voice
      const hebrewVoice = voices.find(v => v.lang.startsWith('he'));
      const englishFemaleVoice = voices.find(v => 
        v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
      );
      
      utterance.voice = hebrewVoice || englishFemaleVoice || voices[0] || null;

      utterance.onstart = () => {
        if (!hasStarted) {
          hasStarted = true;
          options.onStart?.();
        }
      };

      utterance.onend = () => {
        currentChunk++;
        // Report progress
        options.onProgress?.(currentChunk / chunks.length);
        speakChunk();
      };
      
      utterance.onerror = (event) => {
        // Skip to next chunk on error
        console.warn('Browser TTS chunk error:', event.error);
        currentChunk++;
        if (currentChunk < chunks.length) {
          speakChunk();
        } else {
          options.onEnd?.();
        }
      };

      speechSynthesis.speak(utterance);
    };

    speakChunk();
  };

  // Some browsers need time to load voices
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    loadVoicesAndSpeak();
  } else {
    // Wait for voices to load
    speechSynthesis.onvoiceschanged = () => {
      loadVoicesAndSpeak();
    };
    // Fallback timeout
    setTimeout(() => {
      if (!hasStarted) {
        loadVoicesAndSpeak();
      }
    }, 500);
  }

  return {
    cancel: () => {
      speechSynthesis.cancel();
    }
  };
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

    speechSynthesis.onvoiceschanged = () => {
      resolve(speechSynthesis.getVoices());
    };

    setTimeout(() => resolve(speechSynthesis.getVoices()), 2000);
  });
}

/**
 * Create an audio player for TTS audio
 */
export function createTTSAudioPlayer(audioUrl: string): HTMLAudioElement {
  const audio = new Audio(audioUrl);
  audio.preload = 'auto';
  return audio;
}

// Track ALL active audio elements to ensure complete cleanup
const activeAudioElements: Set<HTMLAudioElement> = new Set();
let currentAudio: HTMLAudioElement | null = null;

/**
 * Stop any currently playing audio - stops ALL tracked audio elements
 */
export function stopCurrentAudio(): void {
  // Stop all tracked audio elements
  activeAudioElements.forEach(audio => {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audio.load(); // Force release
    } catch (e) {
      // Ignore errors on cleanup
    }
  });
  activeAudioElements.clear();
  
  // Also clear the legacy reference
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = '';
    } catch (e) {}
    currentAudio = null;
  }
  
  // Also stop browser speech
  stopBrowserSpeech();
}

/**
 * Play audio URL and return promise that resolves when complete
 * NOTE: Does NOT stop previous audio automatically - caller must handle this if needed
 */
export async function playAudioUrl(
  audioUrl: string,
  options: {
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {

    // Handle browser TTS URLs
    if (audioUrl.startsWith('browser-tts://')) {
      const text = decodeURIComponent(audioUrl.replace('browser-tts://', ''));
      
      // Calculate estimated duration based on word count (130 words per minute for slow hypnosis)
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = (wordCount / 130) * 60; // seconds
      let startTime = 0;
      
      speakWithBrowser(text, {
        rate: 0.85,
        onStart: () => {
          startTime = Date.now();
          options.onStart?.();
        },
        onProgress: (progress) => {
          // Calculate current time based on progress
          const currentTime = progress * estimatedDuration;
          options.onTimeUpdate?.(currentTime, estimatedDuration);
        },
        onEnd: () => {
          options.onEnd?.();
          resolve();
        },
        onError: (error) => {
          options.onError?.(error);
          reject(error);
        },
      });
      return;
    }

    const audio = new Audio(audioUrl);
    
    // Track this audio element
    activeAudioElements.add(audio);
    currentAudio = audio;
    
    const cleanup = () => {
      activeAudioElements.delete(audio);
      if (currentAudio === audio) {
        currentAudio = null;
      }
    };
    
    // Trigger onStart when audio actually starts playing
    audio.onplaying = () => {
      options.onStart?.();
    };
    
    audio.ontimeupdate = () => {
      options.onTimeUpdate?.(audio.currentTime, audio.duration);
    };
    
    audio.onended = () => {
      cleanup();
      options.onEnd?.();
      resolve();
    };
    
    audio.onerror = () => {
      cleanup();
      const error = new Error('Audio playback failed');
      options.onError?.(error);
      reject(error);
    };

    audio.play().catch((error) => {
      cleanup();
      options.onError?.(error);
      reject(error);
    });
  });
}
