/**
 * AionPresenceHero — Canonical AION presence at the top of Profile/Self.
 *
 * Visual hierarchy contract:
 *   1. AION (this hero) = the living intelligence companion observing you.
 *   2. User identity artifacts (NFT triad, DNA orb, avatar) = below, as
 *      personal identity, NOT as AION presence.
 *
 * Reuses the same canonical model used in Chat / Voice / Journey / World /
 * Mind so AION reads as one entity everywhere.
 */
import { motion } from 'framer-motion';
import CanonicalAionModel from '@/components/orb/CanonicalAionModel';
import { useTranslation } from '@/hooks/useTranslation';
import { useAionPresence } from '@/aion/presenceState';

const HE_COPY: Record<string, string> = {
  resting: 'AION כאן איתך',
  listening: 'AION מקשיב',
  noticing: 'AION שם לב',
  forming: 'AION חושב',
  manifesting: 'AION מתגלם',
  evolving: 'AION מתפתח איתך',
};

const EN_COPY: Record<string, string> = {
  resting: 'AION is present with you',
  listening: 'AION is listening',
  noticing: 'AION is noticing',
  forming: 'AION is forming a thought',
  manifesting: 'AION is manifesting',
  evolving: 'AION is evolving with you',
};

export default function AionPresenceHero() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const state = useAionPresence();
  const label = (isHe ? HE_COPY : EN_COPY)[state] ?? (isHe ? HE_COPY.resting : EN_COPY.resting);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-3 pt-2 pb-4"
    >
      <CanonicalAionModel size={180} ariaLabel="AION" />
      <div className="text-center">
        <div className="text-[13px] font-medium text-foreground/80">{label}</div>
        <div className="text-[11px] text-foreground/45 mt-0.5">
          {isHe ? 'הישות החיה שמלווה אותך' : 'Your living intelligence companion'}
        </div>
      </div>
    </motion.div>
  );
}
