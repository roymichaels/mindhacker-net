/**
 * OrbGallery – NFT-style collection gallery with trait-based filtering.
 * Shows all orb archetypes organized by traits (Material, Pattern, Geometry, etc.)
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Orb } from '@/components/orb/Orb';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, ArrowRight, Filter, X, Sparkles, Dna, Crown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ORB_PRESETS, type OrbPreset } from '@/lib/orbPresets';
import type { OrbProfile, MaterialType, PatternType, GeometryFamily } from '@/components/orb/types';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/* ─── Extended orb collection ─── */

function p(overrides: Partial<OrbProfile>): OrbProfile {
  return { ...DEFAULT_ORB_PROFILE, particleEnabled: false, particleCount: 0, ...overrides };
}

interface GalleryOrb {
  id: string;
  nameEn: string;
  nameHe: string;
  descEn: string;
  descHe: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  traits: {
    material: MaterialType;
    pattern: PatternType;
    geometry: GeometryFamily;
    glow: 'none' | 'soft' | 'medium' | 'intense' | 'cosmic';
    particles: boolean;
  };
  profile: OrbProfile;
}

const RARITY_COLORS: Record<string, string> = {
  common: '210 15% 55%',
  uncommon: '140 50% 45%',
  rare: '220 75% 55%',
  epic: '275 70% 55%',
  legendary: '45 90% 55%',
};

const RARITY_LABELS = {
  common: { en: 'Common', he: 'נפוץ' },
  uncommon: { en: 'Uncommon', he: 'לא שכיח' },
  rare: { en: 'Rare', he: 'נדיר' },
  epic: { en: 'Epic', he: 'אפי' },
  legendary: { en: 'Legendary', he: 'אגדי' },
};

