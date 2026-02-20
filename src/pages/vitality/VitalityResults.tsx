/**
 * @tab Life > Vitality > Results
 * @purpose Vitality Index, subsystem scores, findings, missing data
 * @data useVitalityEngine
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useVitalityEngine } from '@/hooks/useVitalityEngine';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { VITALITY_DATA_MAP } from '@/lib/vitality/dataMap';

const SUBSYSTEM_LABELS: Record<string, string> = {
  sleep_quality: 'vitality.sub.sleepQuality',
  circadian_stability: 'vitality.sub.circadianStability',
  energy_mood: 'vitality.sub.energyMood',
  stress_recovery: 'vitality.sub.stressRecovery',
  dopamine_load: 'vitality.sub.dopamineLoad',
  nutritional_stability: 'vitality.sub.nutritionalStability',
  hydration_balance: 'vitality.sub.hydrationBalance',
  recovery_capacity: 'vitality.sub.recoveryCapacity',
  hormonal_signal: 'vitality.sub.hormonalSignal',
};

export default function VitalityResults() {
  const navigate = useNavigate();
  const { t, isRTL, language } = useTranslation();
  const { latestAssessment, config, isLoading, markComplete, isSaving } = useVitalityEngine();
  const [showMissing, setShowMissing] = useState(false);
  const [marking, setMarking] = useState(false);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  if (!latestAssessment) {
    return (
      <PageShell>
        <div className="space-y-4 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/life/vitality')}>
              <BackIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">{t('vitality.results')}</h1>
          </div>
          <p className="text-sm text-muted-foreground text-center py-10">{t('vitality.noAssessment')}</p>
        </div>
      </PageShell>
    );
  }

  const scoreColor = (s: number) =>
    s >= 70 ? 'text-emerald-500' : s >= 50 ? 'text-amber-500' : 'text-red-500';
  const barColor = (s: number) =>
    s >= 70 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-500' : 'bg-red-500';

  const subsystems = Object.values(latestAssessment.subsystemScores);

  // Collect all missing inputs across subsystems
  const allMissing = new Set<string>();
  for (const ss of subsystems) {
    for (const m of ss.inputsMissing) allMissing.add(m);
  }
  const missingFields = VITALITY_DATA_MAP.filter(f => allMissing.has(f.internalKey));

  const handleMarkComplete = async () => {
    setMarking(true);
    try { await markComplete(); } finally { setMarking(false); }
  };

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/vitality')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <Sun className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold text-foreground">{t('vitality.results')}</h1>
        </div>

        {/* A) Vitality Index */}
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/10 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t('vitality.vitalityIndex')}</p>
          <span className={cn('text-5xl font-black', scoreColor(latestAssessment.vitalityIndex))}>
            {latestAssessment.vitalityIndex}
          </span>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full',
              latestAssessment.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-600' :
              latestAssessment.confidence === 'med' ? 'bg-amber-500/10 text-amber-600' :
              'bg-muted text-muted-foreground'
            )}>
              {t(`vitality.conf_${latestAssessment.confidence}`)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {Math.round(latestAssessment.completeness * 100)}% {t('vitality.dataComplete')}
            </span>
          </div>
        </div>

        {/* B) Subsystem Scores */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-foreground">{t('vitality.subsystems')}</h3>
          <div className="grid grid-cols-1 gap-2">
            {subsystems.map(ss => (
              <div key={ss.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-foreground">{t(SUBSYSTEM_LABELS[ss.id])}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full',
                      ss.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-600' :
                      ss.confidence === 'med' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {t(`vitality.conf_${ss.confidence}`)}
                    </span>
                    <span className={cn('text-xs font-bold', ss.score >= 0 ? scoreColor(ss.score) : 'text-muted-foreground')}>
                      {ss.score >= 0 ? `${ss.score}` : '—'}
                    </span>
                  </div>
                </div>
                {ss.score >= 0 && (
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden" dir="ltr">
                    <div className={cn('h-full rounded-full transition-all', barColor(ss.score))} style={{ width: `${ss.score}%` }} />
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {Math.round(ss.dataCompleteness * 100)}% {t('vitality.dataComplete')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* C) Findings */}
        {latestAssessment.findings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-foreground">{t('vitality.findings')}</h3>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
              {latestAssessment.findings.map(f => (
                <div key={f.id} className="flex items-start gap-2">
                  <span className={cn('text-xs mt-0.5',
                    f.severity === 'concern' ? 'text-red-500' : f.severity === 'positive' ? 'text-emerald-500' : 'text-muted-foreground'
                  )}>•</span>
                  <p className="text-sm text-foreground">{t(f.textKey)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* D) Missing Data (collapsed) */}
        {missingFields.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowMissing(!showMissing)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              {showMissing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{t('vitality.missingData')} ({missingFields.length})</span>
            </button>
            {showMissing && (
              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                {missingFields.map(f => (
                  <p key={f.internalKey} className="text-xs text-muted-foreground">
                    • {t(f.labelKey)}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mark Complete */}
        {!config.completed && (
          <Button onClick={handleMarkComplete} disabled={marking} variant="outline"
            className="w-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5" size="lg">
            <CheckCircle2 className="w-4 h-4 me-2" />
            {marking ? t('common.saving') : t('vitality.markComplete')}
          </Button>
        )}

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
