/**
 * @tab Life > Power > Results
 * Displays Power Index, module subscores, findings, and levers.
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Dumbbell, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PowerDomainConfig, ModuleScore, PowerFinding, PowerLever } from '@/lib/power/types';

export default function PowerResultsPage() {
  const navigate = useNavigate();
  const { t, isRTL, language } = useTranslation();
  const { getDomain, isLoading } = useLifeDomains();

  const row = getDomain('power');
  const config = (row?.domain_config ?? {}) as unknown as PowerDomainConfig;
  const latest = config.latest_assessment;
  const BackIcon = isRTL ? ChevronRight : ArrowLeft;

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

        {/* Power Index */}
        <div className="p-6 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t('power.powerIndex')}</p>
          <span className={cn('text-5xl font-black', latest.powerIndex >= 0 ? scoreColor(latest.powerIndex) : 'text-muted-foreground')}>
            {latest.powerIndex >= 0 ? latest.powerIndex : '—'}
          </span>
          {latest.powerIndex >= 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {latest.powerIndex >= 80 ? t('power.confidenceElite') : latest.powerIndex >= 60 ? t('power.confidenceStrong') : latest.powerIndex >= 40 ? t('power.confidenceModerate') : t('power.confidenceDeveloping')}
            </p>
          )}
        </div>

        {/* Module Subscores */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-foreground">{t('power.subscores')}</h3>
          <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
            {moduleScores.map(ms => (
              <div key={ms.moduleId}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-foreground">{t(`power.mod_${ms.moduleId}`)}</span>
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

        {/* Findings */}
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
                    f.severity === 'notable' ? 'text-red-500' :
                    f.severity === 'moderate' ? 'text-amber-500' : 'text-muted-foreground'
                  )}>•</span>
                  <p className="text-sm text-foreground">{language === 'he' ? f.textHe : f.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Levers */}
        {latest.levers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">{t('power.topLevers')}</h3>
            </div>
            <div className="space-y-2">
              {latest.levers.map((lever: PowerLever, i: number) => (
                <div
                  key={lever.id}
                  className={cn(
                    'p-4 rounded-xl border',
                    i === 0 ? 'border-red-500/40 bg-red-500/5' : 'border-border bg-card'
                  )}
                >
                  <span className={cn(
                    'text-[10px] uppercase font-bold tracking-wider',
                    i === 0 ? 'text-red-500' : 'text-muted-foreground'
                  )}>
                    {i === 0 ? t('power.lever1') : i === 1 ? t('power.lever2') : t('power.lever3')}
                  </span>
                  <p className="text-sm font-bold text-foreground mt-1">{language === 'he' ? lever.nameHe : lever.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{language === 'he' ? lever.whyHe : lever.why}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
