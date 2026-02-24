/**
 * @tab Life > Power > History
 * Reads from unified DomainAssessmentResult history.
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useDomainAssessment } from '@/hooks/useDomainAssessment';
import { ArrowLeft, ArrowRight, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { DomainAssessmentResult } from '@/lib/domain-assess/types';

export default function PowerHistory() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { config, isLoading } = useDomainAssessment('power');

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const allAssessments: DomainAssessmentResult[] = [];
  if (config.latest_assessment) allAssessments.push(config.latest_assessment);
  if (config.history) allAssessments.push(...config.history);
  allAssessments.sort((a, b) => new Date(b.assessed_at).getTime() - new Date(a.assessed_at).getTime());

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
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/power')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <Dumbbell className="w-5 h-5 text-red-500" />
          <h1 className="text-xl font-bold text-foreground">{t('power.assessmentHistory')}</h1>
        </div>

        {allAssessments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">{t('power.noAssessment')}</p>
        ) : (
          <div className="space-y-3">
            {allAssessments.map((a, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className={cn('text-2xl font-black', scoreColor(a.domain_index))}>
                      {a.domain_index}
                    </span>
                    <Badge variant={a.confidence === 'high' ? 'default' : 'secondary'} className="text-xs">
                      {t(`power.conf_${a.confidence}`)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.assessed_at).toLocaleDateString()}
                  </span>
                </div>
                {a.subscores && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(a.subscores).map(([key, val]) => (
                      <span key={key} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {key}: {val as number}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
