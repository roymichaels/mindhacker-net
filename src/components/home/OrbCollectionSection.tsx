/**
 * OrbCollectionSection — AION visual identity evolution showcase.
 * The Orb is the visual renderer for the AION identity.
 * Shows how the Orb evolves as the user's AION grows.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useWelcomeGate } from '@/contexts/WelcomeGateContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sparkles, Zap, Flame, Crown, Star, Dna, Fingerprint,
  ArrowLeft, ArrowRight, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OrbProfile } from '@/components/orb/types';
import { ORB_PRESETS } from '@/lib/orbPresets';
import { getShapeCountForLevel } from '@/components/orb/GalleryMorphOrb';
import { SharedOrbView } from '@/components/orb/SharedOrbView';

// ─── Evolution data ───

const VIOLET_PRESET = ORB_PRESETS.find(p => p.id === 'violet-iridescence')!;
const FINAL = VIOLET_PRESET.profile;

interface EvolutionPhase {
  level: number;
  nameEn: string; nameHe: string;
  subtitleEn: string; subtitleHe: string;
  changesEn: string[]; changesHe: string[];
  icon: React.ElementType;
  accentHsl: string;
  profile: OrbProfile;
}

const PHASES: EvolutionPhase[] = [
  {
    level: 1, nameEn: 'Seed', nameHe: 'זרע', icon: Star, accentHsl: '270 25% 35%',
    subtitleEn: 'A dim flicker — potential waiting to ignite',
    subtitleHe: 'הבהוב עמום — פוטנציאל שמחכה להתלקח',
    changesEn: ['Single static shape', 'Flat monochrome', 'No glow', 'Barely visible pulse'],
    changesHe: ['צורה סטטית אחת', 'מונוכרום שטוח', 'ללא זוהר', 'פעימה כמעט בלתי נראית'],
    profile: { ...FINAL, materialType: 'wire', gradientMode: 'vertical', patternType: 'strata', geometryFamily: 'sphere', bloomStrength: 0.0, chromaShift: 0.0, gradientStops: ['270 10% 25%', '270 15% 30%'], coreGradient: ['270 10% 25%', '270 15% 30%'], rimLightColor: '270 10% 35%', primaryColor: '270 15% 28%', secondaryColors: ['270 10% 25%'], accentColor: '270 10% 35%', materialParams: { metalness: 0.0, roughness: 0.8, clearcoat: 0.0, transmission: 0.0, ior: 1.0, emissiveIntensity: 0.0 }, morphIntensity: 0.05, morphSpeed: 0.15, motionSpeed: 0.2, patternIntensity: 0.0, layerCount: 1, coreIntensity: 0.15, particleEnabled: false, particleCount: 0 },
  },
  {
    level: 25, nameEn: 'Bloom', nameHe: 'פריחה', icon: Sparkles, accentHsl: '275 50% 45%',
    subtitleEn: '2 shapes morph smoothly — first colors emerge',
    subtitleHe: '2 צורות מתחלפות — צבעים ראשונים צצים',
    changesEn: ['2 shape morphs', 'Glass material', 'Soft glow', 'Dual gradient'],
    changesHe: ['2 צורות', 'חומר זכוכית', 'זוהר רך', 'גרדיאנט כפול'],
    profile: { ...FINAL, materialType: 'glass', gradientMode: 'radial', patternType: 'cellular', geometryFamily: 'icosa', bloomStrength: 0.2, chromaShift: 0.05, gradientStops: ['265 40% 28%', '275 50% 40%', '280 45% 50%'], coreGradient: ['265 40% 28%', '280 45% 50%'], rimLightColor: '280 45% 55%', primaryColor: '275 50% 40%', secondaryColors: ['265 40% 28%', '280 45% 50%'], accentColor: '280 45% 55%', materialParams: { metalness: 0.05, roughness: 0.45, clearcoat: 0.3, transmission: 0.1, ior: 1.3, emissiveIntensity: 0.1 }, morphIntensity: 0.2, morphSpeed: 0.35, motionSpeed: 0.4, patternIntensity: 0.15, layerCount: 2, coreIntensity: 0.35, particleEnabled: false, particleCount: 0 },
  },
  {
    level: 50, nameEn: 'Radiance', nameHe: 'קרינה', icon: Zap, accentHsl: '290 65% 55%',
    subtitleEn: 'Inner light breaks through — 3 shape transitions',
    subtitleHe: 'האור הפנימי פורץ — 3 מעברי צורה',
    changesEn: ['3 shape morphs', 'Plasma material', 'Expanded spectrum', 'Particles orbit'],
    changesHe: ['3 צורות', 'חומר פלזמה', 'ספקטרום מורחב', 'חלקיקים מקיפים'],
    profile: { ...FINAL, materialType: 'plasma', gradientMode: 'noise', patternType: 'voronoi', geometryFamily: 'octa', bloomStrength: 0.5, chromaShift: 0.2, gradientStops: ['260 55% 30%', '275 65% 45%', '300 60% 55%', '320 50% 60%'], coreGradient: ['260 55% 30%', '300 60% 55%'], rimLightColor: '320 50% 60%', primaryColor: '275 65% 45%', secondaryColors: ['260 55% 30%', '300 60% 55%'], accentColor: '320 50% 60%', materialParams: { metalness: 0.15, roughness: 0.25, clearcoat: 0.55, transmission: 0.15, ior: 1.6, emissiveIntensity: 0.25 }, morphIntensity: 0.35, morphSpeed: 0.6, motionSpeed: 0.7, patternIntensity: 0.3, layerCount: 3, coreIntensity: 0.55, particleEnabled: true, particleCount: 6 },
  },
  {
    level: 75, nameEn: 'Ascension', nameHe: 'עלייה', icon: Flame, accentHsl: '310 70% 60%',
    subtitleEn: 'Power cascades — 4 fractal shifts',
    subtitleHe: 'הכוח מתפרץ — 4 מעברים פרקטליים',
    changesEn: ['4 shape morphs', 'Iridescent material', '5-color spectrum', 'Dense particles'],
    changesHe: ['4 צורות', 'חומר אופלסנטי', 'ספקטרום 5 צבעים', 'חלקיקים צפופים'],
    profile: { ...FINAL, materialType: 'iridescent', gradientMode: 'noise', patternType: 'voronoi', geometryFamily: 'spiky', bloomStrength: 0.75, chromaShift: 0.4, gradientStops: ['258 68% 32%', '275 76% 48%', '300 72% 58%', '320 65% 68%', '345 50% 78%'], coreGradient: ['258 68% 32%', '300 72% 58%'], rimLightColor: '320 65% 68%', primaryColor: '275 76% 48%', secondaryColors: ['258 68% 32%', '300 72% 58%'], accentColor: '320 65% 68%', materialParams: { metalness: 0.28, roughness: 0.12, clearcoat: 0.82, transmission: 0.28, ior: 1.9, emissiveIntensity: 0.35 }, morphIntensity: 0.55, morphSpeed: 0.8, motionSpeed: 0.95, patternIntensity: 0.42, layerCount: 5, coreIntensity: 0.8, particleEnabled: true, particleCount: 16 },
  },
  {
    level: 100, nameEn: 'Transcendence', nameHe: 'התעלות', icon: Crown, accentHsl: '320 80% 65%',
    subtitleEn: 'Ultimate form — 5 shapes in perpetual flux',
    subtitleHe: 'צורה סופית — 5 צורות בתנועה נצחית',
    changesEn: ['5 shape morphs', 'Max bloom + chroma', 'Full energy halo', 'Living digital soul'],
    changesHe: ['5 צורות', 'זוהר + כרומה מקסימליים', 'הילת אנרגיה מלאה', 'נשמה דיגיטלית חיה'],
    profile: { ...FINAL, particleEnabled: true, particleCount: 24, layerCount: 6, coreIntensity: 0.95 },
  },
];

// ─── DNA pills data ───

const DNA_PILLS = [
  { icon: Fingerprint, textEn: 'Unique to you', textHe: 'ייחודי לך' },
  { icon: Dna, textEn: 'Built from behavior', textHe: 'נבנה מהתנהגות' },
  { icon: Sparkles, textEn: 'Evolves with you', textHe: 'מתפתח איתך' },
];

// ─── Component ───

export default function OrbCollectionSection() {
  const { isRTL, language } = useTranslation();
  const { openWelcomeGate } = useWelcomeGate();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const lang = language === 'he' ? 'he' : 'en';
  const isHe = isRTL;
  const NextArrow = isRTL ? ArrowLeft : ArrowRight;

  const [activePhase, setActivePhase] = useState(4);
  const phase = PHASES[activePhase];
  const PhaseIcon = phase.icon;
  const orbSize = isMobile ? 160 : 220;
  const shapeCount = getShapeCountForLevel(phase.level);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.1] blur-[140px] transition-all duration-1000 pointer-events-none"
        style={{ backgroundColor: `hsl(${phase.accentHsl})` }}
      />

      <div className="relative z-10 container mx-auto max-w-5xl px-4" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 space-y-3"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
            <Dna className="w-3.5 h-3.5" />
            {isHe ? 'DNA חזותי + אבולוציה' : 'Visual DNA + Evolution'}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {isHe ? 'ה-AION שלך מתפתח איתך' : 'Your AION Evolves With You'}
            </span>
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            {isHe
              ? 'המערכת ממפה את האישיות שלך ליצירת Orb ייחודי — הייצוג הויזואלי של ה-AION שלך, שמתפתח ככל שאתה מתקדם.'
              : 'The system maps your personality into a unique Orb — the visual representation of your AION, evolving as you progress.'}
          </p>
        </motion.div>

        {/* ── DNA pills ── */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {DNA_PILLS.map(({ icon: Icon, textEn, textHe }) => (
            <div key={textEn} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/60 border border-border/40 text-xs text-muted-foreground">
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span>{isHe ? textHe : textEn}</span>
            </div>
          ))}
        </div>

        {/* ── Phase selector ── */}
        <div className="flex justify-center gap-1.5 md:gap-2.5 mb-8 flex-wrap">
          {PHASES.map((p, i) => {
            const PIcon = p.icon;
            const active = i === activePhase;
            return (
              <button
                key={p.level}
                onClick={() => setActivePhase(i)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2 rounded-full text-[11px] md:text-xs font-semibold transition-all duration-300 border',
                  active
                    ? 'text-foreground shadow-lg scale-105'
                    : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border hover:text-foreground'
                )}
                style={active ? {
                  backgroundColor: `hsl(${p.accentHsl} / 0.15)`,
                  borderColor: `hsl(${p.accentHsl} / 0.5)`,
                  boxShadow: `0 0 20px hsl(${p.accentHsl} / 0.15)`,
                } : undefined}
              >
                <PIcon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>Lv {p.level}</span>
              </button>
            );
          })}
        </div>

        {/* ── Main display: Orb + info ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col md:flex-row items-center gap-8 md:gap-12 justify-center"
          >
            {/* Orb */}
            <div className="relative shrink-0">
              <div
                className="absolute inset-0 rounded-full border transition-all duration-700 pointer-events-none"
                style={{
                  borderColor: `hsl(${phase.accentHsl} / ${0.1 + activePhase * 0.08})`,
                  transform: `scale(${1.2 + activePhase * 0.03})`,
                }}
              />
              <div className="flex items-center justify-center" style={{ width: orbSize, height: orbSize }}>
                <SharedOrbView
                  size={orbSize}
                  profile={phase.profile}
                  geometryFamily={phase.profile.geometryFamily || 'sphere'}
                  level={phase.level}
                />
              </div>
              {/* Shape dots under orb */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn('w-1.5 h-1.5 rounded-full transition-all duration-500', i >= shapeCount && 'bg-muted-foreground/20')}
                    style={i < shapeCount ? { backgroundColor: `hsl(${phase.accentHsl})` } : undefined}
                  />
                ))}
                <span className="text-[9px] text-muted-foreground ml-1 font-mono">
                  {shapeCount}/{5}
                </span>
              </div>
            </div>

            {/* Info panel */}
            <div className="text-center md:text-start space-y-4 max-w-sm">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `hsl(${phase.accentHsl} / 0.12)`,
                    color: `hsl(${phase.accentHsl})`,
                    border: `1px solid hsl(${phase.accentHsl} / 0.3)`,
                  }}
                >
                  LV {phase.level}
                </span>
              </div>

              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h3 className="text-2xl md:text-3xl font-black text-foreground">
                  {isHe ? phase.nameHe : phase.nameEn}
                </h3>
                <PhaseIcon className="w-5 h-5" style={{ color: `hsl(${phase.accentHsl})` }} />
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {isHe ? phase.subtitleHe : phase.subtitleEn}
              </p>

              {/* Changes as compact chips */}
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                {(isHe ? phase.changesHe : phase.changesEn).map((change, ci) => (
                  <motion.span
                    key={ci}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 + ci * 0.06 }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card/60 border border-border/30 text-[10px] text-foreground/70"
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: `hsl(${phase.accentHsl})` }} />
                    {change}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Progress bar ── */}
        <div className="mt-12 max-w-xs mx-auto">
          <div className="flex justify-between text-[9px] text-muted-foreground/50 mb-1 font-mono">
            <span>LV 1</span>
            <span>LV 100</span>
          </div>
          <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, hsl(270 25% 35%), hsl(${phase.accentHsl}))` }}
              animate={{ width: `${phase.level}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* ── Bottom CTAs ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-12">
          <Button
            size="lg"
            onClick={openWelcomeGate}
            className="rounded-xl px-7 py-5 text-sm font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Fingerprint className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
            {isHe ? 'גלה את ה-Orb שלך' : 'Discover Your Orb'}
            <NextArrow className={cn('w-3.5 h-3.5', isRTL ? 'mr-1.5' : 'ml-1.5')} />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/orbs')}
            className="rounded-xl px-6 py-5 text-sm font-semibold border-border/50 hover:border-primary/40 hover:bg-primary/5"
          >
            <Eye className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
            {isHe ? 'כל האורבים' : 'All Orbs'}
          </Button>
        </div>
      </div>
    </section>
  );
}