/**
 * VoiceNoteMessage — Renders an inline playable voice note in chat.
 */
import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceNoteMessageProps {
  audioUrl: string;
  durationSec: number;
  className?: string;
}

export default function VoiceNoteMessage({ audioUrl, durationSec, className }: VoiceNoteMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.ontimeupdate = () => {
        setProgress(audio.currentTime / audio.duration);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex items-center gap-2 p-2 rounded-lg bg-muted/50 max-w-[200px]", className)}>
      <button
        onClick={togglePlay}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors shrink-0"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground mt-0.5 block">
          {formatDuration(durationSec)}
        </span>
      </div>
    </div>
  );
}
