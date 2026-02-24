/**
 * @tab Life > Power > Results
 * Unified assessment results page — reads from latest_assessment (DomainAssessmentResult).
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useDomainAssessment } from '@/hooks/useDomainAssessment';
import { AlertTriangle, ArrowLeft, ArrowRight, Dumbbell, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DOMAIN_ASSESS_META } from '@/lib/domain-assess/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function PowerResultsPage() {
  const navigate = useNavigate();
  const { t, isRTL, language } = useTranslation();
  const isHe = language === 'he';
  const { config, isLoading } = useDomainAssessment('power');

  const latest = config.latest_assessment;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const meta = DOMAIN_ASSESS_META['power'];
  const lang = isHe ? 'he' : 'en';

  const scoreColor = (s: number) =>
    s >= 70 ? 'text-emerald-500' : s >= 50 ? 'text-amber-500' : 'text-red-500';
  const barColor = (s: number) =>
    s >= 70 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-500' : 'bg-red-500';

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

        {/* Overall Index */}
        <div className="p-6 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t('power.powerIndex')}</p>
          <span className={cn('text-5xl font-black', scoreColor(latest.domain_index))}>
            {latest.domain_index}
          </span>
          <div className="mt-2">
            <Badge variant={latest.confidence === 'high' ? 'default' : 'secondary'} className="text-xs">
              {t(`power.conf_${latest.confidence}`)}
            </Badge>
          </div>
        </div>

        {/* Mirror Statement */}
        {latest.mirror_statement && (
          <Card className="p-5 border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-red-500">
                {isHe ? 'מה שאני רואה' : 'What I See'}
              </h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {latest.mirror_statement[lang]}
            </p>
          </Card>
        )}

        {/* Subscores */}
        {meta && latest.subscores && (
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-foreground">{t('power.subscores')}</h3>
            <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
              {meta.subsystems.map(sub => {
                const val = latest.subscores?.[sub.id] ?? 0;
                return (
                  <div key={sub.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <span>{sub.icon}</span> {t(sub.nameKey)}
                      </span>
                      <span className={cn('text-xs font-bold', scoreColor(val))}>
                        {val}/100
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden" dir="ltr">
                      <div className={cn('h-full rounded-full transition-all', barColor(val))} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Findings */}
        {latest.findings && latest.findings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-foreground">{t('power.findings')}</h3>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
              {latest.findings.map((f: any) => (
                <div key={f.id} className="flex items-start gap-2">
                  <span className={cn('text-xs mt-0.5',
                    f.severity === 'high' ? 'text-red-500' : f.severity === 'med' ? 'text-amber-500' : 'text-muted-foreground'
                  )}>•</span>
                  <p className="text-sm text-foreground">{isHe ? (f.text_he || f.textHe || f.text) : (f.text_en || f.text)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* One Next Step */}
        {latest.one_next_step && (
          <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-400">
                {isHe ? 'הצעד הבא' : 'One Next Step'}
              </h3>
            </div>
            <p className="text-sm text-foreground">{latest.one_next_step[lang]}</p>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
