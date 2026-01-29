import { useState, useCallback, useRef, useEffect } from 'react';
import * as VoiceService from '@/services/unifiedVoice';
import type { VoiceContext } from '@/services/unifiedVoice';

interface UseVoiceOptions {
  context?: VoiceContext;
  onTranscription?: (text: string) => void;
  onPlaybackEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Unified voice hook for TTS and STT functionality
 * Replaces both useAuroraVoice and manual voice.ts usage
 */
export function useVoice(options: UseVoiceOptions = {}) {
  const { 
    context = 'aurora', 
    onTranscription, 
    onPlaybackEnd,
    onError 
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);

  const isPlayingRef = useRef(false);

  // Preload voices on mount
  useEffect(() => {
    VoiceService.preloadVoices();
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      VoiceService.stopPlayback();
    };
  }, []);

  // ===== TTS Functions =====

  const speak = useCallback(async (
    text: string,
    messageId?: string
  ): Promise<boolean> => {
    if (isPlayingRef.current) {
      // Toggle off if already playing this message
      if (messageId && activeMessageId === messageId) {
        VoiceService.stopPlayback();
        setIsPlaying(false);
        setActiveMessageId(null);
        isPlayingRef.current = false;
        return false;
      }
      // Stop current and play new
      VoiceService.stopPlayback();
    }

    try {
      setError(null);
      setIsPlaying(true);
      setActiveMessageId(messageId || null);
      setPlaybackProgress(0);
      isPlayingRef.current = true;

      const result = await VoiceService.speak(text, context);
      
      if (!result) {
        throw new Error('Failed to generate speech');
      }

      await VoiceService.playAudio(result, {
        onProgress: (current, total) => {
          if (total > 0) {
            setPlaybackProgress((current / total) * 100);
          }
        },
        onEnd: () => {
          setIsPlaying(false);
          setActiveMessageId(null);
          setPlaybackProgress(0);
          isPlayingRef.current = false;
          onPlaybackEnd?.();
        },
        onError: (err) => {
          setError(err.message);
          setIsPlaying(false);
          setActiveMessageId(null);
          isPlayingRef.current = false;
          onError?.(err);
        },
      });

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      setIsPlaying(false);
      setActiveMessageId(null);
      isPlayingRef.current = false;
      onError?.(error);
      return false;
    }
  }, [context, activeMessageId, onPlaybackEnd, onError]);

  const stopPlayback = useCallback(() => {
    VoiceService.stopPlayback();
    setIsPlaying(false);
    setActiveMessageId(null);
    setPlaybackProgress(0);
    isPlayingRef.current = false;
  }, []);

  // ===== STT Functions =====

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await VoiceService.startRecording();
      
      if (success) {
        setIsRecording(true);
        return true;
      } else {
        setError('Microphone access denied');
        return false;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      onError?.(error);
      return false;
    }
  }, [onError]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      const result = await VoiceService.stopRecording();
      setIsRecording(false);

      if (!result) {
        return null;
      }

      // Transcribe the recording
      const text = await VoiceService.transcribeAudio(result.blob);
      
      if (text) {
        onTranscription?.(text);
      }

      return text;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      setIsRecording(false);
      onError?.(error);
      return null;
    }
  }, [onTranscription, onError]);

  const cancelRecording = useCallback(() => {
    if (VoiceService.isRecording()) {
      VoiceService.stopRecording(); // Discard the result
    }
    setIsRecording(false);
  }, []);

  // ===== Utility =====

  const getVoiceConfig = useCallback(() => {
    return VoiceService.getVoiceConfig(context);
  }, [context]);

  return {
    // TTS State
    isPlaying,
    activeMessageId,
    playbackProgress,
    
    // STT State
    isRecording,
    
    // Error state
    error,
    
    // TTS Actions
    speak,
    stopPlayback,
    
    // STT Actions
    startRecording,
    stopRecording,
    cancelRecording,
    
    // Utility
    getVoiceConfig,
    isTTSAvailable: VoiceService.isTTSAvailable,
  };
}