// Map existing presets + add new ones
const GALLERY_ORBS: GalleryOrb[] = [
  // === From existing ORB_PRESETS ===
  {
    id: 'abyss-glass', nameEn: 'Abyss Glass', nameHe: 'זכוכית התהום',
    descEn: 'Born from deep introspection', descHe: 'נולד מהתבוננות עמוקה',
    rarity: 'rare',
    traits: { material: 'glass', pattern: 'cellular', geometry: 'sphere', glow: 'medium', particles: false },
    profile: ORB_PRESETS.find(p => p.id === 'abyss-glass')!.profile,
  },
  {
    id: 'solar-metal', nameEn: 'Solar Metal', nameHe: 'מתכת השמש',
    descEn: 'Forged by ambition and drive', descHe: 'מחושל על ידי שאיפה ודחף',
    rarity: 'epic',
    traits: { material: 'metal', pattern: 'shards', geometry: 'octa', glow: 'soft', particles: false },
    profile: ORB_PRESETS.find(p => p.id === 'solar-metal')!.profile,
  },
  {
    id: 'violet-iridescence', nameEn: 'Violet Iridescence', nameHe: 'זוהר סגול',
    descEn: 'Reflects creative vision', descHe: 'משקף חזון יצירתי',
    rarity: 'legendary',
    traits: { material: 'iridescent', pattern: 'voronoi', geometry: 'dodeca', glow: 'cosmic', particles: true },
    profile: ORB_PRESETS.find(p => p.id === 'violet-iridescence')!.profile,
  },
  {
    id: 'jade-nexus', nameEn: 'Jade Nexus', nameHe: 'נקודת הירקן',
    descEn: 'Crystalline core of growth', descHe: 'ליבה קריסטלית של צמיחה',
    rarity: 'rare',
    traits: { material: 'glass', pattern: 'swirl', geometry: 'spiky', glow: 'medium', particles: false },
    profile: ORB_PRESETS.find(p => p.id === 'jade-nexus')!.profile,
  },
  {
    id: 'arctic-stone', nameEn: 'Arctic Stone', nameHe: 'אבן ארקטית',
    descEn: 'Quiet resilience carved from patience', descHe: 'חוסן שקט שנחצב מסבלנות',
    rarity: 'common',
    traits: { material: 'metal', pattern: 'strata', geometry: 'icosa', glow: 'none', particles: false },
    profile: ORB_PRESETS.find(p => p.id === 'arctic-stone')!.profile,
  },
  {
    id: 'midnight-prism', nameEn: 'Midnight Prism', nameHe: 'פריזמת חצות',
    descEn: 'Refracts hidden dimensions', descHe: 'שובר ממדים נסתרים',
    rarity: 'epic',
    traits: { material: 'iridescent', pattern: 'fractal', geometry: 'torus', glow: 'intense', particles: false },
    profile: ORB_PRESETS.find(p => p.id === 'midnight-prism')!.profile,
  },
  {
    id: 'rose-quartz', nameEn: 'Rose Quartz', nameHe: 'קוורץ ורוד',
    descEn: 'Gentle power of empathy', descHe: 'כוח עדין של אמפתיה',
    rarity: 'uncommon',
    traits: { material: 'glass', pattern: 'voronoi', geometry: 'sphere', glow: 'soft', particles: false },
    profile: ORB_PRESETS.find(p => p.id === 'rose-quartz')!.profile,
  },
  {
    id: 'obsidian-wire', nameEn: 'Obsidian Wire', nameHe: 'שלד אובסידיאן',
    descEn: 'The skeleton of raw potential', descHe: 'השלד של פוטנציאל גולמי',
    rarity: 'uncommon',
    traits: { material: 'wire', pattern: 'shards', geometry: 'octa', glow: 'none', particles: false },
    profile: ORB_PRESETS.find(p => p.id === 'obsidian-wire')!.profile,
  },
  {
    id: 'aurora-skin', nameEn: 'Aurora Skin', nameHe: 'עור אורורה',
    descEn: 'Ever-shifting like northern lights', descHe: 'משתנה כמו הזוהר הצפוני',
    rarity: 'legendary',
    traits: { material: 'iridescent', pattern: 'cellular', geometry: 'dodeca', glow: 'cosmic', particles: true },
    profile: ORB_PRESETS.find(p => p.id === 'aurora-skin')!.profile,
  },
  {
    id: 'sunset-marble', nameEn: 'Sunset Marble', nameHe: 'שיש שקיעה',
    descEn: 'Warmth of experience etched in stone', descHe: 'חום הניסיון חרוט באבן',
    rarity: 'rare',
    traits: { material: 'metal', pattern: 'strata', geometry: 'icosa', glow: 'soft', particles: false },
    profile: ORB_PRESETS.find(p => p.id === 'sunset-marble')!.profile,
  },
  // === NEW orbs — expanding the collection ===
  {
    id: 'phantom-plasma', nameEn: 'Phantom Plasma', nameHe: 'פלזמת רוח',
    descEn: 'Ethereal energy from beyond the veil', descHe: 'אנרגיה אתרית מעבר למסך',
    rarity: 'epic',
    traits: { material: 'plasma', pattern: 'fractal', geometry: 'sphere', glow: 'intense', particles: true },
    profile: p({
      materialType: 'plasma', gradientMode: 'noise', patternType: 'fractal', geometryFamily: 'sphere',
      bloomStrength: 0.85, chromaShift: 0.45,
      gradientStops: ['180 60% 30%', '200 70% 45%', '240 65% 55%', '280 55% 65%'],
      coreGradient: ['180 60% 30%', '240 65% 55%'],
      rimLightColor: '280 55% 65%', primaryColor: '200 70% 45%',
      secondaryColors: ['180 60% 30%', '240 65% 55%'], accentColor: '280 55% 65%',
      materialParams: { metalness: 0.1, roughness: 0.1, clearcoat: 0.7, transmission: 0.4, ior: 1.8, emissiveIntensity: 0.4 },
      morphIntensity: 0.7, morphSpeed: 1.0, motionSpeed: 1.1, patternIntensity: 0.5,
      particleEnabled: true, particleCount: 12,
    }),
  },
  {
    id: 'crimson-forge', nameEn: 'Crimson Forge', nameHe: 'כור ארגמן',
    descEn: 'Tempered in fire, unbreakable will', descHe: 'מחושל באש, רצון בלתי שביר',
    rarity: 'rare',
    traits: { material: 'metal', pattern: 'shards', geometry: 'spiky', glow: 'medium', particles: false },
    profile: p({
      materialType: 'metal', gradientMode: 'rim', patternType: 'shards', geometryFamily: 'spiky',
      bloomStrength: 0.5, chromaShift: 0.1,
      gradientStops: ['0 70% 30%', '10 80% 45%', '25 75% 55%', '40 60% 65%'],
      coreGradient: ['0 70% 30%', '25 75% 55%'],
      rimLightColor: '40 60% 65%', primaryColor: '10 80% 45%',
      secondaryColors: ['0 70% 30%', '25 75% 55%'], accentColor: '40 60% 65%',
      materialParams: { metalness: 0.8, roughness: 0.3, clearcoat: 0.4, transmission: 0.0, ior: 1.5, emissiveIntensity: 0.2 },
      morphIntensity: 0.4, morphSpeed: 0.6, motionSpeed: 0.7, patternIntensity: 0.6,
    }),
  },
  {
    id: 'void-crystal', nameEn: 'Void Crystal', nameHe: 'קריסטל ריק',
    descEn: 'The silence between thoughts', descHe: 'השקט שבין המחשבות',
    rarity: 'uncommon',
    traits: { material: 'glass', pattern: 'fractal', geometry: 'dodeca', glow: 'soft', particles: false },
    profile: p({
      materialType: 'glass', gradientMode: 'radial', patternType: 'fractal', geometryFamily: 'dodeca',
      bloomStrength: 0.3, chromaShift: 0.08,
      gradientStops: ['240 20% 15%', '260 30% 25%', '220 25% 35%'],
      coreGradient: ['240 20% 15%', '220 25% 35%'],
      rimLightColor: '220 25% 40%', primaryColor: '260 30% 25%',
      secondaryColors: ['240 20% 15%', '220 25% 35%'], accentColor: '220 25% 40%',
      materialParams: { metalness: 0.05, roughness: 0.2, clearcoat: 0.6, transmission: 0.5, ior: 1.7, emissiveIntensity: 0.1 },
      morphIntensity: 0.25, morphSpeed: 0.4, motionSpeed: 0.5, patternIntensity: 0.4,
    }),
  },
  {
    id: 'neon-pulse', nameEn: 'Neon Pulse', nameHe: 'פולס ניאון',
    descEn: 'Electric current flows through digital veins', descHe: 'זרם חשמלי זורם בוורידים דיגיטליים',
    rarity: 'rare',
    traits: { material: 'wire', pattern: 'cellular', geometry: 'torus', glow: 'intense', particles: true },
    profile: p({
      materialType: 'wire', gradientMode: 'noise', patternType: 'cellular', geometryFamily: 'torus',
      bloomStrength: 0.75, chromaShift: 0.35,
      gradientStops: ['160 90% 50%', '180 85% 55%', '200 80% 60%'],
      coreGradient: ['160 90% 50%', '200 80% 60%'],
      rimLightColor: '180 85% 65%', primaryColor: '160 90% 50%',
      secondaryColors: ['180 85% 55%', '200 80% 60%'], accentColor: '180 85% 65%',
      materialParams: { metalness: 0.2, roughness: 0.3, clearcoat: 0.4, transmission: 0.1, ior: 1.5, emissiveIntensity: 0.5 },
      morphIntensity: 0.5, morphSpeed: 0.9, motionSpeed: 1.0, patternIntensity: 0.55,
      particleEnabled: true, particleCount: 8,
    }),
  },
  {
    id: 'desert-ember', nameEn: 'Desert Ember', nameHe: 'גחלת מדבר',
    descEn: 'Ancient warmth buried in sand', descHe: 'חום עתיק טמון בחול',
    rarity: 'common',
    traits: { material: 'metal', pattern: 'strata', geometry: 'sphere', glow: 'none', particles: false },
    profile: p({
      materialType: 'metal', gradientMode: 'vertical', patternType: 'strata', geometryFamily: 'sphere',
      bloomStrength: 0.15, chromaShift: 0.0,
      gradientStops: ['30 50% 35%', '25 45% 45%', '20 40% 55%'],
      coreGradient: ['30 50% 35%', '20 40% 55%'],
      rimLightColor: '20 40% 60%', primaryColor: '25 45% 45%',
      secondaryColors: ['30 50% 35%', '20 40% 55%'], accentColor: '20 40% 60%',
      materialParams: { metalness: 0.5, roughness: 0.6, clearcoat: 0.1, transmission: 0.0, ior: 1.5, emissiveIntensity: 0.05 },
      morphIntensity: 0.15, morphSpeed: 0.3, motionSpeed: 0.4, patternIntensity: 0.5,
    }),
  },
  {
    id: 'nebula-heart', nameEn: 'Nebula Heart', nameHe: 'לב ערפילית',
    descEn: 'A star nursery lives within', descHe: 'חממת כוכבים חיה בפנים',
    rarity: 'legendary',
    traits: { material: 'plasma', pattern: 'swirl', geometry: 'spiky', glow: 'cosmic', particles: true },
    profile: p({
      materialType: 'plasma', gradientMode: 'noise', patternType: 'swirl', geometryFamily: 'spiky',
      bloomStrength: 0.95, chromaShift: 0.6,
      gradientStops: ['320 70% 35%', '340 75% 50%', '10 80% 60%', '30 85% 70%', '50 70% 80%'],
      coreGradient: ['320 70% 35%', '10 80% 60%'],
      rimLightColor: '50 70% 80%', primaryColor: '340 75% 50%',
      secondaryColors: ['320 70% 35%', '10 80% 60%'], accentColor: '50 70% 80%',
      materialParams: { metalness: 0.2, roughness: 0.08, clearcoat: 0.9, transmission: 0.3, ior: 2.0, emissiveIntensity: 0.45 },
      morphIntensity: 0.65, morphSpeed: 1.0, motionSpeed: 1.1, patternIntensity: 0.5,
      particleEnabled: true, particleCount: 20,
    }),
  },
  {
    id: 'frozen-wire', nameEn: 'Frozen Wire', nameHe: 'חוט קפוא',
    descEn: 'Structure laid bare — raw potential', descHe: 'מבנה חשוף — פוטנציאל גולמי',
    rarity: 'common',
    traits: { material: 'wire', pattern: 'shards', geometry: 'icosa', glow: 'none', particles: false },
    profile: p({
      materialType: 'wire', gradientMode: 'vertical', patternType: 'shards', geometryFamily: 'icosa',
      bloomStrength: 0.05, chromaShift: 0.0,
      gradientStops: ['200 15% 40%', '210 20% 50%', '200 15% 60%'],
      coreGradient: ['200 15% 40%', '200 15% 60%'],
      rimLightColor: '200 15% 65%', primaryColor: '210 20% 50%',
      secondaryColors: ['200 15% 40%'], accentColor: '200 15% 65%',
      materialParams: { metalness: 0.1, roughness: 0.6, clearcoat: 0.1, transmission: 0.0, ior: 1.0, emissiveIntensity: 0.02 },
      morphIntensity: 0.1, morphSpeed: 0.2, motionSpeed: 0.3, patternIntensity: 0.4,
    }),
  },
  {
    id: 'emerald-swirl', nameEn: 'Emerald Swirl', nameHe: 'מערבולת אזמרגד',
    descEn: 'Nature\'s spiral — growth unbound', descHe: 'ספירלת הטבע — צמיחה ללא גבולות',
    rarity: 'uncommon',
    traits: { material: 'glass', pattern: 'swirl', geometry: 'sphere', glow: 'soft', particles: false },
    profile: p({
      materialType: 'glass', gradientMode: 'radial', patternType: 'swirl', geometryFamily: 'sphere',
      bloomStrength: 0.35, chromaShift: 0.1,
      gradientStops: ['145 60% 30%', '160 65% 45%', '130 55% 55%'],
      coreGradient: ['145 60% 30%', '130 55% 55%'],
      rimLightColor: '130 55% 60%', primaryColor: '160 65% 45%',
      secondaryColors: ['145 60% 30%', '130 55% 55%'], accentColor: '130 55% 60%',
      materialParams: { metalness: 0.1, roughness: 0.25, clearcoat: 0.5, transmission: 0.3, ior: 1.6, emissiveIntensity: 0.15 },
      morphIntensity: 0.3, morphSpeed: 0.5, motionSpeed: 0.6, patternIntensity: 0.4,
    }),
  },
];

