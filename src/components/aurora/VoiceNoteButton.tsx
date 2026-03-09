/**
 * VoiceNoteButton — Records and sends voice notes as audio attachments.
 * The audio is transcribed and sent to Aurora with a playable audio indicator.
 */
import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceNoteButtonProps {
  onVoiceNote: (audioBlob: Blob, durationSec: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function VoiceNoteButton({ onVoiceNote, disabled, className }: VoiceNoteButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const dur = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (dur >= 1) {
          onVoiceNote(blob, dur);
        }
        setIsRecording(false);
        setDuration(0);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start(250);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch {
      console.error('Microphone access denied');
    }
  }, [onVoiceNote]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute bottom-full mb-2 right-0 flex items-center gap-2 bg-destructive/10 text-destructive rounded-full px-3 py-1 text-xs font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            {formatDuration(duration)}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        disabled={disabled}
        onClick={isRecording ? stopRecording : startRecording}
        className={cn(
          "h-9 w-9 flex items-center justify-center rounded-lg transition-all shrink-0",
          isRecording
            ? "bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/30"
            : "bg-background/50 backdrop-blur-xl border border-border/50 hover:bg-muted/50 text-muted-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        title={isRecording ? 'Stop recording' : 'Send voice note'}
      >
        {isRecording ? (
          <Square className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
