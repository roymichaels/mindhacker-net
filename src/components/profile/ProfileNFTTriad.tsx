/**
 * ProfileNFTTriad — 3-column NFT card grid: Orb | Avatar | DNA
 * Each card opens a frosted-glass NFT detail modal on click.
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import { useDNA } from '@/identity/useDNA';
import { useUserAvatarData } from '@/hooks/useUserAvatarData';
import { getOrbRarity } from '@/lib/orbRarity';
import { getArchetypeName } from '@/lib/orbProfileGenerator';
import { AVATAR_CATEGORIES } from '@/components/avatar/avatarAssets';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { AvatarMiniPreview } from '@/components/avatar/AvatarMiniPreview';
import DNAViewer from '@/components/dna/DNAViewer';
import { NFTDetailCard } from './NFTDetailCard';
import { Star, Flame, Zap, Shield, Sparkles, Activity, Sword, Crown, Shirt, Eye, Footprints } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NFTType } from './NFTDetailCard';

/* ── Trait colors (shared with DNAViewer) ── */
const TRAIT_COLORS: Record<string, string> = {
  consistency: '#3B82F6', discipline: '#6366F1', energy: '#22C55E',
  social: '#F59E0B', consciousness: '#A855F7', presence: '#06B6D4',
  power: '#EF4444', vitality: '#10B981', focus: '#3B82F6',
  combat: '#DC2626', expansion: '#8B5CF6', wealth: '#F59E0B',
  influence: '#EC4899', relationships: '#F43F5E', business: '#14B8A6',
  projects: '#0EA5E9', play: '#FBBF24', order: '#64748B',
};

const TRAIT_LABELS_HE: Record<string, string> = {
  consistency: 'עקביות', discipline: 'משמעת', energy: 'אנרגיה',
  social: 'חברתיות', consciousness: 'תודעה', presence: 'נוכחות',
  power: 'כוח', vitality: 'חיוניות', focus: 'מיקוד',
  combat: 'לחימה', expansion: 'התרחבות', wealth: 'עושר',
  influence: 'השפעה', relationships: 'יחסים', business: 'עסקים',
  projects: 'פרויקטים', play: 'משחק', order: 'סדר',
};

/* ── Mini NFT Tile ── */
interface NFTTileProps {
  children: React.ReactNode;
  label: string;
  sublabel: string;
  accentColor: string;
  delay?: number;
  onClick?: () => void;
}

function NFTTile({ children, label, sublabel, accentColor, delay = 0, onClick }: NFTTileProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative rounded-2xl border border-border/30 dark:border-white/[0.06] overflow-hidden group text-start"
      style={{
        background: 'linear-gradient(to bottom, hsl(var(--muted) / 0.4), hsl(var(--muted) / 0.15))',
      }}
    >
      <div className="absolute top-0 inset-x-0 h-[1px] opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
      <div className="absolute top-0 left-0 w-5 h-5 border-t border-l rounded-tl-2xl pointer-events-none" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute top-0 right-0 w-5 h-5 border-t border-r rounded-tr-2xl pointer-events-none" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l rounded-bl-2xl pointer-events-none" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r rounded-br-2xl pointer-events-none" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 30%, ${accentColor}, transparent 70%)` }} />

      <div className="flex flex-col items-center p-3 gap-2">
        <div className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-xl bg-background/30">
          {children}
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-xs font-bold text-foreground/90 tracking-wide">{label}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">{sublabel}</p>
        </div>
      </div>
      <div className="h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />
    </motion.button>
  );
}

