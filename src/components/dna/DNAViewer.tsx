/**
 * DNAViewer — Wraps DNAHelix with REAL user DNA data from useDNA().
 * Maps DNAProfile traits → helix labels, colors, and positions.
 * This is the component to use in the UI — never use DNAHelix directly.
 */
import { useMemo } from 'react';
import { useDNA } from '@/identity/useDNA';
import { useTranslation } from '@/hooks/useTranslation';
import DNAHelix, { type LabelItem } from './DNAHelix';
import { Loader2 } from 'lucide-react';

/** Trait → color mapping (consistent across the system) */
const TRAIT_COLORS: Record<string, string> = {
  consistency: '#3B82F6',   // blue
  discipline: '#6366F1',    // indigo
  energy: '#22C55E',        // green
  social: '#F59E0B',        // amber
  consciousness: '#A855F7', // purple
  presence: '#06B6D4',      // cyan
  power: '#EF4444',         // red
  vitality: '#10B981',      // emerald
  focus: '#3B82F6',         // blue
  combat: '#DC2626',        // red
  expansion: '#8B5CF6',     // violet
  wealth: '#F59E0B',        // amber
  influence: '#EC4899',     // pink
  relationships: '#F43F5E', // rose
  business: '#14B8A6',      // teal
  projects: '#0EA5E9',      // sky
  play: '#FBBF24',          // yellow
  order: '#64748B',         // slate
};

/** Hebrew labels for known traits */
const TRAIT_LABELS_HE: Record<string, string> = {
  consistency: 'עקביות',
  discipline: 'משמעת',
  energy: 'אנרגיה',
  social: 'חברתיות',
  consciousness: 'תודעה',
  presence: 'נוכחות',
  power: 'כוח',
  vitality: 'חיוניות',
  focus: 'מיקוד',
  combat: 'לחימה',
  expansion: 'התרחבות',
  wealth: 'עושר',
  influence: 'השפעה',
  relationships: 'מערכות יחסים',
  business: 'עסקים',
  projects: 'פרויקטים',
  play: 'משחק',
  order: 'סדר',
};

/** Subtitle descriptions */
const TRAIT_SUBTITLES: Record<string, { en: string; he: string }> = {
  consistency: { en: 'Streak & Habit Pattern', he: 'דפוס רצף והרגלים' },
  discipline: { en: 'Habit Completion Rate', he: 'שיעור השלמת הרגלים' },
  energy: { en: 'Energy Level Pattern', he: 'דפוס רמת אנרגיה' },
  social: { en: 'Community Engagement', he: 'מעורבות קהילתית' },
  consciousness: { en: 'Awareness & Clarity', he: 'מודעות ובהירות' },
  focus: { en: 'Concentration Pattern', he: 'דפוס ריכוז' },
  power: { en: 'Strength & Resilience', he: 'חוזק ועמידות' },
  vitality: { en: 'Health & Wellness', he: 'בריאות ורווחה' },
};

function getTraitDetails(key: string, value: number, isHe: boolean): string[] {
  const pct = Math.round(value * 100);
  const strength = value >= 0.7 ? (isHe ? 'חזק' : 'Strong') : value >= 0.4 ? (isHe ? 'בינוני' : 'Moderate') : (isHe ? 'מתפתח' : 'Developing');
  return [
    isHe ? `עוצמה: ${pct}%` : `Intensity: ${pct}%`,
    isHe ? `רמה: ${strength}` : `Level: ${strength}`,
  ];
}

function cleanTraitKey(key: string): string {
  return key.replace(/^(value:|skill:)/, '');
}

interface DNAViewerProps {
  className?: string;
  height?: number;
}

export default function DNAViewer({ className, height = 360 }: DNAViewerProps) {
  const { dna, isLoading } = useDNA();
  const { language } = useTranslation();
  const isHe = language === 'he';

  const { labels, primary, secondary, particle } = useMemo(() => {
    const traits = dna.dnaTraits;
    // Sort by weight, take top 5
    const sorted = Object.entries(traits)
      .map(([k, v]) => ({ key: cleanTraitKey(k), weight: v }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    if (sorted.length === 0) {
      return {
        labels: [] as LabelItem[],
        primary: '#6366F1',
        secondary: '#8B5CF6',
        particle: '#22C55E',
      };
    }

    const items: LabelItem[] = sorted.map((t, i) => ({
      position: sorted.length === 1 ? 0.5 : (i + 0.5) / sorted.length,
      title: isHe ? (TRAIT_LABELS_HE[t.key] || t.key) : t.key.charAt(0).toUpperCase() + t.key.slice(1),
      subtitle: TRAIT_SUBTITLES[t.key]?.[isHe ? 'he' : 'en'] || (isHe ? 'אות DNA' : 'DNA Signal'),
      details: getTraitDetails(t.key, t.weight, isHe),
      color: TRAIT_COLORS[t.key] || '#6366F1',
    }));

    // Derive helix colors from top 2 traits
    const p = TRAIT_COLORS[sorted[0]?.key] || '#6366F1';
    const s = TRAIT_COLORS[sorted[1]?.key] || '#8B5CF6';
    const pt = TRAIT_COLORS[sorted[2]?.key] || '#22C55E';

    return { labels: items, primary: p, secondary: s, particle: pt };
  }, [dna.dnaTraits, isHe]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (labels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground text-sm" style={{ height: height / 2 }}>
        <p>{isHe ? 'אין מספיק נתוני DNA עדיין' : 'Not enough DNA data yet'}</p>
        <p className="text-xs mt-1 opacity-60">{isHe ? 'השלם את ה-Launchpad כדי לגלות את ה-DNA שלך' : 'Complete the Launchpad to discover your DNA'}</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <DNAHelix
        labels={labels}
        primaryColor={primary}
        secondaryColor={secondary}
        particleColor={particle}
        autoRotate
        rotationSpeed={2.5}
        helixPitch={10}
        helixRadius={3}
        helixHeight={22}
        tubeRadius={0.35}
        particleCount={60}
        particleSize={0.08}
        particleOpacity={0.7}
        particleMovement
        particleSpeed={0.8}
        glowIntensity={1.2}
      />
    </div>
  );
}