/* ─── Trait definitions ─── */

interface TraitCategory {
  key: string;
  labelEn: string;
  labelHe: string;
  options: { value: string; labelEn: string; labelHe: string }[];
}

const TRAIT_CATEGORIES: TraitCategory[] = [
  {
    key: 'material', labelEn: 'Material', labelHe: 'חומר',
    options: [
      { value: 'glass', labelEn: 'Glass', labelHe: 'זכוכית' },
      { value: 'metal', labelEn: 'Metal', labelHe: 'מתכת' },
      { value: 'iridescent', labelEn: 'Iridescent', labelHe: 'אופלסנט' },
      { value: 'plasma', labelEn: 'Plasma', labelHe: 'פלזמה' },
      { value: 'wire', labelEn: 'Wire', labelHe: 'שלד' },
    ],
  },
  {
    key: 'pattern', labelEn: 'Pattern', labelHe: 'דפוס',
    options: [
      { value: 'voronoi', labelEn: 'Voronoi', labelHe: 'וורונוי' },
      { value: 'cellular', labelEn: 'Cellular', labelHe: 'תאי' },
      { value: 'fractal', labelEn: 'Fractal', labelHe: 'פרקטלי' },
      { value: 'shards', labelEn: 'Shards', labelHe: 'רסיסים' },
      { value: 'swirl', labelEn: 'Swirl', labelHe: 'מערבולת' },
      { value: 'strata', labelEn: 'Strata', labelHe: 'שכבות' },
    ],
  },
  {
    key: 'geometry', labelEn: 'Shape', labelHe: 'צורה',
    options: [
      { value: 'sphere', labelEn: 'Sphere', labelHe: 'כדור' },
      { value: 'dodeca', labelEn: 'Dodeca', labelHe: 'דודקהדרון' },
      { value: 'icosa', labelEn: 'Icosa', labelHe: 'איקוסהדרון' },
      { value: 'octa', labelEn: 'Octa', labelHe: 'אוקטהדרון' },
      { value: 'torus', labelEn: 'Torus', labelHe: 'טורוס' },
      { value: 'spiky', labelEn: 'Spiky', labelHe: 'קוצני' },
    ],
  },
  {
    key: 'glow', labelEn: 'Glow', labelHe: 'זוהר',
    options: [
      { value: 'none', labelEn: 'None', labelHe: 'ללא' },
      { value: 'soft', labelEn: 'Soft', labelHe: 'רך' },
      { value: 'medium', labelEn: 'Medium', labelHe: 'בינוני' },
      { value: 'intense', labelEn: 'Intense', labelHe: 'אינטנסיבי' },
      { value: 'cosmic', labelEn: 'Cosmic', labelHe: 'קוסמי' },
    ],
  },
  {
    key: 'rarity', labelEn: 'Rarity', labelHe: 'נדירות',
    options: [
      { value: 'common', labelEn: 'Common', labelHe: 'נפוץ' },
      { value: 'uncommon', labelEn: 'Uncommon', labelHe: 'לא שכיח' },
      { value: 'rare', labelEn: 'Rare', labelHe: 'נדיר' },
      { value: 'epic', labelEn: 'Epic', labelHe: 'אפי' },
      { value: 'legendary', labelEn: 'Legendary', labelHe: 'אגדי' },
    ],
  },
];

