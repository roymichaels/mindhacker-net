/**
 * OrbEvolutionSection – Showcases the evolution of an orb (זוהר סגול)
 * across 5 phases from Level 1 → 100, highlighting what changes at each stage.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Orb } from '@/components/orb/Orb';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles, Zap, Flame, Crown, Star } from 'lucide-react';
import type { OrbProfile } from '@/components/orb/types';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';

function preset(overrides: Partial<OrbProfile>): OrbProfile {
  return { ...DEFAULT_ORB_PROFILE, particleEnabled: false, particleCount: 0, ...overrides };
}

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
    subtitleEn: 'The spark of creation',
    subtitleHe: 'ניצוץ היצירה',
    icon: Star,
    accentHsl: '275 40% 40%',
    changesEn: ['Basic sphere shape', 'Single muted violet tone', 'No glow or particles', 'Slow subtle pulse'],
    changesHe: ['צורת כדור בסיסית', 'גוון סגול עמום בודד', 'ללא זוהר או חלקיקים', 'פעימה עדינה ואיטית'],
    profile: preset({
      materialType: 'glass',
      gradientMode: 'radial',
      patternType: 'fractal',
      geometryFamily: 'sphere',
      bloomStrength: 0.1,
      chromaShift: 0.0,
      gradientStops: ['270 30% 30%', '270 35% 40%'],
      coreGradient: ['270 30% 30%', '270 35% 40%'],
      rimLightColor: '270 30% 50%',
      primaryColor: '270 35% 40%',
      secondaryColors: ['270 30% 30%'],
      accentColor: '270 30% 50%',
      materialParams: { metalness: 0.0, roughness: 0.5, clearcoat: 0.2, transmission: 0.1, ior: 1.3, emissiveIntensity: 0.05 },
      morphIntensity: 0.1,
      morphSpeed: 0.3,
      motionSpeed: 0.3,
      patternIntensity: 0.0,
      layerCount: 2,
      coreIntensity: 0.3,
    }),
  },
  {
    level: 25,
    nameEn: 'Bloom',
    nameHe: 'פריחה',
    subtitleEn: 'Colors begin to awaken',
    subtitleHe: 'הצבעים מתעוררים',
    icon: Sparkles,
    accentHsl: '275 55% 50%',
    changesEn: ['Geometry shifts to dodecahedron', 'Dual-tone violet gradient', 'Soft bloom glow appears', 'Gentle morphing motion'],
    changesHe: ['הגיאומטריה עוברת לדודקהדרון', 'גרדיאנט סגול דו-גוני', 'זוהר רך מופיע', 'תנועת עיוות עדינה'],
    profile: preset({
      materialType: 'glass',
      gradientMode: 'radial',
      patternType: 'cellular',
      geometryFamily: 'dodeca',
      bloomStrength: 0.35,
      chromaShift: 0.1,
      gradientStops: ['260 50% 30%', '275 60% 45%', '290 55% 55%'],
      coreGradient: ['260 50% 30%', '290 55% 55%'],
      rimLightColor: '290 55% 60%',
      primaryColor: '275 60% 45%',
      secondaryColors: ['260 50% 30%', '290 55% 55%'],
      accentColor: '290 55% 60%',
      materialParams: { metalness: 0.1, roughness: 0.3, clearcoat: 0.5, transmission: 0.2, ior: 1.5, emissiveIntensity: 0.15 },
      morphIntensity: 0.3,
      morphSpeed: 0.5,
      motionSpeed: 0.5,
      patternIntensity: 0.2,
      layerCount: 3,
      coreIntensity: 0.5,
    }),
  },
  {
    level: 50,
    nameEn: 'Radiance',
    nameHe: 'קרינה',
    subtitleEn: 'Inner light breaks through',
    subtitleHe: 'האור הפנימי פורץ',
    icon: Zap,
    accentHsl: '280 70% 55%',
    changesEn: ['Iridescent material unlocked', 'Voronoi pattern emerges', 'Chroma-shift effect active', 'Particles begin forming'],
    changesHe: ['חומר אופלסנטי נפתח', 'דפוס וורונוי מופיע', 'אפקט הסטת כרומה פעיל', 'חלקיקים מתחילים להיווצר'],
    profile: preset({
      materialType: 'iridescent',
      gradientMode: 'noise',
      patternType: 'voronoi',
      geometryFamily: 'dodeca',
      bloomStrength: 0.6,
      chromaShift: 0.3,
      gradientStops: ['260 65% 32%', '275 75% 48%', '295 70% 58%', '310 60% 65%'],
      coreGradient: ['260 65% 32%', '295 70% 58%'],
      rimLightColor: '310 60% 65%',
      primaryColor: '275 75% 48%',
      secondaryColors: ['260 65% 32%', '295 70% 58%'],
      accentColor: '310 60% 65%',
      materialParams: { metalness: 0.2, roughness: 0.15, clearcoat: 0.7, transmission: 0.25, ior: 1.8, emissiveIntensity: 0.3 },
      morphIntensity: 0.45,
      morphSpeed: 0.7,
      motionSpeed: 0.8,
      patternIntensity: 0.35,
      layerCount: 4,
      coreIntensity: 0.65,
      particleEnabled: true,
      particleCount: 8,
    }),
  },
  {
    level: 75,
    nameEn: 'Ascension',
    nameHe: 'עלייה',
    subtitleEn: 'Power cascades outward',
    subtitleHe: 'הכוח מתפרץ החוצה',
    icon: Flame,
    accentHsl: '300 75% 60%',
    changesEn: ['Full 5-color gradient spectrum', 'High-intensity morphing', 'Dense particle aura', 'Strong bloom & rim light'],
    changesHe: ['ספקטרום גרדיאנט 5 צבעים', 'עיוות בעוצמה גבוהה', 'אורה צפופה של חלקיקים', 'זוהר ואור שוליים חזקים'],
    profile: preset({
      materialType: 'iridescent',
      gradientMode: 'noise',
      patternType: 'voronoi',
      geometryFamily: 'dodeca',
      bloomStrength: 0.8,
      chromaShift: 0.45,
      gradientStops: ['258 70% 33%', '272 78% 48%', '298 74% 58%', '315 68% 68%', '340 50% 80%'],
      coreGradient: ['258 70% 33%', '298 74% 58%'],
      rimLightColor: '315 68% 68%',
      primaryColor: '272 78% 48%',
      secondaryColors: ['258 70% 33%', '298 74% 58%'],
      accentColor: '315 68% 68%',
      materialParams: { metalness: 0.3, roughness: 0.1, clearcoat: 0.85, transmission: 0.3, ior: 1.9, emissiveIntensity: 0.38 },
      morphIntensity: 0.55,
      morphSpeed: 0.85,
      motionSpeed: 0.95,
      patternIntensity: 0.4,
      layerCount: 5,
      coreIntensity: 0.8,
      particleEnabled: true,
      particleCount: 16,
    }),
  },
  {
    level: 100,
    nameEn: 'Transcendence',
    nameHe: 'התעלות',
    subtitleEn: 'The orb reaches its final form',
    subtitleHe: 'הכדור מגיע לצורתו הסופית',
    icon: Crown,
    accentHsl: '320 80% 65%',
    changesEn: ['Maximum chroma-shift & bloom', 'Cosmic multi-layer depth', 'Full particle constellation', 'Living, breathing entity'],
    changesHe: ['הסטת כרומה וזוהר מקסימליים', 'עומק רב-שכבתי קוסמי', 'קונסטלציית חלקיקים מלאה', 'ישות חיה ונושמת'],
    profile: preset({
      materialType: 'iridescent',
      gradientMode: 'noise',
      patternType: 'voronoi',
      geometryFamily: 'dodeca',
      bloomStrength: 0.95,
      chromaShift: 0.6,
      gradientStops: ['260 70% 35%', '275 80% 50%', '300 75% 60%', '320 70% 70%', '0 0% 92%'],
      coreGradient: ['260 70% 35%', '300 75% 60%'],
      rimLightColor: '320 70% 70%',
      primaryColor: '275 80% 50%',
      secondaryColors: ['260 70% 35%', '300 75% 60%'],
      accentColor: '320 70% 70%',
      materialParams: { metalness: 0.3, roughness: 0.1, clearcoat: 0.95, transmission: 0.35, ior: 2.0, emissiveIntensity: 0.45 },
      morphIntensity: 0.65,
      morphSpeed: 1.0,
      motionSpeed: 1.1,
      patternIntensity: 0.5,
      layerCount: 6,
      coreIntensity: 0.95,
      particleEnabled: true,
      particleCount: 24,
    }),
  },
];

const PHASE_BORDER_COLORS = [
  'border-muted/30',
  'border-purple-500/30',
  'border-purple-400/40',
  'border-fuchsia-500/50',
  'border-amber-400/60',
];

export default function OrbEvolutionSection() {
  const { isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const [activePhase, setActivePhase] = useState(0);
  const isHe = isRTL;
  const phase = PHASES[activePhase];
  const Icon = phase.icon;
  const orbSize = isMobile ? 160 : 220;

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] transition-colors duration-1000"
          style={{ backgroundColor: `hsl(${phase.accentHsl})` }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
            {isHe ? 'זוהר סגול' : 'Violet Iridescence'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {isHe ? 'אבולוציית ה-Orb' : 'Orb Evolution'}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-lg mx-auto">
            {isHe
              ? 'ככל שאתה מתקדם, ה-Orb שלך מתפתח — צבעים, חומרים, חלקיקים וצורות נפתחים.'
              : 'As you progress, your Orb evolves — colors, materials, particles and shapes unlock.'}
          </p>
        </motion.div>

        {/* Phase selector pills */}
        <div className="flex justify-center gap-2 md:gap-3 mb-8 md:mb-12 flex-wrap">
          {PHASES.map((p, i) => {
            const PhaseIcon = p.icon;
            const active = i === activePhase;
            return (
              <button
                key={p.level}
                onClick={() => setActivePhase(i)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 border',
                  active
                    ? 'bg-primary/15 border-primary text-primary shadow-lg shadow-primary/10'
                    : 'bg-card/50 border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
              'grid gap-6 md:gap-10 items-center',
              isMobile ? 'grid-cols-1' : 'grid-cols-[1fr_auto_1fr]'
            )}
          >
            {/* Left — Phase info */}
            <div className={cn('space-y-4', isMobile && 'text-center order-2')}>
              <div className="flex items-center gap-2" style={isMobile ? { justifyContent: 'center' } : {}}>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${phase.accentHsl} / 0.15)` }}
                >
                  <Icon className="w-4 h-4" style={{ color: `hsl(${phase.accentHsl})` }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {isHe ? `שלב ${activePhase + 1} / 5` : `Phase ${activePhase + 1} / 5`}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                    {isHe ? phase.nameHe : phase.nameEn}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {isHe ? phase.subtitleHe : phase.subtitleEn}
              </p>

              {/* Level badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `hsl(${phase.accentHsl} / 0.1)`,
                  color: `hsl(${phase.accentHsl})`,
                  border: `1px solid hsl(${phase.accentHsl} / 0.25)`,
                }}
              >
                <span>LV {phase.level}</span>
              </div>
            </div>

            {/* Center — Orb */}
            <div className={cn('flex flex-col items-center', isMobile && 'order-1')}>
              <div
                className={cn(
                  'rounded-full overflow-hidden border-2 transition-colors duration-700',
                  PHASE_BORDER_COLORS[activePhase]
                )}
                style={{ width: orbSize + 20, height: orbSize + 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Orb
                  size={orbSize}
                  state="idle"
                  profile={phase.profile}
                  showGlow
                  renderer="css"
                />
              </div>
            </div>

            {/* Right — Changes list */}
            <div className={cn('space-y-3', isMobile && 'order-3')}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
                 style={isMobile ? { textAlign: 'center' } : {}}
              >
                {isHe ? 'מה השתנה' : 'What Changed'}
              </p>
              <ul className="space-y-2">
                {(isHe ? phase.changesHe : phase.changesEn).map((change, ci) => (
                  <motion.li
                    key={ci}
                    initial={{ opacity: 0, x: isHe ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: ci * 0.08, duration: 0.3 }}
                    className="flex items-start gap-2 text-sm text-foreground/85"
                  >
                    <span
                      className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: `hsl(${phase.accentHsl})` }}
                    />
                    {change}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="mt-10 md:mt-14 max-w-md mx-auto">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Lv 1</span>
            <span>Lv 100</span>
          </div>
          <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: `hsl(${phase.accentHsl})` }}
              animate={{ width: `${phase.level}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
