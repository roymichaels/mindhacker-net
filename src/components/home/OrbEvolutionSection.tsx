/**
 * OrbEvolutionSection – Showcases the evolution of the Violet Iridescence orb
 * across 5 dramatically different phases from Level 1 → 100.
 * Each phase shows increasing morph shape count (1→2→3→4→5).
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles, Zap, Flame, Crown, Star, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OrbProfile } from '@/components/orb/types';
import { ORB_PRESETS } from '@/lib/orbPresets';
import { getShapeCountForLevel } from '@/components/orb/GalleryMorphOrb';
import { CSSGalleryOrb } from '@/components/orb/CSSGalleryOrb';

// Get the actual violet-iridescence preset as our Lv100 target
const VIOLET_PRESET = ORB_PRESETS.find(p => p.id === 'violet-iridescence')!;
const FINAL = VIOLET_PRESET.profile;

interface EvolutionPhase {
  level: number;
  nameEn: string;
  nameHe: string;
  subtitleEn: string;
  subtitleHe: string;
  changesEn: string[];
  changesHe: string[];
  icon: React.ElementType;
  accentHsl: string;
  profile: OrbProfile;
}

const PHASES: EvolutionPhase[] = [
  {
    level: 1,
    nameEn: 'Seed',
    nameHe: 'זרע',
    subtitleEn: 'A dim flicker — potential waiting to ignite',
    subtitleHe: 'הבהוב עמום — פוטנציאל שמחכה להתלקח',
    icon: Star,
    accentHsl: '270 25% 35%',
    changesEn: ['Single static shape', 'Flat gray-violet monochrome', 'No glow, no particles', 'Barely visible pulse'],
    changesHe: ['צורה סטטית אחת', 'מונוכרום אפור-סגול שטוח', 'ללא זוהר, ללא חלקיקים', 'פעימה כמעט בלתי נראית'],
    profile: {
      ...FINAL,
      materialType: 'wire',
      gradientMode: 'vertical',
      patternType: 'strata',
      geometryFamily: 'sphere',
      bloomStrength: 0.0,
      chromaShift: 0.0,
      gradientStops: ['270 10% 25%', '270 15% 30%'],
      coreGradient: ['270 10% 25%', '270 15% 30%'],
      rimLightColor: '270 10% 35%',
      primaryColor: '270 15% 28%',
      secondaryColors: ['270 10% 25%'],
      accentColor: '270 10% 35%',
      materialParams: { metalness: 0.0, roughness: 0.8, clearcoat: 0.0, transmission: 0.0, ior: 1.0, emissiveIntensity: 0.0 },
      morphIntensity: 0.05,
      morphSpeed: 0.15,
      motionSpeed: 0.2,
      patternIntensity: 0.0,
      layerCount: 1,
      coreIntensity: 0.15,
      particleEnabled: false,
      particleCount: 0,
    },
  },
  {
    level: 25,
    nameEn: 'Bloom',
    nameHe: 'פריחה',
    subtitleEn: 'First colors emerge — 2 shapes morph smoothly',
    subtitleHe: 'צבעים ראשונים צצים — 2 צורות מתחלפות בחלקות',
    icon: Sparkles,
    accentHsl: '275 50% 45%',
    changesEn: ['Morphs between 2 shapes', 'Glass material unlocked', 'Soft inner glow begins', 'Dual-violet gradient appears'],
    changesHe: ['מתחלף בין 2 צורות', 'חומר זכוכית נפתח', 'זוהר פנימי רך מתחיל', 'גרדיאנט סגול כפול מופיע'],
    profile: {
      ...FINAL,
      materialType: 'glass',
      gradientMode: 'radial',
      patternType: 'cellular',
      geometryFamily: 'icosa',
      bloomStrength: 0.2,
      chromaShift: 0.05,
      gradientStops: ['265 40% 28%', '275 50% 40%', '280 45% 50%'],
      coreGradient: ['265 40% 28%', '280 45% 50%'],
      rimLightColor: '280 45% 55%',
      primaryColor: '275 50% 40%',
      secondaryColors: ['265 40% 28%', '280 45% 50%'],
      accentColor: '280 45% 55%',
      materialParams: { metalness: 0.05, roughness: 0.45, clearcoat: 0.3, transmission: 0.1, ior: 1.3, emissiveIntensity: 0.1 },
      morphIntensity: 0.2,
      morphSpeed: 0.35,
      motionSpeed: 0.4,
      patternIntensity: 0.15,
      layerCount: 2,
      coreIntensity: 0.35,
      particleEnabled: false,
      particleCount: 0,
    },
  },
  {
    level: 50,
    nameEn: 'Radiance',
    nameHe: 'קרינה',
    subtitleEn: 'The inner light breaks through — 3 shape transitions',
    subtitleHe: 'האור הפנימי פורץ — 3 מעברי צורה',
    icon: Zap,
    accentHsl: '290 65% 55%',
    changesEn: ['Morphs between 3 shapes', 'Plasma material with clearcoat', 'Pink-violet spectrum expands', 'First particles orbit'],
    changesHe: ['מתחלף בין 3 צורות', 'חומר פלזמה עם ציפוי', 'ספקטרום ורוד-סגול מתרחב', 'חלקיקים ראשונים מקיפים'],
    profile: {
      ...FINAL,
      materialType: 'plasma',
      gradientMode: 'noise',
      patternType: 'voronoi',
      geometryFamily: 'octa',
      bloomStrength: 0.5,
      chromaShift: 0.2,
      gradientStops: ['260 55% 30%', '275 65% 45%', '300 60% 55%', '320 50% 60%'],
      coreGradient: ['260 55% 30%', '300 60% 55%'],
      rimLightColor: '320 50% 60%',
      primaryColor: '275 65% 45%',
      secondaryColors: ['260 55% 30%', '300 60% 55%'],
      accentColor: '320 50% 60%',
      materialParams: { metalness: 0.15, roughness: 0.25, clearcoat: 0.55, transmission: 0.15, ior: 1.6, emissiveIntensity: 0.25 },
      morphIntensity: 0.35,
      morphSpeed: 0.6,
      motionSpeed: 0.7,
      patternIntensity: 0.3,
      layerCount: 3,
      coreIntensity: 0.55,
      particleEnabled: true,
      particleCount: 6,
    },
  },
  {
    level: 75,
    nameEn: 'Ascension',
    nameHe: 'עלייה',
    subtitleEn: 'Power cascades — 4 fractal shape shifts',
    subtitleHe: 'הכוח מתפרץ — 4 מעברי צורה פרקטליים',
    icon: Flame,
    accentHsl: '310 70% 60%',
    changesEn: ['Morphs between 4 shapes', 'Iridescent material shimmers', 'Full 5-color cosmic spectrum', 'Dense particle constellation'],
    changesHe: ['מתחלף בין 4 צורות', 'חומר אופלסנטי מנצנץ', 'ספקטרום קוסמי של 5 צבעים', 'קונסטלציית חלקיקים צפופה'],
    profile: {
      ...FINAL,
      materialType: 'iridescent',
      gradientMode: 'noise',
      patternType: 'voronoi',
      geometryFamily: 'spiky',
      bloomStrength: 0.75,
      chromaShift: 0.4,
      gradientStops: ['258 68% 32%', '275 76% 48%', '300 72% 58%', '320 65% 68%', '345 50% 78%'],
      coreGradient: ['258 68% 32%', '300 72% 58%'],
      rimLightColor: '320 65% 68%',
      primaryColor: '275 76% 48%',
      secondaryColors: ['258 68% 32%', '300 72% 58%'],
      accentColor: '320 65% 68%',
      materialParams: { metalness: 0.28, roughness: 0.12, clearcoat: 0.82, transmission: 0.28, ior: 1.9, emissiveIntensity: 0.35 },
      morphIntensity: 0.55,
      morphSpeed: 0.8,
      motionSpeed: 0.95,
      patternIntensity: 0.42,
      layerCount: 5,
      coreIntensity: 0.8,
      particleEnabled: true,
      particleCount: 16,
    },
  },
  {
    level: 100,
    nameEn: 'Transcendence',
    nameHe: 'התעלות',
    subtitleEn: 'The orb reaches its ultimate form — 5 shapes in perpetual flux',
    subtitleHe: 'הכדור מגיע לצורתו הסופית — 5 צורות בתנועה נצחית',
    icon: Crown,
    accentHsl: '320 80% 65%',
    changesEn: ['Morphs between 5 shapes', 'Maximum bloom & chroma-shift', 'Full particle aurora halo', 'Living, breathing digital soul'],
    changesHe: ['מתחלף בין 5 צורות', 'זוהר והסטת כרומה מקסימליים', 'הילת חלקיקים מלאה', 'נשמה דיגיטלית חיה ונושמת'],
    profile: {
      ...FINAL,
      particleEnabled: true,
      particleCount: 24,
      layerCount: 6,
      coreIntensity: 0.95,
    },
  },
];

export default function OrbEvolutionSection() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activePhase, setActivePhase] = useState(4); // Start at Lv100 to show the best first
  const isHe = isRTL;
  const phase = PHASES[activePhase];
  const Icon = phase.icon;
  const orbSize = isMobile ? 180 : 260;
  const shapeCount = getShapeCountForLevel(phase.level);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.12] blur-[140px] transition-all duration-1000"
          style={{ backgroundColor: `hsl(${phase.accentHsl})` }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70 mb-2 font-medium">
            {isHe ? 'זוהר סגול — Violet Iridescence' : 'Violet Iridescence'}
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-foreground">
            {isHe ? 'אבולוציית ה-Orb' : 'Orb Evolution'}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            {isHe
              ? 'ככל שאתה מתקדם, ה-Orb שלך מתפתח — כל 25 רמות נפתחת צורה נוספת שהאורב מתחלף אליה בחלקות.'
              : 'As you level up, your Orb evolves — every 25 levels unlocks another shape it smoothly morphs into.'}
          </p>
        </motion.div>

        {/* Phase selector pills */}
        <div className="flex justify-center gap-2 md:gap-3 mb-10 flex-wrap">
          {PHASES.map((p, i) => {
            const PhaseIcon = p.icon;
            const active = i === activePhase;
            return (
              <button
                key={p.level}
                onClick={() => setActivePhase(i)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 border',
                  active
                    ? 'text-foreground shadow-lg'
                    : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border hover:text-foreground'
                )}
                style={active ? {
                  backgroundColor: `hsl(${p.accentHsl} / 0.15)`,
                  borderColor: `hsl(${p.accentHsl} / 0.5)`,
                  boxShadow: `0 0 20px hsl(${p.accentHsl} / 0.15)`,
                } : undefined}
              >
                <PhaseIcon className="w-3.5 h-3.5" />
                <span>Lv {p.level}</span>
              </button>
            );
          })}
        </div>

        {/* Main display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            {/* Orb container — morphing WebGL orb */}
            <div className="relative mb-8">
              {/* Orbit ring */}
              <div
                className="absolute inset-0 rounded-full border transition-all duration-700"
                style={{
                  borderColor: `hsl(${phase.accentHsl} / ${0.1 + activePhase * 0.08})`,
                  transform: `scale(${1.15 + activePhase * 0.03})`,
                }}
              />
                <div
                  className="rounded-full overflow-hidden flex items-center justify-center"
                  style={{ width: orbSize, height: orbSize }}
                >
                  <CSSGalleryOrb
                    size={orbSize}
                    profile={phase.profile}
                    geometryFamily={phase.profile.geometryFamily || 'sphere'}
                    level={phase.level}
                  />
                </div>
            </div>

            {/* Shape count indicator */}
            <div className="flex items-center gap-1.5 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-500',
                    i < shapeCount ? 'scale-100' : 'scale-75 bg-muted-foreground/20'
                  )}
                  style={i < shapeCount ? { backgroundColor: `hsl(${phase.accentHsl})` } : undefined}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">
                {shapeCount} {shapeCount === 1 ? 'shape' : 'shapes'}
              </span>
            </div>

            {/* Phase info */}
            <div className="text-center space-y-3 max-w-md">
              <p className="text-xs text-muted-foreground font-medium">
                {isHe ? `שלב ${activePhase + 1} / 5` : `Phase ${activePhase + 1} / 5`}
              </p>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-2xl md:text-3xl font-black text-foreground">
                  {isHe ? phase.nameHe : phase.nameEn}
                </h3>
                <Icon className="w-6 h-6" style={{ color: `hsl(${phase.accentHsl})` }} />
              </div>
              <p className="text-sm text-muted-foreground">
                {isHe ? phase.subtitleHe : phase.subtitleEn}
              </p>

              {/* Level badge */}
              <div className="flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `hsl(${phase.accentHsl} / 0.12)`,
                    color: `hsl(${phase.accentHsl})`,
                    border: `1px solid hsl(${phase.accentHsl} / 0.3)`,
                  }}
                >
                  LV {phase.level}
                </span>
              </div>
            </div>

            {/* Changes grid */}
            <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-md">
              {(isHe ? phase.changesHe : phase.changesEn).map((change, ci) => (
                <motion.div
                  key={ci}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + ci * 0.08, duration: 0.3 }}
                  className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-card/60 border border-border/30 text-xs text-foreground/80"
                >
                  <span
                    className="mt-0.5 w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${phase.accentHsl})` }}
                  />
                  <span className="leading-relaxed">{change}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="mt-12 max-w-sm mx-auto">
          <div className="flex justify-between text-[10px] text-muted-foreground/60 mb-1.5 font-mono">
            <span>LV 1</span>
            <span>LV 100</span>
          </div>
          <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, hsl(270 25% 35%), hsl(${phase.accentHsl}))` }}
              animate={{ width: `${phase.level}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* CTA — See All Orbs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/orbs')}
            className="rounded-xl px-8 py-5 text-sm font-bold border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all"
          >
            <Eye className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
            {isHe ? 'ראה את כל האורבים' : 'See All Orbs'}
            {isRTL ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
