/**
 * @tab Life > Vitality > History
 * @purpose List of prior vitality assessments (read-only)
 * @data useVitalityEngine
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useVitalityEngine } from '@/hooks/useVitalityEngine';
import { ArrowLeft, ArrowRight, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VitalityAssessment } from '@/lib/vitality/types';

export default function VitalityHistory() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { config, latestAssessment, isLoading } = useVitalityEngine();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const allAssessments: VitalityAssessment[] = [];
  if (latestAssessment) allAssessments.push(latestAssessment);
  if (config.history) allAssessments.push(...config.history);
  allAssessments.sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());

  const scoreColor = (s: number) =>
    s >= 70 ? 'text-emerald-500' : s >= 50 ? 'text-amber-500' : 'text-red-500';

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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/vitality')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <Sun className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold text-foreground">{t('vitality.assessmentHistory')}</h1>
        </div>

        {allAssessments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">{t('vitality.noAssessment')}</p>
        ) : (
          <div className="space-y-3">
            {allAssessments.map((a, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className={cn('text-2xl font-black', scoreColor(a.vitalityIndex))}>
                      {a.vitalityIndex}
                    </span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full',
                      a.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-600' :
                      a.confidence === 'med' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-muted text-muted-foreground'
                    )}>{t(`vitality.conf_${a.confidence}`)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.assessedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{Math.round(a.completeness * 100)}% {t('vitality.dataComplete')}</span>
                  <span>•</span>
                  <span>{a.findings.length} {t('vitality.findingsCount')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
