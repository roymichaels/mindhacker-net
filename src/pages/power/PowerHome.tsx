/**
 * @tab Life > Power
 * PowerHome — Assessment CTA + Last assessment summary. Bilingual + RTL.
 * Reads from unified `latest_assessment` (DomainAssessmentResult) shape.
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowLeft, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useDomainAssessment } from '@/hooks/useDomainAssessment';
import { useState, useEffect } from 'react';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';

export default function PowerHome() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { statusMap, isLoading } = useLifeDomains();
  const { config } = useDomainAssessment('power');

  const latest = config.latest_assessment;
  const status = statusMap['power'] ?? 'unconfigured';

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const { startAssessment } = useAuroraChatContext();

  useEffect(() => {
    if (!isLoading && !latest && status === 'unconfigured') {
      startAssessment('power');
    }
  }, [isLoading, latest, status]);

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
            <h2 className="text-lg font-bold text-foreground">{t('power.startAssessment')}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t('power.assessmentDesc')}
          </p>
          <Button onClick={() => setAssessOpen(true)} className="w-full bg-red-600 hover:bg-red-700" size="lg">
            {latest ? t('power.reAssess') : t('power.beginAssessment')} <ChevronIcon className="w-4 h-4 ms-1" />
          </Button>
        </div>

        {/* Last Assessment Summary (unified shape) */}
        {latest && (
          <div className="p-4 rounded-2xl border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('power.lastAssessment')}</p>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${(latest.domain_index ?? 0) >= 70 ? 'text-emerald-500' : (latest.domain_index ?? 0) >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                  {latest.domain_index ?? '—'}
                </span>
                <span className="text-sm text-muted-foreground">{t('power.powerIndex')}</span>
              </div>
              <div className="text-end">
                <p className="text-xs text-muted-foreground">
                  {new Date(latest.assessed_at).toLocaleDateString()}
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {t(`power.conf_${latest.confidence}`)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/life/power/results')} className="flex-1">
                {t('power.viewResults')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAssessOpen(true)} className="flex-1">
                {t('power.reAssess')}
              </Button>
            </div>
          </div>
        )}

        {/* History */}
        {config.history && config.history.length > 0 && (
          <Button variant="ghost" className="w-full justify-between" onClick={() => navigate('/life/power/history')}>
            <span>{t('power.assessmentHistory')}</span>
            <ChevronIcon className="w-4 h-4" />
          </Button>
        )}

        {/* Completion */}
        {(status === 'active' || status === 'configured') && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-sm font-medium text-emerald-600">{t('power.assessmentComplete')}</p>
          </div>
        )}

        {/* Needs reassessment */}
        {status === 'needs_reassessment' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-sm font-medium text-amber-600">
              {isRTL ? 'נדרש אבחון מחדש — הנתונים חסרים או ישנים' : 'Reassessment needed — data incomplete or outdated'}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {t('power.plansNote')}
        </p>
      </div>
      <DomainAssessModal open={assessOpen} onOpenChange={setAssessOpen} domainId="power" />
    </PageShell>
  );
}
