/**
 * @tab Life > Power > History
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { ArrowLeft, ArrowRight, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PowerDomainConfig, PowerAssessment } from '@/lib/power/types';

export default function PowerHistory() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { getDomain, isLoading } = useLifeDomains();

  const row = getDomain('power');
  const config = (row?.domain_config ?? {}) as unknown as PowerDomainConfig;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const allAssessments: PowerAssessment[] = [];
  if (config.latest) allAssessments.push(config.latest);
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
                    <span className={cn('text-2xl font-black', a.powerIndex >= 0 ? scoreColor(a.powerIndex) : 'text-muted-foreground')}>
                      {a.powerIndex >= 0 ? a.powerIndex : '—'}
                    </span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full',
                      a.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-600' :
                      a.confidence === 'med' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-muted text-muted-foreground'
                    )}>{t(`power.conf_${a.confidence}`)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.assessedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {a.selectedTracks.map(m => (
                    <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {t(`power.track_${m}`)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
