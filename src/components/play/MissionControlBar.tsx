/**
 * MissionControlBar — Media-player style control bar for the Play page.
 * Large glowing Play button in the center, with prev/next/skip controls.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useFocusQueue } from '@/hooks/useFocusQueue';
import { FocusQueueModal } from './FocusQueueModal';
import {
  Play, SkipBack, SkipForward, FastForward, ListMusic, Pause,
} from 'lucide-react';

export function MissionControlBar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [queueOpen, setQueueOpen] = useState(false);
  const { items, nextItem, nextIndex, completedCount, totalCount, complete, skip } = useFocusQueue();

  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const currentTitle = nextItem
    ? nextItem.title
    : (isHe ? 'כל המשימות הושלמו!' : 'All missions complete!');

  const pillarLabel = nextItem?.pillar
    ? nextItem.pillar.charAt(0).toUpperCase() + nextItem.pillar.slice(1)
    : '';

  // Navigate to previous incomplete
  const prevItem = nextIndex > 0 ? items[nextIndex - 1] : null;
  const nextNextItem = nextIndex < items.length - 1 ? items[nextIndex + 1] : null;

  return (
    <>
      <div className="w-full max-w-xl mx-auto px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Now Playing display */}
        <div className="text-center mb-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={nextItem?.id || 'done'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase mb-1">
                {nextItem
                  ? `${isHe ? 'משימה' : 'Mission'} ${nextIndex + 1}/${totalCount}`
                  : (isHe ? 'סיום' : 'Complete')
                }
              </p>
              <h2 className="text-base font-bold text-foreground line-clamp-1 px-8">
                {currentTitle}
              </h2>
              {pillarLabel && (
                <p className="text-[10px] text-primary/80 font-semibold mt-0.5">{pillarLabel}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted/40 rounded-full overflow-hidden mb-4 mx-6">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          {/* Queue button */}
          <button
            onClick={() => setQueueOpen(true)}
            className="w-10 h-10 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground"
            title={isHe ? 'תור משימות' : 'Task Queue'}
          >
            <ListMusic className="w-4.5 h-4.5" />
          </button>

          {/* Previous */}
          <button
            onClick={() => {/* scroll to prev — handled by queue modal */}}
            disabled={!prevItem}
            className="w-10 h-10 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <SkipBack className="w-4.5 h-4.5" />
          </button>

          {/* PLAY — the hero button */}
          <motion.button
            onClick={() => {
              if (nextItem) {
                setQueueOpen(true);
              }
            }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              "relative w-16 h-16 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-primary via-primary to-secondary",
              "shadow-[0_0_30px_hsl(var(--primary)/0.4),0_0_60px_hsl(var(--primary)/0.2)]",
              "hover:shadow-[0_0_40px_hsl(var(--primary)/0.6),0_0_80px_hsl(var(--primary)/0.3)]",
              "transition-shadow duration-300",
              !nextItem && "opacity-60 from-emerald-500 via-emerald-400 to-teal-500 shadow-[0_0_30px_hsl(160_60%_45%/0.4)]"
            )}
          >
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full animate-pulse-glow opacity-50" />
            {nextItem ? (
              <Play className="w-7 h-7 text-primary-foreground ms-0.5" fill="currentColor" />
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-lg"
              >
                🏆
              </motion.div>
            )}
          </motion.button>

          {/* Next / Skip */}
          <button
            onClick={() => nextNextItem && skip(nextItem?.id || '')}
            disabled={!nextItem}
            className="w-10 h-10 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-4.5 h-4.5" />
          </button>

          {/* Quick Skip */}
          <button
            onClick={() => nextItem && skip(nextItem.id)}
            disabled={!nextItem}
            className="w-10 h-10 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            title={isHe ? 'דלג' : 'Skip'}
          >
            <FastForward className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tap to start label */}
        {nextItem && (
          <p className="text-center text-[10px] text-muted-foreground/60 mt-2 font-medium">
            {isHe ? 'לחץ Play להתחלת סשן' : 'Press Play to start session'}
          </p>
        )}
      </div>

      <FocusQueueModal open={queueOpen} onOpenChange={setQueueOpen} />
    </>
  );
}
