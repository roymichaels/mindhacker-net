/**
 * TTSPlayer — Cached TTS audio player with full controls.
 * States: idle, generating, ready, playing, paused, failed
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Play, Pause, Volume2, RotateCcw, RotateCw, Loader2, 
  AlertCircle, Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { getCachedTTS, type TTSCacheEntry } from '@/lib/ttsCache';
import { useAuth } from '@/contexts/AuthContext';
import { useVoicePersona } from '@/hooks/useVoicePersona';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { speakWithBrowser } from '@/services/voice';

type PlayerState = 'idle' | 'generating' | 'ready' | 'playing' | 'paused' | 'failed';

const SPEED_OPTIONS = [1, 1.5, 2] as const;

interface TTSPlayerProps {
  messageId: string;
  content: string;
  /** Compact mode — just a play icon, expands on click */
  compact?: boolean;
  className?: string;
}

export function TTSPlayer({ messageId, content, compact = true, className }: TTSPlayerProps) {
  const { user } = useAuth();
  const { persona } = useVoicePersona();
  const { isPlus } = useSubscriptionGate();
  
  const [state, setState] = useState<PlayerState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<TTSCacheEntry | null>(null);
  const animRef = useRef<number>(0);
  const browserCancelRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      browserCancelRef.current?.();
    };
  }, []);

  const updateTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!audioRef.current.paused) {
        animRef.current = requestAnimationFrame(updateTime);
      }
    }
  }, []);

  const handlePlay = useCallback(async () => {
    if (!user?.id) return;

    // Free users: browser TTS only
    if (!isPlus) {
      if (state === 'playing') {
        window.speechSynthesis?.cancel();
        browserCancelRef.current?.();
        setState('idle');
        return;
      }
      setState('playing');
      setExpanded(true);
      const handle = speakWithBrowser(content, {
        onEnd: () => setState('idle'),
        onError: () => setState('idle'),
      });
      if (handle) browserCancelRef.current = handle.cancel;
      else setState('idle');
      return;
    }

    // If we have an audio element ready
    if (audioRef.current && (state === 'ready' || state === 'paused')) {
      audioRef.current.playbackRate = SPEED_OPTIONS[speedIndex];
      audioRef.current.play();
      setState('playing');
      setExpanded(true);
      animRef.current = requestAnimationFrame(updateTime);
      return;
    }

    // Generate or load from cache
    setState('generating');
    setExpanded(true);

    try {
      const entry = await getCachedTTS(user.id, content, persona.voiceId, persona.speed);
      cacheRef.current = entry;

      const audio = new Audio(entry.audioUrl);
      audio.preload = 'auto';
      audio.playbackRate = SPEED_OPTIONS[speedIndex];
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        const dur = isFinite(audio.duration) ? audio.duration : entry.durationSeconds || 0;
        setDuration(dur);
      });

      audio.addEventListener('ended', () => {
        setState('ready');
        setCurrentTime(0);
        cancelAnimationFrame(animRef.current);
      });

      audio.addEventListener('error', () => {
        setState('failed');
      });

      await audio.play();
      setState('playing');
      animRef.current = requestAnimationFrame(updateTime);
    } catch (err) {
      console.error('[TTSPlayer] Failed:', err);
      setState('failed');
    }
  }, [user?.id, content, state, speedIndex, persona, isPlus, updateTime]);

  const handlePause = useCallback(() => {
    audioRef.current?.pause();
    cancelAnimationFrame(animRef.current);
    setState('paused');
  }, []);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    cancelAnimationFrame(animRef.current);
    setCurrentTime(0);
    setState('ready');
    setExpanded(false);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const handleSkip = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [duration]);

  const cycleSpeed = useCallback(() => {
    const next = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEED_OPTIONS[next];
    }
  }, [speedIndex]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Compact mode — just icon button
  if (compact && !expanded) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", className)}
        onClick={handlePlay}
        title="Play audio"
      >
        {state === 'generating' ? (
          <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
        ) : state === 'failed' ? (
          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
        ) : (
          <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </Button>
    );
  }

  // Expanded player
  return (
    <div className={cn(
      "flex flex-col gap-1.5 rounded-xl bg-muted/40 border border-border/30 px-3 py-2 w-full max-w-[300px]",
      className
    )}>
      {/* Top row: controls */}
      <div className="flex items-center gap-1">
        {/* Back 10s */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => handleSkip(-10)}
          disabled={state !== 'playing' && state !== 'paused'}
        >
          <RotateCcw className="h-3 w-3 text-muted-foreground" />
        </Button>

        {/* Play/Pause */}
        {state === 'generating' ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </Button>
        ) : state === 'playing' ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePause}>
            <Pause className="h-4 w-4 text-primary fill-current" />
          </Button>
        ) : state === 'failed' ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePlay}>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePlay}>
            <Play className="h-4 w-4 text-primary fill-current" />
          </Button>
        )}

        {/* Forward 10s */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => handleSkip(10)}
          disabled={state !== 'playing' && state !== 'paused'}
        >
          <RotateCw className="h-3 w-3 text-muted-foreground" />
        </Button>

        {/* Speed */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-[10px] font-mono text-muted-foreground"
          onClick={cycleSpeed}
        >
          {SPEED_OPTIONS[speedIndex]}x
        </Button>

        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ms-auto"
          onClick={handleStop}
        >
          <Square className="h-2.5 w-2.5 text-muted-foreground fill-current" />
        </Button>
      </div>

      {/* Seek bar */}
      {duration > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground w-8 text-end">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.5}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-[10px] font-mono text-muted-foreground w-8">
            {formatTime(duration)}
          </span>
        </div>
      )}

      {/* Status label */}
      {state === 'generating' && (
        <p className="text-[10px] text-muted-foreground text-center">מייצר אודיו...</p>
      )}
      {state === 'failed' && (
        <p className="text-[10px] text-destructive text-center">שגיאה — לחץ לנסות שוב</p>
      )}
    </div>
  );
}
