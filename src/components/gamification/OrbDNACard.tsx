/**
 * OrbDNACard – Visual DNA Breakdown
 * Shows which traits, hobbies, and behaviors influence the orb's appearance.
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { getArchetypeName, getArchetypeIcon } from '@/lib/orbProfileGenerator';
import { HOBBY_MAPPINGS } from '@/lib/avatarDNA';
import { PillChips } from '@/components/aurora-ui/PillChips';
import { Progress } from '@/components/ui/progress';
import { Layers, Sparkles, Zap, Wind } from 'lucide-react';
import type { ArchetypeId } from '@/lib/archetypes';

const ARCHETYPE_COLORS: Record<ArchetypeId, string> = {
  warrior: 'bg-orange-500',
  mystic: 'bg-violet-500',
  creator: 'bg-pink-500',
  sage: 'bg-cyan-500',
  healer: 'bg-emerald-500',
  explorer: 'bg-amber-500',
};

const ARCHETYPE_BADGE_COLORS: Record<ArchetypeId, string> = {
  warrior: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  mystic: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  creator: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  sage: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  healer: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20',
  explorer: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

// Labels for behavioral styles
const DECISION_LABELS: Record<string, { en: string; he: string }> = {
  'gut-feeling': { en: 'Gut Feeling', he: 'תחושת בטן' },
  'pros-cons': { en: 'Pros & Cons', he: 'שיקולים' },
  'seek-advice': { en: 'Seek Advice', he: 'התייעצות' },
  'sleep-on-it': { en: 'Sleep On It', he: 'ישון על זה' },
  'quick-decision': { en: 'Quick Decision', he: 'החלטה מהירה' },
};

const CONFLICT_LABELS: Record<string, { en: string; he: string }> = {
  'direct': { en: 'Direct', he: 'ישיר' },
  'avoid': { en: 'Avoidant', he: 'נמנע' },
  'diplomatic': { en: 'Diplomatic', he: 'דיפלומטי' },
  'compromise': { en: 'Compromise', he: 'פשרה' },
};

const PROBLEM_LABELS: Record<string, { en: string; he: string }> = {
  'solve-immediately': { en: 'Act Fast', he: 'פעולה מהירה' },
  'research-first': { en: 'Research First', he: 'מחקר קודם' },
  'calm-then-solve': { en: 'Calm First', he: 'רגיעה קודם' },
  'delegate': { en: 'Delegate', he: 'האצלה' },
};

export function OrbDNACard() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { profile } = useOrbProfile();
  const { progress } = useLaunchpadProgress();

  const profileData = useMemo(() => {
    const pd = progress?.step_2_profile_data as Record<string, unknown> | null;
    if (!pd) return null;
    return {
      hobbies: (pd.hobbies as string[]) || [],
      decisionStyle: pd.decision_style as string | undefined,
      conflictStyle: pd.conflict_handling as string | undefined,
      problemSolvingStyle: pd.problem_approach as string | undefined,
    };
  }, [progress?.step_2_profile_data]);

  const { computedFrom } = profile;
  const archetypeWeights = computedFrom.archetypeWeights || [];
  const topArchetypes = archetypeWeights.slice(0, 4);
  const maxWeight = topArchetypes[0]?.weight || 1;

  // Map hobbies to their archetype
  const hobbyArchetypeMap = useMemo(() => {
    const map: { hobby: string; archetype: ArchetypeId }[] = [];
    for (const hobby of profileData?.hobbies || []) {
      const mapping = HOBBY_MAPPINGS[hobby];
      if (mapping) {
        map.push({ hobby, archetype: mapping.archetype });
      } else {
        map.push({ hobby, archetype: computedFrom.dominantArchetype });
      }
    }
    return map;
  }, [profileData?.hobbies, computedFrom.dominantArchetype]);

  const colors = [profile.primaryColor, ...(profile.secondaryColors || []), profile.accentColor]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);

  const hasData = topArchetypes.length > 0;

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
                <span className="text-sm font-medium w-20 truncate">
                  {getArchetypeName(id, isHe)}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', ARCHETYPE_COLORS[id])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-end">
                  {Math.round(weight * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 2. Influencing Hobbies */}
      {hobbyArchetypeMap.length > 0 && (
        <Section title={isHe ? 'תחביבים משפיעים' : 'Influencing Hobbies'} icon="🎯">
          <div className="flex flex-wrap gap-2">
            {hobbyArchetypeMap.map(({ hobby, archetype }) => (
              <span
                key={hobby}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
                  ARCHETYPE_BADGE_COLORS[archetype]
                )}
              >
                <span className="text-xs">{getArchetypeIcon(archetype)}</span>
                {hobby}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* 3. Behavioral Signature */}
      {(profileData?.decisionStyle || profileData?.conflictStyle || profileData?.problemSolvingStyle) && (
        <Section title={isHe ? 'חתימה התנהגותית' : 'Behavioral Signature'} icon="🧠">
          <div className="flex flex-wrap gap-2">
            {profileData?.decisionStyle && DECISION_LABELS[profileData.decisionStyle] && (
              <BehaviorChip
                label={isHe ? 'החלטות' : 'Decisions'}
                value={isHe ? DECISION_LABELS[profileData.decisionStyle].he : DECISION_LABELS[profileData.decisionStyle].en}
              />
            )}
            {profileData?.conflictStyle && CONFLICT_LABELS[profileData.conflictStyle] && (
              <BehaviorChip
                label={isHe ? 'עימות' : 'Conflict'}
                value={isHe ? CONFLICT_LABELS[profileData.conflictStyle].he : CONFLICT_LABELS[profileData.conflictStyle].en}
              />
            )}
            {profileData?.problemSolvingStyle && PROBLEM_LABELS[profileData.problemSolvingStyle] && (
              <BehaviorChip
                label={isHe ? 'בעיות' : 'Problems'}
                value={isHe ? PROBLEM_LABELS[profileData.problemSolvingStyle].he : PROBLEM_LABELS[profileData.problemSolvingStyle].en}
              />
            )}
          </div>
        </Section>
      )}

      {/* 4. Orb Stats */}
      <Section title={isHe ? 'סטטיסטיקות אורב' : 'Orb Stats'} icon="⚡">
        <div className="grid grid-cols-2 gap-2">
          <StatChip icon={<Layers className="w-3.5 h-3.5" />} label={isHe ? 'שכבות' : 'Layers'} value={String(profile.layerCount)} />
          <StatChip icon={<Sparkles className="w-3.5 h-3.5" />} label={isHe ? 'חלקיקים' : 'Particles'} value={String(profile.particleCount)} />
          <StatChip icon={<Zap className="w-3.5 h-3.5" />} label={isHe ? 'פירוט' : 'Detail'} value={String(profile.geometryDetail)} />
          <StatChip icon={<Wind className="w-3.5 h-3.5" />} label={isHe ? 'טקסטורה' : 'Texture'} value={profile.textureType} />
        </div>
      </Section>

      {/* 5. Color Preview */}
      <Section title={isHe ? 'פלטת צבעים' : 'Color Palette'} icon="🎨">
        <div className="flex items-center gap-2">
          {colors.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-full border-2 border-border shadow-sm"
                style={{ backgroundColor: `hsl(${c})` }}
              />
              <span className="text-[9px] text-muted-foreground">
                {i === 0 ? (isHe ? 'ראשי' : 'Primary') : i === colors.length - 1 ? (isHe ? 'הדגשה' : 'Accent') : (isHe ? 'משני' : 'Secondary')}
              </span>
            </div>
          ))}
        </div>
      </Section>
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

function BehaviorChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border bg-muted/50 border-border">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
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
