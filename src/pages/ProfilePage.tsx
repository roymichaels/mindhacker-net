/**
 * ProfilePage — Fullscreen modal overlay for the Character Profile.
 * Renders via createPortal to escape DashboardLayout's background.
 */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { OrbNFTCard } from '@/components/gamification/OrbNFTCard';
import { OrbDNAModal } from '@/components/gamification/OrbDNAModal';
import { OrbFullscreenViewer } from '@/components/orb/OrbFullscreenViewer';
import { PracticesModal } from '@/components/modals/PracticesModal';
import { AchievementGalleryModal } from '@/components/modals/AchievementGalleryModal';
import { InventoryBagModal } from '@/components/modals/InventoryBagModal';
import { Sparkles, Dumbbell, Trophy, Package, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfileTab, TraitsTab } from '@/components/modals/CharacterProfileModal';
import { OrbNarrativeCard } from '@/components/profile/OrbNarrativeCard';
import { TransformationReportCard } from '@/components/profile/TransformationReportCard';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const dashboard = useUnifiedDashboard();
  const navigate = useNavigate();
  const [traitsOpen, setTraitsOpen] = useState(false);
  const [practicesOpen, setPracticesOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [orbDNAOpen, setOrbDNAOpen] = useState(false);
  const [orbFullscreenOpen, setOrbFullscreenOpen] = useState(false);

  // Lock body scroll while profile is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col overflow-y-auto scrollbar-hide"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background-end, var(--background))) 40%, hsl(var(--background)) 100%)' }}
    >
      <OrbDNAModal open={orbDNAOpen} onOpenChange={setOrbDNAOpen} />
      <PracticesModal open={practicesOpen} onOpenChange={setPracticesOpen} />
      <AchievementGalleryModal open={achievementsOpen} onOpenChange={setAchievementsOpen} />
      <InventoryBagModal open={inventoryOpen} onOpenChange={setInventoryOpen} />
      <OrbFullscreenViewer open={orbFullscreenOpen} onClose={() => setOrbFullscreenOpen(false)} />

      {/* ═══════ CLOSE BUTTON ═══════ */}
      <div className="sticky top-0 z-50 flex justify-end p-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-muted/60 backdrop-blur-md flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* ═══════ HERO: NFT Orb Card ═══════ */}
      <div className="px-4 pb-2 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full">
        <OrbNFTCard onTapOrb={() => setOrbFullscreenOpen(true)} />
      </div>

      {/* ═══════ ACTION BUTTONS (2x2 grid) ═══════ */}
      <div className="px-4 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
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
            <span className="text-xs font-bold text-amber-400">{isHe ? 'הישגים' : 'Achievements'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setInventoryOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-500/25 bg-purple-500/[0.08] hover:bg-purple-500/[0.14] transition-colors"
          >
            <Package className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-400">{isHe ? 'שלל' : 'Loot'}</span>
          </motion.button>
        </div>
      </div>

      {/* ═══════ ORB NARRATIVE + TRANSFORMATION REPORT ═══════ */}
      <div className="px-4 mt-3 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full space-y-2.5">
        <OrbNarrativeCard />
        <TransformationReportCard />
      </div>

      {/* ═══════ PROFILE CONTENT ═══════ */}
      <div className="px-4 mt-4 pb-16 max-w-sm sm:max-w-md md:max-w-lg mx-auto w-full">
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
  );

  return createPortal(content, document.body);
}