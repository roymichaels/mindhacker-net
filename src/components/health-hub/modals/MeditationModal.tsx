import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wind, Play, Pause, RotateCcw, X, Timer, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MeditationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'holdEmpty' | 'idle';

const MeditationModal = ({ isOpen, onClose, language }: MeditationModalProps) => {
  const isHebrew = language === 'he';
  
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState<'4-4-4' | '4-7-8'>('4-4-4');

  const patterns = {
    '4-4-4': { inhale: 4, hold: 4, exhale: 4, holdEmpty: 0, name: isHebrew ? 'נשימה מרובעת' : 'Box Breathing' },
    '4-7-8': { inhale: 4, hold: 7, exhale: 8, holdEmpty: 0, name: isHebrew ? 'נשימת הרפיה' : 'Relaxation Breath' },
  };

  const currentPattern = patterns[selectedPattern];

  const getPhaseText = useCallback(() => {
    switch (phase) {
      case 'inhale': return isHebrew ? 'שאפו...' : 'Breathe in...';
      case 'hold': return isHebrew ? 'החזיקו...' : 'Hold...';
      case 'exhale': return isHebrew ? 'נשפו...' : 'Breathe out...';
      case 'holdEmpty': return isHebrew ? 'המתינו...' : 'Wait...';
      default: return isHebrew ? 'לחצו להתחיל' : 'Press to start';
    }
  }, [phase, isHebrew]);

  const startBreathing = () => {
    setIsActive(true);
    setPhase('inhale');
    setSecondsRemaining(currentPattern.inhale);
    setCyclesCompleted(0);
  };

  const stopBreathing = () => {
    setIsActive(false);
    setPhase('idle');
    setSecondsRemaining(0);
  };

  const resetBreathing = () => {
    stopBreathing();
    setCyclesCompleted(0);
  };

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold');
            return currentPattern.hold;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return currentPattern.exhale;
          } else if (phase === 'exhale') {
            if (currentPattern.holdEmpty > 0) {
              setPhase('holdEmpty');
              return currentPattern.holdEmpty;
            } else {
              setPhase('inhale');
              setCyclesCompleted(c => c + 1);
              return currentPattern.inhale;
            }
          } else if (phase === 'holdEmpty') {
            setPhase('inhale');
            setCyclesCompleted(c => c + 1);
            return currentPattern.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, currentPattern]);

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      stopBreathing();
    }
  }, [isOpen]);

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale': return 1.3;
      case 'hold': return 1.3;
      case 'exhale': return 0.8;
      case 'holdEmpty': return 0.8;
      default: return 1;
    }
  };

  const getTransitionDuration = () => {
    switch (phase) {
      case 'inhale': return currentPattern.inhale;
      case 'exhale': return currentPattern.exhale;
      default: return 0.5;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-gradient-to-b from-gray-950 to-gray-900 border-red-800/50">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <Wind className="h-5 w-5" />
            {isHebrew ? 'נשימה ומדיטציה' : 'Breathing & Meditation'}
          </DialogTitle>
          <div className="w-8" />
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Pattern Selector */}
          <div className="flex gap-2 justify-center">
            {(Object.keys(patterns) as Array<'4-4-4' | '4-7-8'>).map((pattern) => (
              <Button
                key={pattern}
                variant={selectedPattern === pattern ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedPattern(pattern);
                  resetBreathing();
                }}
                disabled={isActive}
                className={selectedPattern === pattern ? 'bg-red-600 hover:bg-red-500' : ''}
              >
                {patterns[pattern].name}
              </Button>
            ))}
          </div>

          {/* Breathing Circle */}
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              className="relative w-48 h-48 flex items-center justify-center"
              animate={{ scale: getCircleScale() }}
              transition={{ 
                duration: getTransitionDuration(),
                ease: phase === 'hold' || phase === 'holdEmpty' ? 'linear' : 'easeInOut'
              }}
            >
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 blur-xl" />
              
              {/* Main circle */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-r from-red-500/30 to-pink-500/30 border-2 border-red-500/50" />
              
              {/* Inner content */}
              <div className="relative z-10 text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-medium text-red-300"
                  >
                    {getPhaseText()}
                  </motion.p>
                </AnimatePresence>
                {isActive && (
                  <p className="text-3xl font-bold text-white mt-2">
                    {secondsRemaining}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isActive ? (
              <Button
                onClick={startBreathing}
                className="bg-red-600 hover:bg-red-500 px-8"
              >
                <Play className="h-4 w-4 me-2" />
                {isHebrew ? 'התחל' : 'Start'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={stopBreathing}
                >
                  <Pause className="h-4 w-4 me-2" />
                  {isHebrew ? 'עצור' : 'Stop'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetBreathing}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Cycles Counter */}
          {cyclesCompleted > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="p-4 flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-400 font-medium">
                    {cyclesCompleted} {isHebrew ? 'מחזורים הושלמו' : 'cycles completed'}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Instructions */}
          <Card className="bg-background/60 border-border/30">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                {currentPattern.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                {selectedPattern === '4-4-4' 
                  ? (isHebrew 
                      ? 'שאפו 4 שניות, החזיקו 4 שניות, נשפו 4 שניות. מפחית מתח ומגביר ריכוז.'
                      : 'Inhale 4s, hold 4s, exhale 4s. Reduces stress and improves focus.')
                  : (isHebrew
                      ? 'שאפו 4 שניות, החזיקו 7 שניות, נשפו 8 שניות. מרגיע את מערכת העצבים.'
                      : 'Inhale 4s, hold 7s, exhale 8s. Calms the nervous system.')}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeditationModal;
