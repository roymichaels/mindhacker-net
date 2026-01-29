import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

interface BreathingGuideProps {
  isActive: boolean;
  pattern?: [number, number, number, number]; // [inhale, hold, exhale, rest] in seconds
  language: 'he' | 'en';
  className?: string;
}

const PHASE_LABELS: Record<BreathingPhase, { he: string; en: string }> = {
  inhale: { he: 'שאיפה', en: 'Breathe In' },
  hold: { he: 'עצירה', en: 'Hold' },
  exhale: { he: 'נשיפה', en: 'Breathe Out' },
  rest: { he: 'מנוחה', en: 'Rest' },
};

export function BreathingGuide({ 
  isActive, 
  pattern = [4, 4, 4, 4],
  language,
  className 
}: BreathingGuideProps) {
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [counter, setCounter] = useState(pattern[0]);
  const [cycleCount, setCycleCount] = useState(0);

  const getPhaseIndex = useCallback((p: BreathingPhase): number => {
    const phases: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'rest'];
    return phases.indexOf(p);
  }, []);

  const getNextPhase = useCallback((current: BreathingPhase): BreathingPhase => {
    const phases: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'rest'];
    const currentIndex = phases.indexOf(current);
    return phases[(currentIndex + 1) % 4];
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          const nextPhase = getNextPhase(phase);
          const nextPhaseDuration = pattern[getPhaseIndex(nextPhase)];
          
          if (nextPhase === 'inhale') {
            setCycleCount((c) => c + 1);
          }
          
          setPhase(nextPhase);
          return nextPhaseDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, pattern, getNextPhase, getPhaseIndex]);

  // Reset when becoming inactive
  useEffect(() => {
    if (!isActive) {
      setPhase('inhale');
      setCounter(pattern[0]);
      setCycleCount(0);
    }
  }, [isActive, pattern]);

  if (!isActive) return null;

  const scaleValue = phase === 'inhale' ? 1.3 : phase === 'exhale' ? 0.8 : 1;

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {/* Breathing Circle */}
      <div className="relative w-32 h-32">
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center"
          animate={{
            scale: scaleValue,
            opacity: phase === 'rest' ? 0.5 : 1,
          }}
          transition={{
            duration: pattern[getPhaseIndex(phase)],
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-primary/40 flex items-center justify-center"
            animate={{
              scale: scaleValue,
            }}
            transition={{
              duration: pattern[getPhaseIndex(phase)],
              ease: "easeInOut",
            }}
          >
            <span className="text-2xl font-bold text-primary-foreground">
              {counter}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Phase Label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-4 text-lg font-medium text-white/90"
        >
          {PHASE_LABELS[phase][language]}
        </motion.p>
      </AnimatePresence>

      {/* Cycle Counter */}
      {cycleCount > 0 && (
        <p className="mt-2 text-sm text-white/60">
          {language === 'he' ? `מחזור ${cycleCount}` : `Cycle ${cycleCount}`}
        </p>
      )}
    </div>
  );
}
