import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface VoiceRecordingButtonProps {
  isRecording: boolean;
  isTranscribing?: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

const VoiceRecordingButton = ({
  isRecording,
  isTranscribing = false,
  onStartRecording,
  onStopRecording,
  onCancel,
  disabled = false,
  className,
  compact = false,
}: VoiceRecordingButtonProps) => {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      intervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRecordingDuration(0);
      setAudioLevel(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  // Simulate audio level animation (visual feedback)
  useEffect(() => {
    if (isRecording) {
      const animate = () => {
        // Simulate varying audio levels for visual feedback
        setAudioLevel(Math.random() * 0.5 + 0.3);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (isTranscribing) return;
    
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  // Compact mode - just the mic button
  if (compact) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={disabled || isTranscribing}
        className={cn(
          "relative rounded-full transition-all duration-200",
          isRecording && "bg-destructive/10 text-destructive",
          isTranscribing && "opacity-50",
          className
        )}
      >
        <AnimatePresence mode="wait">
          {isTranscribing ? (
            <motion.div
              key="transcribing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.div>
          ) : isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative"
            >
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-destructive/30"
                animate={{
                  scale: [1, 1.5 + audioLevel * 0.5],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <Square className="w-4 h-4 fill-current" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Mic className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    );
  }

  // Full mode - WhatsApp/Telegram style
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="recording-bar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3"
          >
            {/* Cancel button */}
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-muted-foreground hover:text-destructive"
              >
                ביטול
              </Button>
            )}

            {/* Recording indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full">
              {/* Pulsing dot */}
              <motion.div
                className="w-2 h-2 rounded-full bg-destructive"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Audio wave visualization */}
              <div className="flex items-center gap-0.5 h-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-destructive rounded-full"
                    animate={{
                      height: isRecording
                        ? [4, 8 + audioLevel * 8, 4]
                        : 4,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: i * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              {/* Duration */}
              <span className="text-sm font-medium text-destructive tabular-nums min-w-[40px]">
                {formatDuration(recordingDuration)}
              </span>
            </div>

            {/* Stop/Send button */}
            <Button
              type="button"
              size="icon"
              onClick={handleClick}
              disabled={isTranscribing}
              className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
            >
              {isTranscribing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="mic-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClick}
              disabled={disabled}
              className="rounded-full h-10 w-10 hover:bg-primary/10"
            >
              <Mic className="w-5 h-5 text-muted-foreground" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceRecordingButton;
