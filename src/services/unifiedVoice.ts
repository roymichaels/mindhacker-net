/**
 * Unified Voice Service
 * Consolidates all TTS/STT functionality across Aurora, Hypnosis, and Chat
 */

// ===== Types =====

export type VoiceContext = 'aurora' | 'hypnosis' | 'chat';
export type VoiceProvider = 'elevenlabs' | 'openai' | 'browser';

export interface VoiceConfig {
  voiceId: string;
  name: string;
  speed: number;
  provider: VoiceProvider;
  description: string;
}

export interface TTSResult {
  audioUrl: string;
  provider: VoiceProvider;
  usedFallback: boolean;
}

// ===== Voice Configurations =====

// ElevenLabs Voice IDs
const ELEVENLABS_VOICES = {
  jessica: 'cgSgspJ2msm6clMCkdW9', // Aurora - warm, conversational
  sarah: 'EXAVITQu4vr4xnSDxMaL',   // Hypnosis - calm, soothing
  laura: 'FGY2WhTYpPnrIDTdsKH5',   // Alternative for variety
  lily: 'pFZP5JQG7iQjIQuC4Bku',    // Soft, meditative
};

// Context-specific voice configurations
const VOICE_CONFIGS: Record<VoiceContext, VoiceConfig> = {
  aurora: {
    voiceId: ELEVENLABS_VOICES.jessica,
    name: 'Jessica',
    speed: 1.0,
    provider: 'elevenlabs',
    description: 'Warm, conversational voice for life coaching',
  },
  hypnosis: {
    voiceId: ELEVENLABS_VOICES.sarah,
    name: 'Sarah',
    speed: 0.9,
    provider: 'elevenlabs',
    description: 'Calm, soothing voice for hypnotherapy',
  },
  chat: {
    voiceId: ELEVENLABS_VOICES.jessica,
    name: 'Jessica',
    speed: 1.0,
    provider: 'browser', // Default to browser for chat widget
    description: 'Quick responses for chat widget',
  },
};

// ===== Core TTS Function =====

export async function speak(
  text: string,
  context: VoiceContext = 'aurora',
  options?: {
    speed?: number;
    useElevenLabs?: boolean;
  }
): Promise<TTSResult | null> {
  const config = VOICE_CONFIGS[context];
  const speed = options?.speed ?? config.speed;
  const useElevenLabs = options?.useElevenLabs ?? (config.provider === 'elevenlabs');

  // Try ElevenLabs first if preferred
  if (useElevenLabs) {
    const result = await tryElevenLabsTTS(text, config.voiceId, speed);
    if (result) return result;
  }

  // Fallback to browser TTS
  return tryBrowserTTS(text, speed);
}

// ===== ElevenLabs TTS =====

async function tryElevenLabsTTS(
  text: string,
  voiceId: string,
  speed: number
): Promise<TTSResult | null> {
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
        body: JSON.stringify({ text, voiceId, speed }),
      }
    );

    if (!response.ok) {
      console.warn('ElevenLabs TTS failed:', response.status);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('audio')) {
      console.warn('ElevenLabs returned non-audio response');
      return null;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      audioUrl,
      provider: 'elevenlabs',
      usedFallback: false,
    };
  } catch (error) {
    console.warn('ElevenLabs TTS error:', error);
    return null;
  }
}

// ===== Browser TTS =====

function tryBrowserTTS(text: string, speed: number): TTSResult | null {
  if (!('speechSynthesis' in window)) {
    console.warn('Browser speech synthesis not available');
    return null;
  }

  // Return a special marker that indicates browser TTS
  return {
    audioUrl: `browser-tts://${encodeURIComponent(text.substring(0, 100))}`,
    provider: 'browser',
    usedFallback: true,
  };
}

// ===== Playback Functions =====

let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export async function playAudio(
  result: TTSResult,
  options?: {
    onEnd?: () => void;
    onError?: (error: Error) => void;
    onProgress?: (current: number, total: number) => void;
  }
): Promise<void> {
  // Stop any current playback
  stopPlayback();

  if (result.audioUrl.startsWith('browser-tts://')) {
    // Browser TTS
    const text = decodeURIComponent(result.audioUrl.replace('browser-tts://', ''));
    return playBrowserTTS(text, options);
  }

  // Audio file playback
  return new Promise((resolve, reject) => {
    const audio = new Audio(result.audioUrl);
    currentAudio = audio;

    audio.ontimeupdate = () => {
      options?.onProgress?.(audio.currentTime, audio.duration || 0);
    };

    audio.onended = () => {
      currentAudio = null;
      URL.revokeObjectURL(result.audioUrl);
      options?.onEnd?.();
      resolve();
    };

    audio.onerror = () => {
      currentAudio = null;
      const error = new Error('Audio playback failed');
      options?.onError?.(error);
      reject(error);
    };

    audio.play().catch((error) => {
      currentAudio = null;
      options?.onError?.(error);
      reject(error);
    });
  });
}

function playBrowserTTS(
  text: string,
  options?: {
    onEnd?: () => void;
    onError?: (error: Error) => void;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      const error = new Error('Speech synthesis not supported');
      options?.onError?.(error);
      reject(error);
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Try to find a suitable voice
    const voices = speechSynthesis.getVoices();
    const hebrewVoice = voices.find(v => v.lang.startsWith('he'));
    const englishFemaleVoice = voices.find(v => 
      v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
    );
    utterance.voice = hebrewVoice || englishFemaleVoice || voices[0] || null;

    utterance.onend = () => {
      currentUtterance = null;
      options?.onEnd?.();
      resolve();
    };

    utterance.onerror = (event) => {
      currentUtterance = null;
      const error = new Error(event.error);
      options?.onError?.(error);
      reject(error);
    };

    speechSynthesis.speak(utterance);
  });
}

export function stopPlayback(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (currentUtterance) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isPlaying(): boolean {
  return currentAudio !== null || speechSynthesis.speaking;
}

// ===== Voice Recording (STT) =====

export interface RecordingResult {
  blob: Blob;
  duration: number;
}

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingStartTime: number = 0;

export async function startRecording(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
    });

    audioChunks = [];
    recordingStartTime = Date.now();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();
    return true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return false;
  }
}

export async function stopRecording(): Promise<RecordingResult | null> {
  if (!mediaRecorder) return null;

  return new Promise((resolve) => {
    mediaRecorder!.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const duration = (Date.now() - recordingStartTime) / 1000;

      // Stop all tracks
      mediaRecorder!.stream.getTracks().forEach((track) => track.stop());
      mediaRecorder = null;

      resolve({ blob, duration });
    };

    mediaRecorder.stop();
  });
}

export function isRecording(): boolean {
  return mediaRecorder !== null && mediaRecorder.state === 'recording';
}

export async function transcribeAudio(audioBlob: Blob): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-transcribe`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      console.warn('Transcription failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.text?.trim() || null;
  } catch (error) {
    console.error('Transcription error:', error);
    return null;
  }
}

// ===== Utility Functions =====

export function getVoiceConfig(context: VoiceContext): VoiceConfig {
  return VOICE_CONFIGS[context];
}

export function isTTSAvailable(): boolean {
  return 'speechSynthesis' in window;
}

export async function preloadVoices(): Promise<void> {
  if (!('speechSynthesis' in window)) return;

  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve();
      return;
    }

    speechSynthesis.onvoiceschanged = () => resolve();
    setTimeout(resolve, 2000); // Timeout fallback
  });
}
