/**
 * SelfPanel — Phase D consolidation.
 * Surfaces identity / DNA / AION / pillar-confidence inside the Brain map
 * so the user perceives Brain as their full self model, not a graph dashboard.
 * Pure presentation; reads from existing identity hooks + atlas data.
 */
import { useAION } from '@/identity/useAION';
import { useDNA } from '@/identity/useDNA';
import type { BrainOverview } from './types';

interface SelfPanelProps {
  isRTL: boolean;
  atlas: BrainOverview | null;
}

export default function SelfPanel({ isRTL, atlas }: SelfPanelProps) {
  const { aion, isLoading: aionLoading } = useAION();
  const { dna, isLoading: dnaLoading } = useDNA();

  const topPillars = atlas
    ? Object.entries(atlas.pillars ?? {})
        .sort((a, b) => (b[1]?.confidence ?? 0) - (a[1]?.confidence ?? 0))
        .slice(0, 3)
    : [];

  const loading = aionLoading || dnaLoading;

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      className="rounded-2xl bg-white/[0.04] backdrop-blur-md p-4 space-y-3 border border-white/5"
      data-brain-self-panel
    >
      <header className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {isRTL ? 'העצמי' : 'Self'}
        </h2>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {isRTL ? 'זהות · DNA · עוגנים' : 'Identity · DNA · Anchors'}
        </span>
      </header>

      {loading ? (
        <div className="h-16 rounded-xl bg-muted/20 animate-pulse" />
      ) : (
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <Cell
            label={isRTL ? 'AION' : 'AION'}
            value={aion?.name ?? '—'}
            sub={`${isRTL ? 'דרגה' : 'Lvl'} ${aion?.level ?? 1}`}
          />
          <Cell
            label={isRTL ? 'ארכיטיפ' : 'Archetype'}
            value={dna?.dominantArchetype ?? '—'}
            sub={dna?.secondaryArchetype ?? ''}
          />
          <Cell
            label={isRTL ? 'מצב אגו' : 'Ego'}
            value={aion?.egoState ?? '—'}
            sub={aion?.isMinted ? (isRTL ? 'מוטבע' : 'Minted') : ''}
          />
        </div>
      )}

      {topPillars.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            {isRTL ? 'עוגני ביטחון' : 'Confidence anchors'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topPillars.map(([id, p]) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-foreground/90"
              >
                <span className="capitalize">{id}</span>
                <span className="text-muted-foreground">{Math.round(p?.confidence ?? 0)}%</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Cell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-background/40 px-2.5 py-2">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xs font-semibold text-foreground truncate">{value}</div>
      {sub ? <div className="text-[10px] text-muted-foreground truncate">{sub}</div> : null}
    </div>
  );
}