/**
 * ProfilePage — Full-page version of the Character Profile.
 * Now features an NFT-style orb card as the hero element.
 * Responsive: wider layout on tablet/desktop.
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { OrbNFTCard } from '@/components/gamification/OrbNFTCard';
import { OrbDNAModal } from '@/components/gamification/OrbDNAModal';
import { OrbFullscreenViewer } from '@/components/orb/OrbFullscreenViewer';
import { PracticesModal } from '@/components/modals/PracticesModal';
import { AchievementGalleryModal } from '@/components/modals/AchievementGalleryModal';
import { InventoryBagModal } from '@/components/modals/InventoryBagModal';
import { Sparkles, Dumbbell, Trophy, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfileTab, TraitsTab } from '@/components/modals/CharacterProfileModal';

export default function ProfilePage() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const dashboard = useUnifiedDashboard();
  const [traitsOpen, setTraitsOpen] = useState(false);
  const [practicesOpen, setPracticesOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [orbDNAOpen, setOrbDNAOpen] = useState(false);
  const [orbFullscreenOpen, setOrbFullscreenOpen] = useState(false);

  return (
    <>
      <OrbDNAModal open={orbDNAOpen} onOpenChange={setOrbDNAOpen} />
      <PracticesModal open={practicesOpen} onOpenChange={setPracticesOpen} />
      <AchievementGalleryModal open={achievementsOpen} onOpenChange={setAchievementsOpen} />
      <InventoryBagModal open={inventoryOpen} onOpenChange={setInventoryOpen} />
      <OrbFullscreenViewer open={orbFullscreenOpen} onClose={() => setOrbFullscreenOpen(false)} />

      <div
        className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-32"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background-end)) 40%, hsl(var(--background)) 100%)' }}
      >
        {/* ═══════ HERO: NFT Orb Card ═══════ */}
        <div className="px-4 pt-6 pb-2 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full">
          <OrbNFTCard onTapOrb={() => setOrbFullscreenOpen(true)} />
        </div>

        {/* ═══════ ACTION BUTTONS (2x2 grid) ═══════ */}
        <div className="px-4 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTraitsOpen(true)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/25 bg-primary/[0.08] hover:bg-primary/[0.14] transition-colors"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">{isHe ? 'תכונות' : 'Traits'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPracticesOpen(true)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] hover:bg-amber-500/[0.14] transition-colors"
            >
              <Dumbbell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{isHe ? 'תרגולים' : 'Practices'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setAchievementsOpen(true)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] hover:bg-amber-500/[0.14] transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{isHe ? 'הישגים' : 'Achievements'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setInventoryOpen(true)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] hover:bg-amber-500/[0.14] transition-colors"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{isHe ? 'שלל' : 'Loot'}</span>
            </motion.button>
          </div>
        </div>

        {/* ═══════ PROFILE CONTENT ═══════ */}
        <div className="px-4 mt-4 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full">
          {traitsOpen ? (
            <div className="relative">
              <button
                onClick={() => setTraitsOpen(false)}
                className="mb-4 text-sm text-muted-foreground hover:text-foreground"
              >
                ← {isHe ? 'חזרה' : 'Back'}
              </button>
              <TraitsTab isHe={isHe} />
            </div>
          ) : (
            <ProfileTab
              isHe={isHe}
              language={language}
              dashboard={dashboard}
              isOwner={true}
            />
          )}
        </div>
      </div>
    </>
  );
}
