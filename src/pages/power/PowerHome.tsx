/**
 * @tab Life > Power
 * @purpose Power Pillar Home — Assessment CTA + Last assessment summary. Bilingual + RTL.
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import type { PowerDomainConfig } from '@/lib/power/types';

export default function PowerHome() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { getDomain, isLoading } = useLifeDomains();

  const row = getDomain('power');
  const config = (row?.domain_config ?? {}) as unknown as PowerDomainConfig;
  const latest = config.latest_assessment;

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
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

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <Dumbbell className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-bold text-foreground">{t('power.title')}</h1>
        </div>

        {/* Primary CTA */}
        <div className="p-6 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground">{t('power.assessment')}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t('power.assessmentDesc')}
          </p>
          <Button onClick={() => navigate('/life/power/assess')} className="w-full bg-red-600 hover:bg-red-700" size="lg">
            {t('power.beginAssessment')} <ChevronIcon className="w-4 h-4 ms-1" />
          </Button>
        </div>

        {/* Last Assessment */}
        {latest && (
          <div className="p-4 rounded-2xl border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('power.lastAssessment')}</p>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${latest.powerIndex >= 70 ? 'text-emerald-500' : latest.powerIndex >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                  {latest.powerIndex >= 0 ? latest.powerIndex : '—'}
                </span>
                <span className="text-sm text-muted-foreground">{t('power.powerIndex')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(latest.assessedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/life/power/results')} className="flex-1">
                {t('power.viewResults')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/life/power/assess')} className="flex-1">
                {t('power.reAssess')}
              </Button>
            </div>
          </div>
        )}

        {/* History link */}
        {config.history && config.history.length > 0 && (
          <Button variant="ghost" className="w-full justify-between" onClick={() => navigate('/life/power/history')}>
            <span>{t('power.assessmentHistory')}</span>
            <ChevronIcon className="w-4 h-4" />
          </Button>
        )}

        {/* Completion badge */}
        {config.completed && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-sm font-medium text-emerald-600">{t('power.assessmentComplete')}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {t('power.plansNote')}
        </p>
      </div>
    </PageShell>
  );
}
