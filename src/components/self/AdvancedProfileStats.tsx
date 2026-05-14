/**
 * AdvancedProfileStats — standalone "deep stats / legacy view" content.
 *
 * Phase 3B: pulled out of ProfilePage so it can render inside the
 * artifact frame without depending on ProfileModalContext. Also reused
 * by ProfilePage when the user toggles the in-modal "Advanced" mode.
 *
 * Pure presentation. No backend or data shape changes.
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { OrbDNAModal } from '@/components/gamification/OrbDNAModal';
import { PracticesModal } from '@/components/modals/PracticesModal';
import { AchievementGalleryModal } from '@/components/modals/AchievementGalleryModal';
import { InventoryBagModal } from '@/components/modals/InventoryBagModal';
import { Sparkles, Dumbbell, Trophy, Package, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfileTab, TraitsTab } from '@/components/modals/CharacterProfileModal';
import { OrbNarrativeCard } from '@/components/profile/OrbNarrativeCard';
import { TransformationReportCard } from '@/components/profile/TransformationReportCard';
import BackButton from '@/components/navigation/BackButton';

export default function AdvancedProfileStats() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const dashboard = useUnifiedDashboard();
  const [traitsOpen, setTraitsOpen] = useState(false);
  const [practicesOpen, setPracticesOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [orbDNAOpen, setOrbDNAOpen] = useState(false);

  // Soft copy: XP→Energy, Level→Phase, Streak→Rhythm, NFT→Collectible.
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="w-full">
      <OrbDNAModal open={orbDNAOpen} onOpenChange={setOrbDNAOpen} />
      <PracticesModal open={practicesOpen} onOpenChange={setPracticesOpen} />
      <AchievementGalleryModal open={achievementsOpen} onOpenChange={setAchievementsOpen} />
      <InventoryBagModal open={inventoryOpen} onOpenChange={setInventoryOpen} />

      <div className="px-4 pt-3 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full">
        <p className="text-[11px] uppercase tracking-wider text-foreground/40 mb-2">
          {isHe ? 'תצוגה מתקדמת · נתונים מורחבים' : 'Advanced view · deep stats'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTraitsOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-cyan-500/25 bg-cyan-500/[0.08] hover:bg-cyan-500/[0.14] transition-colors"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400">{isHe ? 'תכונות' : 'Traits'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPracticesOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.14] transition-colors"
          >
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">{isHe ? 'תרגולים' : 'Practices'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setAchievementsOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] hover:bg-amber-500/[0.14] transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">{isHe ? 'הישגים' : 'Milestones'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setInventoryOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-500/25 bg-purple-500/[0.08] hover:bg-purple-500/[0.14] transition-colors"
          >
            <Package className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-400">{isHe ? 'אוסף' : 'Collectibles'}</span>
          </motion.button>
        </div>
      </div>

      <div className="px-4 mt-3 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full space-y-2.5">
        <OrbNarrativeCard />
        <TransformationReportCard />
      </div>

      {traitsOpen && (
        <div
          className="fixed inset-0 z-[80] flex flex-col overflow-hidden"
          style={{ backgroundColor: 'hsl(var(--background))' }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <BackButton onBack={() => setTraitsOpen(false)} />
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              {isHe ? 'תכונות' : 'Traits'}
            </h2>
            <button
              onClick={() => setTraitsOpen(false)}
              aria-label={isHe ? 'סגור' : 'Close'}
              className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-24 pt-4">
            <TraitsTab isHe={isHe} />
          </div>
        </div>
      )}

      <div className="px-4 mt-4 pb-16 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full">
        <ProfileTab
          isHe={isHe}
          language={language}
          dashboard={dashboard}
          isOwner={true}
        />
      </div>
    </div>
  );
}