export default function OrbGalleryPage() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isHe = isRTL;

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrb, setSelectedOrb] = useState<GalleryOrb | null>(null);

  const activeFilterCount = Object.keys(filters).length;

  const filteredOrbs = useMemo(() => {
    return GALLERY_ORBS.filter(orb => {
      for (const [key, value] of Object.entries(filters)) {
        if (key === 'rarity') {
          if (orb.rarity !== value) return false;
        } else {
          if ((orb.traits as any)[key] !== value) return false;
        }
      }
      return true;
    });
  }, [filters]);

  const toggleFilter = (key: string, value: string) => {
    setFilters(prev => {
      if (prev[key] === value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const clearFilters = () => setFilters({});

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />

      <main className="relative pt-20 pb-16">
        {/* Hero */}
        <div className="max-w-6xl mx-auto px-4 text-center mb-10">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            {isHe ? 'חזרה לדף הבית' : 'Back to Home'}
          </button>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Dna className="w-5 h-5 text-primary" />
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold">
              {isHe ? 'אוסף האורבים' : 'Orb Collection'}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-3">
            {isHe ? 'גלריית ה-Orbs' : 'Orb Gallery'}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            {isHe
              ? `${GALLERY_ORBS.length} ארכיטיפים ייחודיים. סנן לפי חומר, דפוס, צורה, זוהר ונדירות.`
              : `${GALLERY_ORBS.length} unique archetypes. Filter by material, pattern, shape, glow and rarity.`}
          </p>
        </div>

        {/* Filter bar */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full text-xs"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              {isHe ? 'סינון תכונות' : 'Filter Traits'}
              {activeFilterCount > 0 && (
                <span className="ml-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" />
                {isHe ? 'נקה הכל' : 'Clear all'}
              </button>
            )}
            <span className="text-xs text-muted-foreground mr-auto">
              {filteredOrbs.length} / {GALLERY_ORBS.length}
            </span>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 p-4 rounded-2xl bg-card/60 border border-border/30 backdrop-blur-sm mb-6">
                  {TRAIT_CATEGORIES.map(cat => (
                    <div key={cat.key}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        {isHe ? cat.labelHe : cat.labelEn}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.options.map(opt => {
                          const active = filters[cat.key] === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => toggleFilter(cat.key, opt.value)}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                                active
                                  ? 'bg-primary/15 border-primary/50 text-primary'
                                  : 'bg-muted/30 border-border/30 text-muted-foreground hover:border-border hover:text-foreground'
                              )}
                            >
                              {isHe ? opt.labelHe : opt.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-4">
          <div className={cn(
            'grid gap-4',
            isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4'
          )}>
            <AnimatePresence mode="popLayout">
              {filteredOrbs.map((orb, i) => {
                const rarityColor = RARITY_COLORS[orb.rarity];
                return (
                  <motion.div
                    key={orb.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    onClick={() => setSelectedOrb(orb)}
                    className={cn(
                      'relative rounded-2xl bg-card/70 border border-border/30 backdrop-blur-sm',
                      'cursor-pointer hover:border-primary/30 transition-all duration-300 hover:shadow-lg',
                      'flex flex-col items-center p-4 group'
                    )}
                  >
                    {/* Rarity badge */}
                    <span
                      className="absolute top-2.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `hsl(${rarityColor} / 0.12)`,
                        color: `hsl(${rarityColor})`,
                        border: `1px solid hsl(${rarityColor} / 0.25)`,
                        [isRTL ? 'left' : 'right']: '8px',
                      }}
                    >
                      {isHe ? RARITY_LABELS[orb.rarity].he : RARITY_LABELS[orb.rarity].en}
                    </span>

                    {/* Orb */}
                    <div className="w-full aspect-square flex items-center justify-center my-2 group-hover:scale-105 transition-transform duration-300">
                      <Orb
                        profile={orb.profile}
                        size={isMobile ? 100 : 130}
                        state="idle"
                        renderer="webgl"
                        showGlow={orb.traits.glow !== 'none'}
                      />
                    </div>

                    {/* Name */}
                    <h3 className="text-xs md:text-sm font-bold text-foreground text-center mt-1">
                      {isHe ? orb.nameHe : orb.nameEn}
                    </h3>
                    <p className="text-[10px] text-muted-foreground text-center mt-0.5 line-clamp-1">
                      {isHe ? orb.descHe : orb.descEn}
                    </p>

                    {/* Trait pills */}
                    <div className="flex flex-wrap gap-1 justify-center mt-2">
                      {[orb.traits.material, orb.traits.geometry].map(t => (
                        <span key={t} className="text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground capitalize">
                          {t}
                        </span>
                      ))}
                      {orb.traits.particles && (
                        <span className="text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredOrbs.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">{isHe ? 'לא נמצאו אורבים' : 'No orbs found'}</p>
              <p className="text-sm mt-1">{isHe ? 'נסה לשנות את הסינון' : 'Try adjusting your filters'}</p>
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 rounded-full">
                {isHe ? 'נקה סינון' : 'Clear Filters'}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedOrb && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedOrb(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-sm bg-card border border-border/50 rounded-2xl p-6 shadow-2xl"
            >
              <button
                onClick={() => setSelectedOrb(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center">
                {/* Rarity */}
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
                  style={{
                    backgroundColor: `hsl(${RARITY_COLORS[selectedOrb.rarity]} / 0.12)`,
                    color: `hsl(${RARITY_COLORS[selectedOrb.rarity]})`,
                    border: `1px solid hsl(${RARITY_COLORS[selectedOrb.rarity]} / 0.3)`,
                  }}
                >
                  {isHe ? RARITY_LABELS[selectedOrb.rarity].he : RARITY_LABELS[selectedOrb.rarity].en}
                </span>

                {/* Orb */}
                <Orb
                  profile={selectedOrb.profile}
                  size={180}
                  state="breathing"
                  renderer="webgl"
                  showGlow
                />

                <h2 className="text-xl font-black text-foreground mt-4">
                  {isHe ? selectedOrb.nameHe : selectedOrb.nameEn}
                </h2>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  {isHe ? selectedOrb.descHe : selectedOrb.descEn}
                </p>

                {/* Traits grid */}
                <div className="grid grid-cols-2 gap-2 mt-5 w-full">
                  {Object.entries(selectedOrb.traits).map(([key, val]) => {
                    const cat = TRAIT_CATEGORIES.find(c => c.key === key);
                    const label = cat ? (isHe ? cat.labelHe : cat.labelEn) : key;
                    const displayVal = typeof val === 'boolean'
                      ? (val ? (isHe ? 'כן' : 'Yes') : (isHe ? 'לא' : 'No'))
                      : String(val);
                    return (
                      <div key={key} className="flex flex-col items-center p-2 rounded-lg bg-muted/30 border border-border/20">
                        <span className="text-[10px] text-muted-foreground">{label}</span>
                        <span className="text-xs font-bold text-foreground capitalize">{displayVal}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Colors */}
                <div className="mt-4 w-full">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 text-center">
                    {isHe ? 'צבעים' : 'Colors'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {[selectedOrb.profile.primaryColor, ...(selectedOrb.profile.secondaryColors || []), selectedOrb.profile.accentColor]
                      .filter(Boolean)
                      .slice(0, 5)
                      .map((c, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-border/30 shadow-sm"
                          style={{ backgroundColor: `hsl(${c})` }}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
