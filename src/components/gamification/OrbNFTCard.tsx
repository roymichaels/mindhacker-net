/**
 * OrbNFTCard — AION identity collectible card showcasing the user's evolving identity.
 * Fantasy RPG aesthetic with rarity borders, stats, and shimmer effects.
 * The Orb is the visual renderer for the AION identity.
 * Shows "Mint AION" CTA if not yet minted.
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useSoulWallet } from '@/hooks/useSoulWallet';
import { useSoulAvatarWizard } from '@/contexts/SoulAvatarContext';
import { getOrbRarity, levelsToNextRarity } from '@/lib/orbRarity';
import { getArchetypeName, getArchetypeIcon } from '@/lib/orbProfileGenerator';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Star, Flame, Zap, Shield, Sparkles, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAION } from '@/identity';

interface OrbNFTCardProps {
  onTapOrb?: () => void;
  compact?: boolean;
}

export function OrbNFTCard({ onTapOrb, compact = false }: OrbNFTCardProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { aion, isActivated } = useAION();
  const { profile } = useOrbProfile();
  const xp = useXpProgress();
  const streak = useStreak();
  const energy = useEnergy();
  const dashboard = useUnifiedDashboard();
  const { user } = useAuth();
  const { isMinted, walletAddress } = useSoulWallet();
  const { openWizard } = useSoulAvatarWizard();

  const rarity = getOrbRarity(xp.level);
  const nextRarityIn = levelsToNextRarity(xp.level);
  const dominantArchetype = profile.computedFrom.dominantArchetype || 'explorer';
  const archetypeName = getArchetypeName(dominantArchetype, isHe);
  const archetypeIcon = getArchetypeIcon(dominantArchetype);
  const mintDate = isMinted && walletAddress
    ? new Date().toLocaleDateString(isHe ? 'he-IL' : 'en-US', { month: 'short', year: 'numeric' })
    : null;
  const geometry = profile.geometryFamily || 'sphere';
  const material = profile.materialType || 'glass';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative rounded-2xl border-2 overflow-hidden',
        'bg-gradient-to-br',
        rarity.bgClass,
        rarity.borderClass,
        rarity.shimmer && 'shadow-xl',
        rarity.glowClass,
      )}
    >
      {/* Shimmer overlay for epic/legendary */}
      {rarity.shimmer && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              background: `linear-gradient(105deg, transparent 40%, hsl(${rarity.color} / 0.6) 50%, transparent 60%)`,
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Corner ornaments */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl pointer-events-none" style={{ borderColor: `hsl(${rarity.color} / 0.3)` }} />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-2xl pointer-events-none" style={{ borderColor: `hsl(${rarity.color} / 0.3)` }} />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-2xl pointer-events-none" style={{ borderColor: `hsl(${rarity.color} / 0.3)` }} />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-2xl pointer-events-none" style={{ borderColor: `hsl(${rarity.color} / 0.3)` }} />

      {/* Rarity badge */}
      <div className="absolute top-3 end-3 z-20">
        <span
          className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border"
          style={{
            color: `hsl(${rarity.color})`,
            borderColor: `hsl(${rarity.color} / 0.4)`,
            background: `linear-gradient(135deg, hsl(${rarity.color} / 0.15), hsl(${rarity.color} / 0.05))`,
          }}
        >
          {isHe ? rarity.label.he : rarity.label.en}
        </span>
      </div>

      <div className={cn('flex flex-col items-center', compact ? 'p-4 gap-3' : 'p-6 gap-4')}>
        {/* ORB — the centerpiece */}
        <button onClick={onTapOrb} className="relative group cursor-pointer">
          <div
            className="absolute -inset-3 rounded-full opacity-30 group-hover:opacity-50 transition-opacity blur-xl"
            style={{ background: `hsl(${rarity.color})` }}
          />
          <div
            className="absolute -inset-1.5 rounded-full border"
            style={{ borderColor: `hsl(${rarity.color} / 0.25)` }}
          />
          <PersonalizedOrb size={compact ? 80 : 120} state="idle" />
        </button>

        {/* Identity */}
        <div className="text-center space-y-1">
          {/* AION name — prominent display */}
          {isActivated && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-bold mb-0.5">
              {isHe ? 'ה-AION שלך' : 'Your AION'}
            </p>
          )}
          {isActivated && (
            <h2 className="text-lg font-black text-foreground">{aion.name}</h2>
          )}
          {dashboard.identityTitle && (
            <h3 className={cn("text-base font-bold text-foreground", isActivated && "text-sm text-muted-foreground")}>
              {dashboard.identityTitle.icon} {isHe ? dashboard.identityTitle.title : dashboard.identityTitle.titleEn}
            </h3>
          )}
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm">{archetypeIcon}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: `hsl(${rarity.color})` }}>
              {archetypeName}
            </span>
          </div>
        </div>

        {/* Stats grid — RPG style */}
        <div className="w-full grid grid-cols-3 gap-2">
          <StatBox icon={<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />} label={isHe ? 'רמה' : 'Level'} value={`${xp.level}`} color="text-amber-400" />
          <StatBox icon={<Flame className="w-3.5 h-3.5 text-orange-400" />} label={isHe ? 'סטריק' : 'Streak'} value={`${streak.streak}`} color="text-orange-400" />
          <StatBox icon={<Zap className="w-3.5 h-3.5 text-cyan-400" />} label={isHe ? 'אנרגיה' : 'Energy'} value={`${energy.balance}`} color="text-cyan-400" />
        </div>

        {/* XP bar */}
        <div className="w-full space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>XP</span>
            <span className="font-mono tabular-nums">{xp.current}/{xp.required}</span>
          </div>
          <div className="h-2 rounded-full bg-muted/60 border border-border/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, hsl(${rarity.color}), hsl(${rarity.color} / 0.7))` }}
              initial={{ width: 0 }}
              animate={{ width: `${xp.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          {nextRarityIn !== null && (
            <p className="text-[9px] text-muted-foreground text-center">
              {isHe ? `${nextRarityIn} רמות לדרגה הבאה` : `${nextRarityIn} levels to next rarity`}
            </p>
          )}
        </div>

        {/* Trait chips */}
        <div className="flex flex-wrap justify-center gap-1.5">
          <TraitChip icon={<Shield className="w-3 h-3" />} label={geometry} color={rarity.color} />
          <TraitChip icon={<Sparkles className="w-3 h-3" />} label={material} color={rarity.color} />
        </div>

        {/* Footer — mint info or CTA */}
        <div className="w-full pt-2 border-t border-border/30 flex justify-between items-center">
          {isMinted ? (
            <>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                {isHe ? 'AION — Minted' : 'AION — Minted'} {mintDate}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground/60">#{String(xp.experience).padStart(5, '0')}</span>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); openWizard(); }}
              className="w-full gap-2 text-xs font-bold text-primary hover:text-primary"
            >
              <Gem className="w-3.5 h-3.5" />
              {isHe ? 'Mint AION' : 'Mint AION'}
            </Button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-150%); }
          50% { transform: translateX(150%); }
        }
      `}</style>
    </motion.div>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-2 rounded-xl bg-muted/30 border border-border/30">
      {icon}
      <span className={cn('text-sm font-black tabular-nums', color)}>{value}</span>
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

function TraitChip({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize"
      style={{
        color: `hsl(${color})`,
        borderColor: `hsl(${color} / 0.25)`,
        background: `hsl(${color} / 0.08)`,
      }}
    >
      {icon} {label}
    </span>
  );
}
