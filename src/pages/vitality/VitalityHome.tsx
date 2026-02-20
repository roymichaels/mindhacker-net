/**
 * @tab Life > Vitality
 * @purpose Precision Vitality Intelligence Engine — Home / Snapshot
 * @data useVitalityEngine, useLifeDomains
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useNavigate } from 'react-router-dom';
import { Sun, ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, AlertTriangle, RefreshCw, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useVitalityEngine } from '@/hooks/useVitalityEngine';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const SUBSYSTEM_LABELS: Record<string, string> = {
  sleep_quality: 'vitality.sub.sleepQuality',
  circadian_stability: 'vitality.sub.circadianStability',
  dopamine_load: 'vitality.sub.dopamineLoad',
  nutritional_stability: 'vitality.sub.nutritionalStability',
  hydration_balance: 'vitality.sub.hydrationBalance',
  recovery_capacity: 'vitality.sub.recoveryCapacity',
  hormonal_signal: 'vitality.sub.hormonalSignal',
};

export default function VitalityHome() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { latestAssessment, config, isLoading, hasData, runAssessment, isSaving } = useVitalityEngine();
  const [computing, setComputing] = useState(false);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleCompute = async () => {
    setComputing(true);
    try {
      await runAssessment();
    } finally {
      setComputing(false);
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

  const scoreColor = (s: number) =>
    s >= 70 ? 'text-emerald-500' : s >= 50 ? 'text-amber-500' : 'text-red-500';

  // Best/worst subsystems for chips
  const subsystems = latestAssessment
    ? Object.values(latestAssessment.subsystemScores)
        .filter(s => s.score >= 0)
        .sort((a, b) => b.score - a.score)
    : [];
  const topChips = subsystems.slice(0, 2);
  const bottomChips = subsystems.slice(-1);
  const chips = [...topChips, ...bottomChips].filter((v, i, arr) => arr.findIndex(a => a.id === v.id) === i);

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <Sun className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-foreground">{t('vitality.title')}</h1>
        </div>

        {/* Low data banner */}
        {hasData && latestAssessment && latestAssessment.completeness < 0.5 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-600">{t('vitality.lowDataCoverage')}</p>
          </div>
        )}

        {/* Snapshot Card */}
        {latestAssessment ? (
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <div className="text-center mb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t('vitality.vitalityIndex')}</p>
              <span className={cn('text-5xl font-black', scoreColor(latestAssessment.vitalityIndex))}>
                {latestAssessment.vitalityIndex}
              </span>
              <div className="mt-2">
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full',
                  latestAssessment.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-600' :
                  latestAssessment.confidence === 'med' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-muted text-muted-foreground'
                )}>
                  {t(`vitality.conf_${latestAssessment.confidence}`)}
                </span>
              </div>
            </div>

            {/* Subsystem chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                {chips.map(s => (
                  <span key={s.id} className={cn('text-[10px] px-2 py-0.5 rounded-full border',
                    s.score >= 70 ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5' :
                    s.score >= 50 ? 'border-amber-500/30 text-amber-600 bg-amber-500/5' :
                    'border-red-500/30 text-red-500 bg-red-500/5'
                  )}>
                    {t(SUBSYSTEM_LABELS[s.id])} {s.score}
                  </span>
                ))}
              </div>
            )}

            <Button onClick={() => navigate('/life/vitality/results')} className="w-full bg-amber-600 hover:bg-amber-700" size="lg">
              {t('vitality.viewResults')} <ChevronIcon className="w-4 h-4 ms-1" />
            </Button>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Sun className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-foreground">{t('vitality.startIntakeTitle')}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t('vitality.startIntakeDesc')}</p>
            <Button
              onClick={() => navigate('/life/vitality/intake')}
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              <ClipboardList className="w-4 h-4 me-2" />
              {t('vitality.startIntake')}
            </Button>
          </div>
        )}

        {/* Recompute button */}
        {latestAssessment && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleCompute} disabled={computing}>
              <RefreshCw className={cn('w-4 h-4 me-2', computing && 'animate-spin')} />
              {t('vitality.recompute')}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate('/life/vitality/intake')}>
              <ClipboardList className="w-4 h-4 me-2" />
              {t('vitality.retakeIntake')}
            </Button>
          </div>
        )}

        {/* Last assessed */}
        {latestAssessment && (
          <p className="text-xs text-muted-foreground text-center">
            {t('vitality.lastAssessed')}: {new Date(latestAssessment.assessedAt).toLocaleDateString()}
          </p>
        )}

        {/* History link */}
        {config.history && config.history.length > 0 && (
          <Button variant="ghost" className="w-full justify-between" onClick={() => navigate('/life/vitality/history')}>
            <span>{t('vitality.assessmentHistory')}</span>
            <ChevronIcon className="w-4 h-4" />
          </Button>
        )}

        {/* Completion */}
        {config.completed && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-sm font-medium text-emerald-600">{t('vitality.assessmentComplete')}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">{t('vitality.disclaimer')}</p>
      </div>
    </PageShell>
  );
}
