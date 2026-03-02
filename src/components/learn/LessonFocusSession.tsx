/**
 * LessonFocusSession — Full-screen immersive lesson overlay.
 * Covers the entire viewport (including root layout).
 * Features: upward timer, TTS button, exit confirmation, lazy content generation.
 * Renders via React Portal to document.body.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import LessonViewer from './LessonViewer';

interface Lesson {
  id: string;
  title: string;
  lesson_type: string;
  content: any;
  status: string;
  score: number | null;
  xp_reward: number;
  time_estimate_minutes: number;
  completed_at: string | null;
  user_submission: any;
  feedback: any;
  module_id: string;
  curriculum_id: string;
  title_en?: string | null;
  order_index?: number;
}

interface Props {
  lesson: Lesson;
  onComplete: () => void;
  onClose: () => void;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LessonFocusSession({ lesson, onComplete, onClose }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  
  // Timer state — counts up from 0
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  // Exit confirmation
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Start timer on mount
  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.body.style.overflow = prev;
    };
  }, []);

  const handleExitAttempt = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const handleConfirmExit = useCallback(() => {
    setShowExitConfirm(false);
    onClose();
  }, [onClose]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const overlay = (
    <AnimatePresence>
      <motion.div
        key="focus-session"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        role="dialog"
        className="fixed inset-0 z-[9999] flex flex-col bg-background"
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-background shrink-0">
          {/* Exit button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitAttempt}
            className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Timer */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono font-bold tabular-nums text-foreground">
              {formatElapsed(elapsed)}
            </span>
          </div>

          {/* Spacer for symmetry */}
          <div className="w-10" />
        </div>

        {/* ── Lesson Content ── */}
        <div className="flex-1 overflow-hidden bg-background">
          <LessonViewer
            lesson={lesson}
            onComplete={handleComplete}
            onClose={handleExitAttempt}
          />
        </div>

        {/* ── Exit Confirmation Overlay ── */}
        <AnimatePresence>
          {showExitConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowExitConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-card border border-border/50 rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl space-y-4"
                onClick={e => e.stopPropagation()}
                dir={isHe ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">
                      {isHe ? 'לצאת מהשיעור?' : 'Leave lesson?'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isHe
                        ? `עברו ${formatElapsed(elapsed)} — ההתקדמות שלא נשמרה תאבד.`
                        : `${formatElapsed(elapsed)} elapsed — unsaved progress will be lost.`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowExitConfirm(false)}
                  >
                    {isHe ? 'להישאר' : 'Stay'}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleConfirmExit}
                  >
                    {isHe ? 'לצאת' : 'Leave'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}
