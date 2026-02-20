/**
 * @tab Life
 * @purpose Full bio-scan results — Index, Subscores, Findings, Fix Library, Focus Selection, Mark Complete. Bilingual + RTL.
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FindingsList from '@/components/presence/FindingsList';
import FixLibrary from '@/components/presence/FixLibrary';
import TopPriorities from '@/components/presence/TopPriorities';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import type { SubScoreKey } from '@/lib/presence/types';

const SUB_SCORE_ORDER: SubScoreKey[] = [
  'facial_structure',
  'posture_alignment',
  'body_composition',
  'frame_development',
  'inflammation_puffiness',
];

export default function PresenceResultsPage() {
  const navigate = useNavigate();
  const { config, isLoading, isSaving, saveFocusItems, markComplete } = usePresenceCoach();
  const { t, isRTL } = useTranslation();
  const latest = config.latest_scan;

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  if (!latest) {
    navigate('/life/presence');
    return null;
  }

  const getScoreColor = (s: number) => {
    if (s >= 70) return 'text-emerald-500';
    if (s >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getBarColor = (s: number) => {
    if (s >= 70) return 'bg-emerald-500';
    if (s >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleMarkComplete = async () => {
    try {
      await markComplete();
      toast.success(t('presence.assessmentComplete'));
    } catch {
      toast.error('Failed to mark complete.');
    }
  };

  const handleFocusChange = async (selectedIds: string[]) => {
    try {
      await saveFocusItems(selectedIds);
    } catch {
      toast.error('Failed to save focus items.');
    }
  };

  const BackIcon = isRTL ? ChevronRight : ArrowLeft;

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/presence')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('presence.results')}</h1>
        </div>

        {/* A) Presence Index */}
        <div className="p-6 rounded-2xl border border-border bg-card text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('presence.presenceIndex')}</p>
          <p className={cn('text-5xl font-black', getScoreColor(latest.presence_index))}>
            {latest.presence_index}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {latest.confidence} {t('presence.confidence')}
            </span>
            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {t('presence.structuralPotential')}: {latest.structural_potential}
            </span>
          </div>
        </div>

        {/* Low confidence warning */}
        {latest.confidence === 'low' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-sm text-amber-600">{t('presence.lowConfidenceBanner')}</p>
          </div>
        )}

        {/* B) Subscores */}
        <div className="space-y-2">
          <h3 className="font-bold text-foreground text-sm">{t('presence.subscores')}</h3>
          {SUB_SCORE_ORDER.map(key => {
            const sub = latest.scores[key];
            if (!sub) return null;
            return (
              <div key={key} className="p-3 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{sub.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-lg font-bold', getScoreColor(sub.score))}>{sub.score}</span>
                    <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-muted text-muted-foreground">
                      {sub.confidence}
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', getBarColor(sub.score))}
                    style={{
                      width: `${sub.score}%`,
                      [isRTL ? 'marginRight' : 'marginLeft']: '0',
                      float: isRTL ? 'right' : 'left',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* C) Findings */}
        {latest.findings.length > 0 && (
          <FindingsList findings={latest.findings} />
        )}

        {/* E) Top 3 Priorities */}
        <TopPriorities
          priorities={latest.top_priorities}
          selectedIds={config.focus_items_selected ?? []}
          onToggle={handleFocusChange}
        />

        {/* D) Fix Library */}
        <FixLibrary
          selectedIds={config.focus_items_selected ?? []}
          onSelectionChange={handleFocusChange}
        />

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center">
          {t('presence.disclaimer')}
        </p>

        {/* F) Mark Complete */}
        {!config.completed ? (
          <Button
            onClick={handleMarkComplete}
            disabled={isSaving}
            className="w-full"
            variant="outline"
          >
            <CheckCircle2 className="w-4 h-4 me-2" />
            {t('presence.markComplete')}
          </Button>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-sm font-medium text-emerald-600">{t('presence.assessmentComplete')}</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
