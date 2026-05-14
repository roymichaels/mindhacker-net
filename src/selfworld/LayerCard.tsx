/**
 * LayerCard — uniform tile used by InnerSystemsBand. Locked layers reveal a
 * presence-aware "AION is preparing this layer" line on tap; live layers
 * delegate to `onOpen`.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAionPresence } from '@/aion/presenceState';
import { cn } from '@/lib/utils';

interface Props {
  icon: LucideIcon;
  label: string;
  hint: string;
  locked?: boolean;
  onOpen?: () => void;
}

const HE_PREP: Record<string, string> = {
  resting: 'AION מכין עבורך את השכבה הזו',
  listening: 'AION מקשיב לפני שהשכבה הזו תיפתח',
  noticing: 'AION שם לב למשהו בשכבה הזו',
  forming: 'AION מעבד את השכבה הזו',
  manifesting: 'AION מתגלם — השכבה הזו תיפתח בקרוב',
  evolving: 'השכבה הזו מתפתחת איתך',
};

const EN_PREP: Record<string, string> = {
  resting: 'AION is preparing this layer',
  listening: 'AION is listening before this layer opens',
  noticing: 'AION is noticing something in this layer',
  forming: 'AION is shaping this layer',
  manifesting: 'AION is manifesting — this layer opens soon',
  evolving: 'This layer is evolving with you',
};

export default function LayerCard({ icon: Icon, label, hint, locked, onOpen }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const presence = useAionPresence();
  const [revealed, setRevealed] = useState(false);

  const handleClick = () => {
    if (locked) {
      setRevealed((r) => !r);
      return;
    }
    onOpen?.();
  };

  const prepLine = (isHe ? HE_PREP : EN_PREP)[presence] ?? (isHe ? HE_PREP.resting : EN_PREP.resting);

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative w-full text-start rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-md p-3',
        'transition-colors hover:bg-white/[0.04]',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center',
            locked ? 'bg-white/[0.03] text-foreground/35' : 'bg-primary/10 text-primary',
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-foreground/85 truncate">{label}</span>
            {locked && <Lock className="w-3 h-3 text-foreground/30" />}
          </div>
          <p className="text-[11px] text-foreground/45 mt-0.5 line-clamp-2">{hint}</p>
        </div>
      </div>
      <AnimatePresence>
        {locked && revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-[11px] text-foreground/55 italic mt-2 pt-2 border-t border-white/[0.05]">
              {prepLine}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
