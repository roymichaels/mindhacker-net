import { Sparkles, ChevronRight, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import type { FMOpportunity } from '@/hooks/fm/useAuroraOpportunities';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Props {
  opportunities: FMOpportunity[];
  /** Legacy single suggestion fallback */
  suggestion?: string;
  onAction?: () => void;
  onSkip?: () => void;
}

export function FMAuroraCard({ opportunities, suggestion, onAction, onSkip }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visible = opportunities.filter((o) => !dismissedIds.has(o.id));
  const current = visible[0];

  // Auto-rotate every 8s if multiple
  const [autoIndex, setAutoIndex] = useState(0);
  useEffect(() => {
    if (visible.length <= 1) return;
    const timer = setInterval(() => setAutoIndex((i) => (i + 1) % visible.length), 8000);
    return () => clearInterval(timer);
  }, [visible.length]);

  const displayed = visible[autoIndex % visible.length] || current;

  if (!displayed && !suggestion) return null;

  // Fallback to legacy static mode
  if (!displayed && suggestion) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-primary">{isHe ? 'אורורה מציעה:' : 'Aurora suggests:'}</p>
            <p className="text-sm text-foreground/90">{suggestion}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onAction}>{isHe ? 'בוא נעשה את זה' : 'Do it →'}</Button>
          <Button size="sm" variant="ghost" onClick={onSkip}>{isHe ? 'דלג' : 'Skip'}</Button>
        </div>
      </div>
    );
  }

  const handleAction = () => {
    if (displayed.action.type === 'navigate') {
      navigate(displayed.action.path);
    }
  };

  const handleSkip = () => {
    setDismissedIds((prev) => new Set([...prev, displayed.id]));
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayed.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden bg-card border border-border rounded-xl p-4"
      >
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />

        <div className="relative space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 text-lg">
              {displayed.icon}
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                  {isHe ? 'אורורה מציעה' : 'Aurora suggests'}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground">{displayed.text}</p>
              <p className="text-xs text-muted-foreground">{displayed.subtext}</p>
            </div>
            {displayed.reward > 0 && (
              <div className="flex items-center gap-1 shrink-0 bg-accent/10 px-2 py-1 rounded-full">
                <Coins className="w-3 h-3 text-accent" />
                <span className="text-[11px] font-bold text-accent">{displayed.reward}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button size="sm" className="gap-1" onClick={handleAction}>
                {isHe ? 'בוא נעשה' : 'Let\'s go'}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleSkip}>
                {isHe ? 'דלג' : 'Skip'}
              </Button>
            </div>
            {visible.length > 1 && (
              <div className="flex gap-1">
                {visible.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === autoIndex % visible.length ? 'bg-accent' : 'bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
