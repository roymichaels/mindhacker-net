/**
 * OrbDNACard – Visual Resume / DNA Breakdown
 * Shows the full visual signature, motion, complexity, and "why" explanations.
 */

import { useMemo, useState } from 'react';
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

const GEOMETRY_LABELS: Record<string, { en: string; he: string }> = {
  sphere: { en: 'Sphere', he: 'כדור' },
  torus: { en: 'Torus', he: 'טורוס' },
  dodeca: { en: 'Dodecahedron', he: 'דודקהדרון' },
  icosa: { en: 'Icosahedron', he: 'איקוסהדרון' },
  octa: { en: 'Octahedron', he: 'אוקטהדרון' },
  spiky: { en: 'Spiky', he: 'קוצני' },
};

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

  const archetypeWeights = profile.computedFrom.archetypeWeights || [];
  const topArchetypes = archetypeWeights.slice(0, 4);
  const maxWeight = topArchetypes[0]?.weight || 1;
  const hasData = topArchetypes.length > 0;

  // Check if using defaults
  const isDefaults = JSON.stringify(profile.gradientStops) === JSON.stringify(VISUAL_DEFAULTS.gradientStops);

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

      {/* 2. Visual Signature */}
      <Section title={isHe ? 'חתימה ויזואלית' : 'Visual Signature'} icon="🎨">
        {isDefaults && (
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full mb-2 inline-block">
            {isHe ? '(ברירת מחדל)' : '(defaults)'}
          </span>
        )}
        {/* Gradient Swatches */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1.5">{isHe ? 'גרדיאנט' : 'Gradient'}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {profile.gradientStops.map((stop, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-8 h-8 rounded-full border border-border shadow-sm" style={{ backgroundColor: `hsl(${stop})` }} />
                <span className="text-[9px] text-muted-foreground">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Material + Pattern badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge label={isHe ? 'חומר' : 'Material'} value={`${MATERIAL_LABELS[profile.materialType]?.icon || ''} ${isHe ? MATERIAL_LABELS[profile.materialType]?.he : MATERIAL_LABELS[profile.materialType]?.en}`} />
          <Badge label={isHe ? 'דפוס' : 'Pattern'} value={isHe ? PATTERN_LABELS[profile.patternType]?.he : PATTERN_LABELS[profile.patternType]?.en} />
        </div>
        {/* Rim Light + Core Gradient */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{isHe ? 'שוליים' : 'Rim'}:</span>
            <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: `hsl(${profile.rimLightColor})` }} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{isHe ? 'ליבה' : 'Core'}:</span>
            <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: `hsl(${profile.coreGradient[0]})` }} />
            <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: `hsl(${profile.coreGradient[1]})` }} />
          </div>
        </div>
        {/* Meters */}
        <div className="grid grid-cols-2 gap-2">
          <Meter label={isHe ? 'זוהר' : 'Bloom'} value={profile.bloomStrength} max={1.5} />
          <Meter label={isHe ? 'הסטת צבע' : 'Chroma'} value={profile.chromaShift} max={0.8} />
          <Meter label={isHe ? 'עוצמת דפוס' : 'Pattern'} value={profile.patternIntensity} max={1} />
        </div>
      </Section>

      {/* 3. Motion Signature */}
      <Section title={isHe ? 'חתימת תנועה' : 'Motion Signature'} icon="🌊">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">{isHe ? 'תחושת אנרגיה' : 'Energy feel'}:</span>
          <span className="text-sm font-semibold text-foreground">{getEnergyFeel(profile, isHe)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Meter label={isHe ? 'מורפינג' : 'Morph'} value={profile.morphIntensity} max={1} />
          <Meter label={isHe ? 'מהירות' : 'Speed'} value={profile.morphSpeed} max={2} />
          <Meter label={isHe ? 'פעימה' : 'Pulse'} value={profile.pulseRate} max={3} />
          <Meter label={isHe ? 'חלקות' : 'Smooth'} value={profile.smoothness} max={1} />
        </div>
      </Section>

      {/* 4. Complexity */}
      <Section title={isHe ? 'מורכבות' : 'Complexity'} icon="⚡">
        <div className="grid grid-cols-2 gap-2">
          <StatChip icon={<Layers className="w-3.5 h-3.5" />} label={isHe ? 'שכבות' : 'Layers'} value={String(profile.layerCount)} />
          <StatChip icon={<Zap className="w-3.5 h-3.5" />} label={isHe ? 'פירוט' : 'Detail'} value={String(profile.geometryDetail)} />
          <StatChip icon={<Sparkles className="w-3.5 h-3.5" />} label={isHe ? 'אוקטבות' : 'Octaves'} value={String(profile.fractalOctaves)} />
          <StatChip icon={<Wind className="w-3.5 h-3.5" />} label={isHe ? 'גיאומטריה' : 'Geometry'} value={
            profile.geometryFamily ? (isHe ? GEOMETRY_LABELS[profile.geometryFamily]?.he : GEOMETRY_LABELS[profile.geometryFamily]?.en) || profile.geometryFamily : '—'
          } />
        </div>
        <div className="mt-2">
          <Badge
            label={isHe ? 'חלקיקים' : 'Particles'}
            value={profile.particleEnabled ? `${isHe ? 'פעיל' : 'On'} (${profile.particleCount})` : (isHe ? 'כבוי' : 'Off')}
          />
        </div>
      </Section>

      {/* 5. Why You Look Like This */}
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

      {/* 6. Full Color Palette */}
      <Section title={isHe ? 'פלטת צבעים' : 'Color Palette'} icon="🎨">
        <div className="flex items-center gap-2 flex-wrap">
          {profile.gradientStops.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full border-2 border-border shadow-sm" style={{ backgroundColor: `hsl(${c})` }} />
              <span className="text-[9px] text-muted-foreground">{i + 1}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 7. Dev Debug (conditional) */}
      {showDebug && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
            <Bug className="w-3.5 h-3.5" />
            <span>Debug Info</span>
            <ChevronDown className="w-3 h-3 ms-auto" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="text-[10px] font-mono bg-muted/50 rounded-lg p-3 space-y-1 overflow-auto max-h-48 border border-border/50">
              <p>gradientStops: {profile.gradientStops.length} stops</p>
              <p>materialType: {profile.materialType}</p>
              <p>patternType: {profile.patternType}</p>
              <p>bloomStrength: {profile.bloomStrength?.toFixed(2)}</p>
              <p>chromaShift: {profile.chromaShift?.toFixed(2)}</p>
              <p>emissiveIntensity: {profile.materialParams?.emissiveIntensity?.toFixed(2)}</p>
              <p>geometryFamily: {profile.geometryFamily || 'default'}</p>
              <p>seed: {profile.seed}</p>
              <p>diagnosticState: {profile.diagnosticState}</p>
              <p className="pt-1 border-t border-border/50">stops: {profile.gradientStops.join(' | ')}</p>
              <p>rimLight: {profile.rimLightColor}</p>
              <p>coreGradient: {profile.coreGradient?.join(' → ')}</p>
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
