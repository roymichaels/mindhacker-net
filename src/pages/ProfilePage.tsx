/**
 * ProfilePage — Full-page version of the Character Profile.
 * Renders the same RPG character sheet content as a routed page.
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { getArchetypeName, getArchetypeIcon } from '@/lib/orbProfileGenerator';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { OrbDNAModal } from '@/components/gamification/OrbDNAModal';
import { OrbFullscreenViewer } from '@/components/orb/OrbFullscreenViewer';
import { PracticesModal } from '@/components/modals/PracticesModal';
import { Star, Flame, Zap } from 'lucide-react';
import { Sparkles, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfileTab, TraitsTab } from '@/components/modals/CharacterProfileModal';

export default function ProfilePage() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const streak = useStreak();
  const tokens = useEnergy();
  const { profile } = useOrbProfile();
  const [traitsOpen, setTraitsOpen] = useState(false);
  const [practicesOpen, setPracticesOpen] = useState(false);
  const [orbDNAOpen, setOrbDNAOpen] = useState(false);
  const [orbFullscreenOpen, setOrbFullscreenOpen] = useState(false);

  const dominantArchetype = profile.computedFrom.dominantArchetype || 'explorer';
  const archetypeName = getArchetypeName(dominantArchetype, isHe);
  const archetypeIcon = getArchetypeIcon(dominantArchetype);

  return (
    <>
      <OrbDNAModal open={orbDNAOpen} onOpenChange={setOrbDNAOpen} />
      <PracticesModal open={practicesOpen} onOpenChange={setPracticesOpen} />
      <OrbFullscreenViewer open={orbFullscreenOpen} onClose={() => setOrbFullscreenOpen(false)} />

      <div
        className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-32"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background-end)) 40%, hsl(var(--background)) 100%)' }}
      >
        {/* ═══════ HEADER: Royal Character Card ═══════ */}
        <div className="relative pt-10 pb-5 px-4 flex flex-col items-center text-center">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20"
            style={{ background: profile.primaryColor || 'hsl(35 80% 50%)' }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] opacity-10 bg-amber-400" />

          <button
            className="relative cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setOrbFullscreenOpen(true)}
          >
            <div className="absolute -inset-2 rounded-full border border-amber-500/30" style={{ boxShadow: '0 0 20px hsla(35, 80%, 50%, 0.15)' }} />
            <PersonalizedOrb size={80} state="idle" />
          </button>

          <div className="mt-4 space-y-1">
            {dashboard.identityTitle && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">{dashboard.identityTitle.icon}</span>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {isHe ? dashboard.identityTitle.title : dashboard.identityTitle.titleEn}
                </h2>
              </div>
            )}
            <div className="flex items-center justify-center gap-2">
              <span className="text-amber-400/80 text-sm">{archetypeIcon}</span>
              <span className="text-xs font-medium text-amber-400/60 uppercase tracking-[0.15em]">{archetypeName}</span>
            </div>
          </div>

          <div className="w-full max-w-[280px] mt-4 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/20">
                <Star className="h-3 w-3 fill-amber-400" /> Lv.{xp.level}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, hsl(35 80% 50%), hsl(45 90% 55%))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xp.percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[10px] text-white/30 tabular-nums font-mono">{xp.current}/{xp.required}</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                <Zap className="h-3 w-3" /> {tokens.balance}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400">
                <Flame className="h-3 w-3" /> {streak.streak}{streak.isActiveToday ? ' ✓' : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3 w-full max-w-[280px]">
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
            </div>
          </div>
        </div>

        {/* ═══════ PROFILE CONTENT ═══════ */}
        <div className="px-4">
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
