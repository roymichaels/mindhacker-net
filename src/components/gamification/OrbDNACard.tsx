/**
 * OrbDNACard – Visual Resume / DNA Breakdown
 * Shows the actual orb colors, archetype blend, motion signature, and complexity.
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { getArchetypeName, getArchetypeIcon } from '@/lib/orbProfileGenerator';
import { getVisualDNAExplanations, type VisualDNAInput } from '@/lib/visualDNA';
import { VISUAL_DEFAULTS } from '@/components/orb/types';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Layers, Sparkles, Zap, Wind, ChevronDown, Bug } from 'lucide-react';
import type { ArchetypeId } from '@/lib/archetypes';

// ===== Constants =====
const ARCHETYPE_COLORS: Record<ArchetypeId, string> = {
  warrior: 'bg-orange-500', mystic: 'bg-violet-500', creator: 'bg-pink-500',
  sage: 'bg-cyan-500', healer: 'bg-emerald-500', explorer: 'bg-amber-500',
};

const MATERIAL_LABELS: Record<string, { en: string; he: string; icon: string }> = {
  wire: { en: 'Wire', he: 'חוט', icon: '🔗' },
  metal: { en: 'Metal', he: 'מתכת', icon: '⚙️' },
  glass: { en: 'Glass', he: 'זכוכית', icon: '💎' },
  plasma: { en: 'Plasma', he: 'פלזמה', icon: '⚡' },
  iridescent: { en: 'Iridescent', he: 'אירידסנטי', icon: '🌈' },
};

const PATTERN_LABELS: Record<string, { en: string; he: string }> = {
  voronoi: { en: 'Voronoi', he: 'ורונוי' },
  cellular: { en: 'Cellular', he: 'תאי' },
  fractal: { en: 'Fractal', he: 'פרקטלי' },
  shards: { en: 'Shards', he: 'שברים' },
  swirl: { en: 'Swirl', he: 'מערבולת' },
  strata: { en: 'Strata', he: 'שכבות' },
};

function normalizeCssColor(input: string | undefined | null): string {
  if (!input) return 'transparent';
  const trimmed = input.trim();
  if (/^(hsl|hsla|rgb|rgba)\(/i.test(trimmed)) return trimmed;
  if (/^\d+\s+\d+%\s+\d+%$/.test(trimmed)) return `hsl(${trimmed})`;
  return trimmed;
}

function getEnergyFeel(profile: { morphIntensity: number; pulseRate: number; morphSpeed: number; smoothness: number }, isHe: boolean): string {
  const energy = (profile.morphIntensity + profile.pulseRate + profile.morphSpeed) / 3;
  if (profile.smoothness > 0.7 && energy < 0.8) return isHe ? 'רגוע' : 'Calm';
  if (energy > 1.5) return isHe ? 'כאוטי' : 'Chaotic';
  if (profile.morphIntensity > 0.7 && profile.smoothness < 0.4) return isHe ? 'חד' : 'Sharp';
  return isHe ? 'יציב' : 'Steady';
}

export function OrbDNACard() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { profile } = useOrbProfile();
  const { progress } = useLaunchpadProgress();

  const safeNum = (v: unknown, fallback: number) => (typeof v === 'number' && !isNaN(v)) ? v : fallback;

  const bloomStrength = safeNum(profile.bloomStrength, VISUAL_DEFAULTS.bloomStrength);
  const chromaShift = safeNum(profile.chromaShift, VISUAL_DEFAULTS.chromaShift);
  const patternIntensity = safeNum(profile.patternIntensity, VISUAL_DEFAULTS.patternIntensity);
  const morphIntensity = safeNum(profile.morphIntensity, 0.5);
  const morphSpeed = safeNum(profile.morphSpeed, 0.8);
  const pulseRate = safeNum(profile.pulseRate, 1.0);
  const smoothness = safeNum(profile.smoothness, 0.6);
  const materialType = profile.materialType || VISUAL_DEFAULTS.materialType;
  const patternType = profile.patternType || VISUAL_DEFAULTS.patternType;
  const layerCount = safeNum(profile.layerCount, 2);
  const geometryDetail = safeNum(profile.geometryDetail, 4);
  const fractalOctaves = safeNum(profile.fractalOctaves, 3);

  const archetypeWeights = profile.computedFrom.archetypeWeights || [];
  const topArchetypes = archetypeWeights.slice(0, 4);
  const maxWeight = topArchetypes[0]?.weight || 1;
  const hasData = topArchetypes.length > 0;

  // Actual orb colors (what the CSS orb uses)
  const orbColors = useMemo(() => {
    const all: { label: string; color: string }[] = [];
    if (profile.primaryColor) all.push({ label: isHe ? 'ראשי' : 'Primary', color: normalizeCssColor(profile.primaryColor) });
    if (profile.secondaryColors?.length) {
      profile.secondaryColors.forEach((c, i) => {
        if (c) all.push({ label: isHe ? `משני ${i + 1}` : `Secondary ${i + 1}`, color: normalizeCssColor(c) });
      });
    }
    if (profile.accentColor) all.push({ label: isHe ? 'הדגשה' : 'Accent', color: normalizeCssColor(profile.accentColor) });
    return all;
  }, [profile.primaryColor, profile.secondaryColors, profile.accentColor, isHe]);

  // Build "why" explanations
  const explanations = useMemo(() => {
    const input: VisualDNAInput = {
      step1Intention: progress?.step_1_intention as unknown as Record<string, unknown> | null,
      step2ProfileData: progress?.step_2_profile_data as unknown as Record<string, unknown> | null,
      summaryRow: null,
      seed: profile.seed || 0,
    };
    return getVisualDNAExplanations(input, isHe ? 'he' : 'en');
  }, [progress?.step_1_intention, progress?.step_2_profile_data, profile.seed, isHe]);

  // Debug mode
  const showDebug = useMemo(() => {
    try { return localStorage.getItem('ORB_DEBUG') === 'true'; } catch { return false; }
  }, []);

  if (!hasData) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6 text-center">
        <Sparkles className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {isHe ? 'השלם את התהליך כדי לראות את ה-DNA שלך' : 'Complete onboarding to see your DNA'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Archetype Blend */}
      <Section title={isHe ? 'תמהיל ארכיטיפים' : 'Archetype Blend'} icon="🧬">
        <div className="space-y-2.5">
          {topArchetypes.map(({ id, weight }) => {
            const pct = Math.round((weight / maxWeight) * 100);
            return (
              <div key={id} className="flex items-center gap-2.5">
                <span className="text-base w-6 text-center">{getArchetypeIcon(id)}</span>
                <span className="text-sm font-medium w-20 truncate">{getArchetypeName(id, isHe)}</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', ARCHETYPE_COLORS[id])} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-end">{Math.round(weight * 100)}%</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 2. Orb Colors — actual colors used by the orb */}
      <Section title={isHe ? 'צבעי האורב' : 'Orb Colors'} icon="🎨">
        <div className="flex items-center gap-3 flex-wrap">
          {orbColors.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-full border-2 border-border shadow-md"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-[9px] text-muted-foreground">{c.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Visual Signature */}
      <Section title={isHe ? 'חתימה ויזואלית' : 'Visual Signature'} icon="✨">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge label={isHe ? 'חומר' : 'Material'} value={`${MATERIAL_LABELS[materialType]?.icon || ''} ${isHe ? MATERIAL_LABELS[materialType]?.he : MATERIAL_LABELS[materialType]?.en}`} />
          <Badge label={isHe ? 'דפוס' : 'Pattern'} value={isHe ? PATTERN_LABELS[patternType]?.he : PATTERN_LABELS[patternType]?.en} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Meter label={isHe ? 'זוהר' : 'Bloom'} value={bloomStrength} max={1.5} />
          <Meter label={isHe ? 'הסטת צבע' : 'Chroma'} value={chromaShift} max={0.8} />
          <Meter label={isHe ? 'עוצמת דפוס' : 'Pattern'} value={patternIntensity} max={1} />
        </div>
      </Section>

      {/* 4. Motion Signature */}
      <Section title={isHe ? 'חתימת תנועה' : 'Motion Signature'} icon="🌊">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">{isHe ? 'תחושת אנרגיה' : 'Energy feel'}:</span>
          <span className="text-sm font-semibold text-foreground">{getEnergyFeel({ morphIntensity, pulseRate, morphSpeed, smoothness }, isHe)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Meter label={isHe ? 'מורפינג' : 'Morph'} value={morphIntensity} max={1} />
          <Meter label={isHe ? 'מהירות' : 'Speed'} value={morphSpeed} max={2} />
          <Meter label={isHe ? 'פעימה' : 'Pulse'} value={pulseRate} max={3} />
          <Meter label={isHe ? 'חלקות' : 'Smooth'} value={smoothness} max={1} />
        </div>
      </Section>

      {/* 5. Complexity */}
      <Section title={isHe ? 'מורכבות' : 'Complexity'} icon="⚡">
        <div className="grid grid-cols-2 gap-2">
          <StatChip icon={<Layers className="w-3.5 h-3.5" />} label={isHe ? 'שכבות' : 'Layers'} value={String(layerCount)} />
          <StatChip icon={<Zap className="w-3.5 h-3.5" />} label={isHe ? 'פירוט' : 'Detail'} value={String(geometryDetail)} />
          <StatChip icon={<Sparkles className="w-3.5 h-3.5" />} label={isHe ? 'אוקטבות' : 'Octaves'} value={String(fractalOctaves)} />
          <StatChip icon={<Wind className="w-3.5 h-3.5" />} label={isHe ? 'חלקיקים' : 'Particles'} value={
            profile.particleEnabled ? `${profile.particleCount}` : (isHe ? 'כבוי' : 'Off')
          } />
        </div>
      </Section>

      {/* 6. Why You Look Like This */}
      {explanations.length > 0 && (
        <Section title={isHe ? 'למה ככה נראה?' : 'Why You Look Like This'} icon="💡">
          <ul className="space-y-1.5">
            {explanations.map((exp, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-[10px] mt-0.5">•</span>
                <span>{exp}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Dev Debug (conditional) */}
      {showDebug && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
            <Bug className="w-3.5 h-3.5" />
            <span>Debug Info</span>
            <ChevronDown className="w-3 h-3 ms-auto" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="text-[10px] font-mono bg-muted/50 rounded-lg p-3 space-y-1 overflow-auto max-h-48 border border-border/50">
              <p>primaryColor: {profile.primaryColor}</p>
              <p>secondaryColors: {profile.secondaryColors?.join(', ')}</p>
              <p>accentColor: {profile.accentColor}</p>
              <p>materialType: {profile.materialType}</p>
              <p>patternType: {profile.patternType}</p>
              <p>seed: {profile.seed}</p>
              <p>diagnosticState: {profile.diagnosticState}</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// ===== Sub-components =====

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-sm">{icon}</span>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border bg-muted/50 border-border">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}

function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 0;
  const pct = Math.round(Math.min(safeValue / max, 1) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{safeValue.toFixed(2)}</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border/50 px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-bold text-foreground ms-auto">{value}</span>
    </div>
  );
}
