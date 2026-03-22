/**
 * ProfileHeroSection — Full avatar display + user info card + stats
 * Shown above the NFT Triad in the profile modal.
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import { getArchetypeName } from '@/lib/orbProfileGenerator';
import { getOrbRarity } from '@/lib/orbRarity';
import { AvatarFullBody } from '@/components/avatar/AvatarFullBody';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Flame, Zap, Star, Pencil, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfileHeroSection() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const isRTL = isHe;
  const dashboard = useUnifiedDashboard();
  const { profile } = useOrbProfile();
  const xp = useXpProgress();
  const streak = useStreak();
  const energy = useEnergy();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const rarity = getOrbRarity(xp.level);
  const dominantArchetype = profile.computedFrom.dominantArchetype || 'explorer';
  const archetypeName = getArchetypeName(dominantArchetype, isHe);

  const userName = dashboard.user.name || dashboard.user.email?.split('@')[0] || 'Player';
  const identityTitle = dashboard.identityTitle;

  return (
    <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Avatar — no container, transparent bg */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative flex justify-center"
      >
        {/* Subtle glow behind avatar */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full blur-3xl opacity-30"
          style={{ background: `hsl(${rarity.color})` }}
        />
        <AvatarFullBody height={260} className="relative z-10" />

        {/* Edit button for admin */}
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/avatar')}
            className="absolute bottom-2 right-1/2 translate-x-16 z-20 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md flex items-center justify-center hover:bg-primary/30 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-primary" />
          </motion.button>
        )}
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center -mt-2 relative z-20 space-y-1"
      >
        {/* Name */}
        <h2 className="text-xl font-black text-foreground">{userName}</h2>

        {/* Archetype */}
        <div className="flex items-center justify-center gap-2">
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `hsl(${rarity.color} / 0.15)`,
              color: `hsl(${rarity.color})`,
            }}
          >
            {archetypeName}
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground"
          >
            {isHe ? rarity.label.he : rarity.label.en}
          </span>
        </div>

        {/* Job / Identity Title */}
        {identityTitle?.title && (
          <p className="text-xs text-muted-foreground">
            {isHe ? identityTitle.title : identityTitle.titleEn}
          </p>
        )}
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-4 space-y-2.5"
      >
        {/* Level + XP Bar */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black"
            style={{
              backgroundColor: `hsl(${rarity.color} / 0.12)`,
              color: `hsl(${rarity.color})`,
            }}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{isHe ? 'רמה' : 'Lv.'} {xp.level}</span>
          </div>
          <div className="flex-1 h-2.5 rounded-full bg-muted/40 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xp.percentage}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, hsl(${rarity.color}), hsl(${rarity.color} / 0.6))`,
              }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-mono min-w-[50px] text-end">
            {xp.current}/{xp.required}
          </span>
        </div>

        {/* Mini stat pills */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-orange-500/[0.08] border border-orange-500/15">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-bold text-orange-400">{streak.streak}</span>
            <span className="text-[9px] text-muted-foreground">{isHe ? 'ימים' : 'days'}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-cyan-500/[0.08] border border-cyan-500/15">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400">{energy.balance}</span>
            <span className="text-[9px] text-muted-foreground">{isHe ? 'אנרגיה' : 'energy'}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/15">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">{dashboard.tokens}</span>
            <span className="text-[9px] text-muted-foreground">MOS</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
