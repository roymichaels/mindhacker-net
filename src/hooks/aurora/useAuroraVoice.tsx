import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { debug } from '@/lib/debug';

interface UseAuroraVoiceOptions {
  onTranscription?: (text: string) => void;
}

export const useAuroraVoice = (options?: UseAuroraVoiceOptions) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      const text = data.text?.trim();

      if (text && options?.onTranscription) {
        options.onTranscription(text);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setRecordingError('Failed to transcribe audio');
    }
  }, [options]);

  // Play Aurora's voice for a message
  const playMessage = useCallback(async (messageId: string, content: string) => {
    if (isPlaying) {
      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setActiveMessageId(null);
      return;
    }

    try {
      setIsPlaying(true);
      setActiveMessageId(messageId);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: content,
            voice: 'cgSgspJ2msm6clMCkdW9', // Jessica voice for Aurora
          }),
        }
      );

      // Handle error responses gracefully (including 402 quota exceeded)
      if (!response.ok) {
        // Try to parse error response for logging
        const errorData = await response.json().catch(() => ({}));
        console.warn('TTS request failed:', response.status, errorData);
        
        // If it's a fallback signal, just silently fail (don't crash)
        if (errorData.fallback) {
          debug.log('ElevenLabs quota exceeded, TTS unavailable');
        }
        
        // Reset state without crashing
        setIsPlaying(false);
        setActiveMessageId(null);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('audio')) {
        // Not audio response - probably error JSON, fail gracefully
        console.warn('TTS response was not audio:', contentType);
        setIsPlaying(false);
        setActiveMessageId(null);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
        setActiveMessageId(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
        setActiveMessageId(null);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setIsPlaying(false);
      setActiveMessageId(null);
    }
  }, [isPlaying]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
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
