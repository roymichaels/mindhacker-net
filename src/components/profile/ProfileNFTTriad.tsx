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
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { profile } = useOrbProfile();
  const xp = useXpProgress();
  const streak = useStreak();
  const energy = useEnergy();
  const { dna } = useDNA();
  const { avatarData } = useUserAvatarData();
  const rarity = getOrbRarity(xp.level);
  const rarityLabel = isHe ? rarity.label.he : rarity.label.en;

  const dominantArchetype = profile.computedFrom.dominantArchetype || 'explorer';
  const archetypeName = getArchetypeName(dominantArchetype, isHe);
  const geometry = profile.geometryFamily || 'sphere';
  const material = profile.materialType || 'glass';

  // DNA traits
  const dnaTraits = Object.entries(dna.dnaTraits)
    .map(([k, v]) => ({ key: k.replace(/^(value:|skill:)/, ''), weight: v }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  const serial = String(xp.experience).padStart(5, '0');

  // RPG names for avatar equipment
  const RPG_NAMES: Record<string, { en: string; he: string; icon: React.ReactNode }> = {
    Head: { en: 'Skull Form', he: 'צורת גולגולת', icon: <Crown className="w-3 h-3" /> },
    Hair: { en: 'Mane of Valor', he: 'רעמת גבורה', icon: <Sparkles className="w-3 h-3" /> },
    Face: { en: 'War Paint', he: 'ציור מלחמה', icon: <Shield className="w-3 h-3" /> },
    Eyes: { en: 'Eyes of Sight', he: 'עיני הראייה', icon: <Eye className="w-3 h-3" /> },
    Eyebrow: { en: 'Brow Mark', he: 'סימן הגבה', icon: <Activity className="w-3 h-3" /> },
    Nose: { en: 'Nose Guard', he: 'מגן האף', icon: <Shield className="w-3 h-3" /> },
    'Facial Hair': { en: 'Beard of Wisdom', he: 'זקן החוכמה', icon: <Sword className="w-3 h-3" /> },
    Top: { en: 'Chest Armor', he: 'שריון חזה', icon: <Shirt className="w-3 h-3" /> },
    Bottom: { en: 'Leg Guards', he: 'מגני רגליים', icon: <Shield className="w-3 h-3" /> },
    Shoes: { en: 'Battle Boots', he: 'מגפי קרב', icon: <Footprints className="w-3 h-3" /> },
    Glasses: { en: 'Vision Lens', he: 'עדשת חזון', icon: <Eye className="w-3 h-3" /> },
    Hat: { en: 'Helm of Power', he: 'קסדת כוח', icon: <Crown className="w-3 h-3" /> },
    Earring: { en: 'Rune Earring', he: 'עגיל רון', icon: <Sparkles className="w-3 h-3" /> },
    Bow: { en: 'Spirit Bow', he: 'פפיון רוח', icon: <Sparkles className="w-3 h-3" /> },
    Outfit: { en: 'Full Regalia', he: 'מלבוש מלא', icon: <Shirt className="w-3 h-3" /> },
  };

  // Only show wearables (not body parts like Head, Face, Eyes, Nose, Eyebrow)
  const WEARABLE_SLOTS = ['Hair', 'Facial Hair', 'Top', 'Bottom', 'Shoes', 'Glasses', 'Hat', 'Earring', 'Bow', 'Outfit'];

  const equippedItems = useMemo(() => {
    if (!avatarData) return [];
    return AVATAR_CATEGORIES
      .filter(cat => WEARABLE_SLOTS.includes(cat.name) && avatarData[cat.name]?.assetId)
      .map(cat => {
        const saved = avatarData[cat.name];
        const asset = cat.assets.find(a => a.id === saved?.assetId);
        const rpg = RPG_NAMES[cat.name];
        return {
          categoryName: cat.name,
          assetName: asset?.name || cat.name,
          rpgName: rpg ? (isHe ? rpg.he : rpg.en) : cat.name,
          icon: rpg?.icon || <Shield className="w-3 h-3" />,
          color: saved?.color,
        };
      });
  }, [avatarData, isHe]);

  // Orb visual properties for display
  const orbProps = [
    { key: 'shape', label: isHe ? 'צורה' : 'Shape', value: geometry, color: `hsl(${rarity.color})` },
    { key: 'material', label: isHe ? 'חומר' : 'Material', value: material, color: '#A855F7' },
    { key: 'morph', label: isHe ? 'עיוות' : 'Morph', value: `${Math.round((profile.morphIntensity || 0.5) * 100)}%`, color: '#06B6D4' },
    { key: 'speed', label: isHe ? 'מהירות' : 'Speed', value: `${Math.round((profile.morphSpeed || 0.5) * 100)}%`, color: '#22C55E' },
    { key: 'core', label: isHe ? 'ליבה' : 'Core', value: `${Math.round((profile.coreIntensity || 0.5) * 100)}%`, color: '#F59E0B' },
    { key: 'layers', label: isHe ? 'שכבות' : 'Layers', value: `${profile.layerCount || 3}`, color: '#EC4899' },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-2.5">
        <NFTTile
          label="AION"
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
        title="AION"
        subtitle={isHe ? 'הגוף הויזואלי שלך' : 'Your Visual Body'}
        rarity={rarityLabel}
        rarityColor={rarity.color}
        serial={serial}
        largeVisual
        description={isHe
          ? 'לחץ על מאפיין כדי לחקור אותו'
          : 'Tap a property to explore it'}
        visual={<PersonalizedOrb size={200} state="breathing" showGlow={false} />}
        stats={[]}
        traits={[]}
      >
        {/* Orb properties as clickable dots */}
        <div className="w-full grid grid-cols-3 gap-1.5">
          {orbProps.map((p, i) => (
            <motion.button
              key={p.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
            >
              <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-[10px] font-bold text-white/80 capitalize">{p.value}</span>
              <span className="text-[8px] text-white/35 uppercase tracking-wider">{p.label}</span>
            </motion.button>
          ))}
        </div>
      </NFTDetailCard>

      {/* ── AVATAR Detail Card ── */}
      <NFTDetailCard
        open={activeCard === 'avatar'}
        onClose={() => { setActiveCard(null); setSelectedSlot(null); }}
        type="avatar"
        title={isHe ? 'אווטאר 3D' : '3D Avatar'}
        subtitle={isHe ? 'הדמות שלך בעולם' : 'Your In-World Character'}
        rarity={rarityLabel}
        rarityColor="35 80% 50%"
        serial={serial}
        largeVisual
        visual={<AvatarMiniPreview size={200} />}
        stats={[]}
        traits={[]}
      >
        {/* Equipment grid — 3 columns like AION card */}
        <div className="w-full">
          <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold text-center mb-2">
            {isHe ? 'ציוד' : 'Equipment'}
          </p>
          <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
            {equippedItems.map((item, i) => (
              <motion.button
                key={item.categoryName}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                onClick={() => setSelectedSlot(selectedSlot === item.categoryName ? null : item.categoryName)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all",
                  selectedSlot === item.categoryName
                    ? "bg-white/[0.08] border-amber-500/30"
                    : "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08]"
                )}
              >
                {item.color ? (
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                ) : (
                  <span className="text-amber-400/70">{item.icon}</span>
                )}
                <span className="text-[10px] font-bold text-white/80 truncate w-full text-center">{item.rpgName}</span>
                <span className="text-[8px] text-white/35 uppercase tracking-wider">{item.categoryName}</span>
              </motion.button>
            ))}
            {equippedItems.length === 0 && (
              <p className="text-[10px] text-white/30 text-center py-3 col-span-3">
                {isHe ? 'לא נמצא ציוד' : 'No equipment found'}
              </p>
            )}
          </div>
        </div>
      </NFTDetailCard>

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
