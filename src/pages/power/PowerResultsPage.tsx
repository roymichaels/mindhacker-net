/**
 * @tab Life > Power > Results
 * Power Index, subscores, findings, focus items, fix library, mark complete.
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Dumbbell, Star, Target, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PowerDomainConfig, ModuleScore, PowerFinding, FixItem } from '@/lib/power/types';
import { FIX_LIBRARY } from '@/lib/power/scoring';
import { useState } from 'react';

export default function PowerResultsPage() {
  const navigate = useNavigate();
  const { t, isRTL, language } = useTranslation();
  const { getDomain, upsertDomain, isLoading } = useLifeDomains();
  const [marking, setMarking] = useState(false);

  const row = getDomain('power');
  const config = (row?.domain_config ?? {}) as unknown as PowerDomainConfig;
  const latest = config.latest;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const markComplete = async () => {
    setMarking(true);
    try {
      const newConfig: PowerDomainConfig = {
        ...config,
        completed: true,
        completed_at: new Date().toISOString(),
      };
      await upsertDomain.mutateAsync({
        domainId: 'power',
        config: newConfig as unknown as Record<string, any>,
        status: 'configured',
      });
    } finally {
      setMarking(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  if (!latest) {
    return (
      <PageShell>
        <div className="space-y-4 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/life/power')}>
              <BackIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">{t('power.results')}</h1>
          </div>
          <p className="text-sm text-muted-foreground text-center py-10">{t('power.noAssessment')}</p>
        </div>
      </PageShell>
    );
  }

  const scoreColor = (s: number) =>
    s >= 70 ? 'text-emerald-500' : s >= 50 ? 'text-amber-500' : 'text-red-500';
  const barColor = (s: number) =>
    s >= 70 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-500' : 'bg-red-500';

  const moduleScores = Object.values(latest.moduleScores) as ModuleScore[];

  // Group fix library by tier
  const fixByTier = (tier: 1 | 2 | 3) =>
    FIX_LIBRARY.filter(f => f.tier === tier && f.tags.some(tag => latest.selectedTracks.includes(tag)));

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/power')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <Dumbbell className="w-5 h-5 text-red-500" />
          <h1 className="text-xl font-bold text-foreground">{t('power.results')}</h1>
        </div>

        {/* A) Power Index */}
        <div className="p-6 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t('power.powerIndex')}</p>
          <span className={cn('text-5xl font-black', latest.powerIndex >= 0 ? scoreColor(latest.powerIndex) : 'text-muted-foreground')}>
            {latest.powerIndex >= 0 ? latest.powerIndex : '—'}
          </span>
          <div className="mt-2">
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full',
              latest.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-600' :
              latest.confidence === 'med' ? 'bg-amber-500/10 text-amber-600' :
              'bg-muted text-muted-foreground'
            )}>
              {t(`power.conf_${latest.confidence}`)}
            </span>
          </div>
          {latest.powerIndex >= 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {latest.powerIndex >= 80 ? t('power.confidenceElite') : latest.powerIndex >= 60 ? t('power.confidenceStrong') : latest.powerIndex >= 40 ? t('power.confidenceModerate') : t('power.confidenceDeveloping')}
            </p>
          )}
        </div>

        {/* B) Subscores */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-foreground">{t('power.subscores')}</h3>
          <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
            {moduleScores.map(ms => (
              <div key={ms.trackId}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-foreground">{t(`power.track_${ms.trackId}`)}</span>
                  <span className={cn('text-xs font-bold', ms.score >= 0 ? scoreColor(ms.score) : 'text-muted-foreground')}>
                    {ms.score >= 0 ? `${ms.score}/100` : t('power.unassessed')}
                  </span>
                </div>
                {ms.score >= 0 && (
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden" dir="ltr">
                    <div className={cn('h-full rounded-full transition-all', barColor(ms.score))} style={{ width: `${ms.score}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* C) Findings */}
        {latest.findings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-foreground">{t('power.findings')}</h3>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
              {latest.findings.map((f: PowerFinding) => (
                <div key={f.id} className="flex items-start gap-2">
                  <span className={cn('text-xs mt-0.5',
                    f.severity === 'notable' ? 'text-red-500' : f.severity === 'moderate' ? 'text-amber-500' : 'text-muted-foreground'
                  )}>•</span>
                  <p className="text-sm text-foreground">{language === 'he' ? f.textHe : f.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* D) Top 3 Focus Items */}
        {latest.focusItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">{t('power.topFocus')}</h3>
            </div>
            <div className="space-y-2">
              {latest.focusItems.map((item: FixItem, i: number) => (
                <div key={item.id}
                  className={cn('p-4 rounded-xl border',
                    i === 0 ? 'border-red-500/40 bg-red-500/5' : 'border-border bg-card'
                  )}>
                  <span className={cn('text-[10px] uppercase font-bold tracking-wider',
                    i === 0 ? 'text-red-500' : 'text-muted-foreground'
                  )}>
                    {i === 0 ? t('power.lever1') : i === 1 ? t('power.lever2') : t('power.lever3')}
                  </span>
                  <p className="text-sm font-bold text-foreground mt-1">{language === 'he' ? item.titleHe : item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{language === 'he' ? item.whyHe : item.why}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* E) Fix Library */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-bold text-sm text-foreground">{t('power.fixLibrary')}</h3>
          </div>
          {([1, 2, 3] as const).map(tier => {
            const items = fixByTier(tier);
            if (items.length === 0) return null;
            return (
              <div key={tier} className="space-y-1.5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(`power.tier${tier}`)}
                </p>
                {items.map(item => (
                  <div key={item.id} className="p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">{language === 'he' ? item.titleHe : item.title}</p>
                      <div className="flex gap-1">
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full',
                          item.impact === 'high' ? 'bg-emerald-500/10 text-emerald-600' :
                          item.impact === 'med' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-muted text-muted-foreground'
                        )}>{t(`power.impact_${item.impact}`)}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{language === 'he' ? item.whyHe : item.why}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* F) Mark Complete */}
        {!config.completed && (
          <Button onClick={markComplete} disabled={marking} variant="outline"
            className="w-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5" size="lg">
            <CheckCircle2 className="w-4 h-4 me-2" />
            {marking ? t('common.saving') : t('power.markComplete')}
          </Button>
        )}

        {config.completed && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-sm font-medium text-emerald-600">{t('power.assessmentComplete')}</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
