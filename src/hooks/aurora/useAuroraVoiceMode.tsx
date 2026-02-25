import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type VoiceModeState = 'idle' | 'listening' | 'processing' | 'speaking';

interface UseAuroraVoiceModeOptions {
  onSend: (message: string) => void;
  /** If true, listen for 'aurora:response' global events instead of manual feedResponse calls */
  useGlobalResponseEvent?: boolean;
  /** Called when voice mode opens/closes */
  onActiveChange?: (active: boolean) => void;
}

export function useAuroraVoiceMode({ onSend, onActiveChange, useGlobalResponseEvent = false }: UseAuroraVoiceModeOptions) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [state, setState] = useState<VoiceModeState>('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const [auroraResponse, setAuroraResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef(false);
  const pendingResponseRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  const cleanup = useCallback(() => {
    // Stop recording
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Stop any active mic streams
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
    }

    setState('idle');
    pendingResponseRef.current = false;
  }, []);

  const startListening = useCallback(async () => {
    if (!activeRef.current || !user?.id) return;

    try {
      setError(null);
      setState('listening');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });

      if (!activeRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (!activeRef.current) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAndSend(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (err) {
      console.error('Voice mode: mic error', err);
      setError('Microphone access denied');
      setState('idle');
    }
  }, [user?.id]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      setState('processing');
      mediaRecorderRef.current.stop();
    }
  }, []);

  const transcribeAndSend = useCallback(async (audioBlob: Blob) => {
    if (!activeRef.current) return;
    setState('processing');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-transcribe`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      const text = data.text?.trim();

      if (!text || !activeRef.current) {
        // No speech detected, go back to listening
        if (activeRef.current) startListening();
        return;
      }

      setUserTranscript(text);
      pendingResponseRef.current = true;
      onSend(text);
      // State stays 'processing' until feedResponse is called
    } catch (err) {
      console.error('Voice mode: transcription error', err);
      setError('Transcription failed');
      if (activeRef.current) startListening();
    }
  }, [onSend, startListening]);

  /** Called externally when Aurora's text response arrives */
  const feedResponse = useCallback(async (text: string) => {
    if (!activeRef.current || !pendingResponseRef.current) return;
    pendingResponseRef.current = false;
    setAuroraResponse(text);
    setState('speaking');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: text.slice(0, 2000), // cap TTS length
            voice: 'cgSgspJ2msm6clMCkdW9', // Jessica
          }),
        }
      );

      if (!response.ok || !activeRef.current) {
        // TTS failed, skip to listening
        if (activeRef.current) startListening();
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('audio')) {
        if (activeRef.current) startListening();
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        if (activeRef.current) startListening();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        if (activeRef.current) startListening();
      };

      await audio.play();
    } catch (err) {
      console.error('Voice mode: TTS error', err);
      if (activeRef.current) startListening();
    }
  }, [startListening]);

  const open = useCallback(async () => {
    setIsActive(true);
    activeRef.current = true;
    setUserTranscript('');
    setAuroraResponse('');
    setError(null);
    onActiveChange?.(true);
    // Auto-start listening after a brief delay for UI to mount
    setTimeout(() => {
      if (activeRef.current) startListening();
    }, 300);
  }, [startListening, onActiveChange]);

  const close = useCallback(() => {
    activeRef.current = false;
    setIsActive(false);
    cleanup();
    onActiveChange?.(false);
  }, [cleanup, onActiveChange]);

  // Listen for global aurora:response events (used by GlobalChatInput / AuroraDock)
  useEffect(() => {
    if (!useGlobalResponseEvent) return;

    const handler = (e: Event) => {
      const text = (e as CustomEvent).detail?.text;
      if (text && activeRef.current && pendingResponseRef.current) {
        feedResponse(text);
      }
    };

    window.addEventListener('aurora:response', handler);
    return () => window.removeEventListener('aurora:response', handler);
  }, [useGlobalResponseEvent, feedResponse]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    isActive,
    state,
    userTranscript,
    auroraResponse,
    error,
    open,
    close,
    stopListening,
    feedResponse,
  };
}
