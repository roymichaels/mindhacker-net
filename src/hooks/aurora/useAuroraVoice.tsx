import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { debug } from '@/lib/debug';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { speakWithBrowser } from '@/services/voice';
import { playTTS } from '@/lib/ttsPlayer';
import { useVoicePersona } from '@/hooks/useVoicePersona';
import { supabase } from '@/integrations/supabase/client';

interface UseAuroraVoiceOptions {
  onTranscription?: (text: string) => void;
}

export const useAuroraVoice = (options?: UseAuroraVoiceOptions) => {
  const { user } = useAuth();
  const { isPlus } = useSubscriptionGate();
  const { persona } = useVoicePersona();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const cancelRef = useRef<(() => void) | null>(null);

  // Start voice recording
  const startRecording = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setRecordingError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Transcribe the audio
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setRecordingError('Microphone access denied');
    }
  }, [user?.id]);

  // Stop voice recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Transcribe audio using ElevenLabs
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Get user session token for auth
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-transcribe`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('Transcription failed:', response.status, errData);
        throw new Error(errData.error || 'Transcription failed');
      }

      const data = await response.json();
      const text = data.text?.trim();

      if (text && options?.onTranscription) {
        options.onTranscription(text);
      } else if (!text) {
        setRecordingError('No speech detected. Try again.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setRecordingError('Failed to transcribe audio. Tap to retry.');
    }
  }, [options]);

  // Play Aurora's voice for a message — uses shared TTS engine with chunking & fallback
  const playMessage = useCallback(async (messageId: string, content: string) => {
    if (isPlaying) {
      // Stop current playback
      cancelRef.current?.();
      cancelRef.current = null;
      setIsPlaying(false);
      setActiveMessageId(null);
      return;
    }

    // Free users: browser TTS only (no ElevenLabs cost)
    if (!isPlus) {
      setIsPlaying(true);
      setActiveMessageId(messageId);
      const handle = speakWithBrowser(content, {
        onEnd: () => {
          setIsPlaying(false);
          setActiveMessageId(null);
        },
        onError: () => {
          setIsPlaying(false);
          setActiveMessageId(null);
        },
      });
      if (!handle) {
        setIsPlaying(false);
        setActiveMessageId(null);
      } else {
        cancelRef.current = handle.cancel;
      }
      return;
    }

    // Paid users: ElevenLabs via shared TTS engine (chunking, nikud stripping, fallback)
    setIsPlaying(true);
    setActiveMessageId(messageId);

    const handle = playTTS(content, {
      voiceId: persona.voiceId,
      speed: persona.speed,
      stability: persona.stability,
      similarityBoost: persona.similarityBoost,
      style: persona.style,
      onEnd: () => {
        setIsPlaying(false);
        setActiveMessageId(null);
        cancelRef.current = null;
      },
      onError: () => {
        setIsPlaying(false);
        setActiveMessageId(null);
        cancelRef.current = null;
      },
    });

    cancelRef.current = handle.cancel;
  }, [isPlaying, isPlus, persona]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    setIsPlaying(false);
    setActiveMessageId(null);
  }, []);

  return {
    isRecording,
    isPlaying,
    activeMessageId,
    recordingError,
    startRecording,
    stopRecording,
    playMessage,
    stopPlayback,
  };
};