/* ── Main Component ── */
export default function ProfileNFTTriad() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [activeCard, setActiveCard] = useState<NFTType | null>(null);

  const { profile } = useOrbProfile();
  const xp = useXpProgress();
  const streak = useStreak();
  const energy = useEnergy();
  const { dna } = useDNA();
  const rarity = getOrbRarity(xp.level);
  const rarityLabel = isHe ? rarity.label.he : rarity.label.en;

  const dominantArchetype = profile.computedFrom.dominantArchetype || 'explorer';
  const archetypeName = getArchetypeName(dominantArchetype, isHe);
  const geometry = profile.geometryFamily || 'sphere';
  const material = profile.materialType || 'glass';

  // DNA traits for bars
  const dnaTraits = Object.entries(dna.dnaTraits)
    .map(([k, v]) => ({ key: k.replace(/^(value:|skill:)/, ''), weight: v }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  const serial = String(xp.experience).padStart(5, '0');

  return (
    <>
      <div className="grid grid-cols-3 gap-2.5">
        <NFTTile
          label={isHe ? 'אורב' : 'Orb'}
          sublabel={isHe ? 'גוף ויזואלי' : 'Visual Body'}
          accentColor="hsl(270 70% 55%)"
          delay={0}
          onClick={() => setActiveCard('orb')}
        >
          <PersonalizedOrb size={90} state="idle" showGlow={false} />
        </NFTTile>

        <NFTTile
          label={isHe ? 'אווטאר' : 'Avatar'}
          sublabel={isHe ? 'דמות 3D' : '3D Character'}
          accentColor="hsl(35 80% 50%)"
          delay={0.1}
          onClick={() => setActiveCard('avatar')}
        >
          <AvatarMiniPreview size={100} />
        </NFTTile>

        <NFTTile
          label="DNA"
          sublabel={isHe ? 'מבנה פנימי' : 'Inner Structure'}
          accentColor="hsl(220 80% 55%)"
          delay={0.2}
          onClick={() => setActiveCard('dna')}
        >
          <DNAViewer height={100} />
        </NFTTile>
      </div>

      {/* ── ORB Detail Card ── */}
      <NFTDetailCard
        open={activeCard === 'orb'}
        onClose={() => setActiveCard(null)}
        type="orb"
        title={isHe ? 'אורב AION' : 'AION Orb'}
        subtitle={isHe ? 'הגוף הויזואלי שלך' : 'Your Visual Body'}
        rarity={rarityLabel}
        rarityColor={rarity.color}
        serial={serial}
        description={isHe
          ? 'האורב משקף את הזהות המתפתחת שלך. צורה, צבע ותנועה נגזרים מה-DNA שלך.'
          : 'Your Orb reflects your evolving identity. Shape, color, and motion are derived from your DNA.'}
        visual={<PersonalizedOrb size={120} state="breathing" showGlow={false} />}
        stats={[
          { icon: <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />, label: isHe ? 'רמה' : 'Level', value: xp.level, color: '#FBBF24' },
          { icon: <Shield className="w-3.5 h-3.5" />, label: isHe ? 'צורה' : 'Shape', value: geometry, color: `hsl(${rarity.color})` },
          { icon: <Sparkles className="w-3.5 h-3.5" />, label: isHe ? 'חומר' : 'Material', value: material, color: `hsl(${rarity.color})` },
        ]}
        traits={[
          { name: isHe ? 'עיוות' : 'Morph', value: Math.round((profile.morphIntensity || 0.5) * 100), color: `hsl(${rarity.color})` },
          { name: isHe ? 'מהירות' : 'Speed', value: Math.round((profile.morphSpeed || 0.5) * 100), color: '#06B6D4' },
          { name: isHe ? 'ליבה' : 'Core', value: Math.round((profile.coreIntensity || 0.5) * 100), color: '#A855F7' },
          { name: isHe ? 'שכבות' : 'Layers', value: Math.min((profile.layerCount || 3) * 20, 100), color: '#22C55E' },
        ]}
      />

      {/* ── AVATAR Detail Card ── */}
      <NFTDetailCard
        open={activeCard === 'avatar'}
        onClose={() => setActiveCard(null)}
        type="avatar"
        title={isHe ? 'אווטאר 3D' : '3D Avatar'}
        subtitle={isHe ? 'הדמות שלך בעולם' : 'Your In-World Character'}
        rarity={rarityLabel}
        rarityColor="35 80% 50%"
        serial={serial}
        description={isHe
          ? 'הדמות הדיגיטלית שלך. ייחודית, אישית, ומייצגת אותך בכל מרחב.'
          : 'Your digital character. Unique, personal, and representing you across every space.'}
        visual={<AvatarMiniPreview size={130} />}
        stats={[
          { icon: <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />, label: isHe ? 'רמה' : 'Level', value: xp.level, color: '#FBBF24' },
          { icon: <Flame className="w-3.5 h-3.5" />, label: isHe ? 'סטריק' : 'Streak', value: streak.streak, color: '#F97316' },
          { icon: <Zap className="w-3.5 h-3.5" />, label: isHe ? 'אנרגיה' : 'Energy', value: energy.balance, color: '#06B6D4' },
        ]}
        traits={[
          { name: archetypeName, value: 85, color: '#FBBF24' },
          { name: isHe ? 'נוכחות' : 'Presence', value: Math.round(Math.min(xp.level * 8, 100)), color: '#A855F7' },
          { name: isHe ? 'השפעה' : 'Influence', value: Math.round(Math.min(streak.streak * 10, 100)), color: '#EC4899' },
        ]}
      />

      {/* ── DNA Detail Card ── */}
      <NFTDetailCard
        open={activeCard === 'dna'}
        onClose={() => setActiveCard(null)}
        type="dna"
        title={isHe ? 'סליל DNA' : 'DNA Helix'}
        subtitle={isHe ? 'המבנה הפנימי שלך' : 'Your Inner Structure'}
        rarity={rarityLabel}
        rarityColor="220 80% 55%"
        serial={serial}
        largeVisual
        description={isHe
          ? 'לחץ על הנקודות כדי לחקור את התכונות שלך'
          : 'Tap the nodes to explore your traits'}
        visual={<DNAViewer height={300} />}
        stats={[]}
        traits={[]}
      />
    </>
  );
}
