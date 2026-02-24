/**
 * @page FocusResults (/life/focus/results)
 * Displays assessment results: overall index, subscores, findings, fix library.
 */
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useFocusCoach } from '@/hooks/useFocusCoach';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, Check, AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { FocusAssessmentResult, SubsystemId } from '@/lib/focus/types';

const SUBSYSTEM_ICONS: Record<string, string> = {
  breath_control: '🫁', attention_stability: '🧘', guided_suggestibility: '🎧',
  trance_depth: '🌀', somatic_awareness: '☯️', structural_calm: '🧎',
};

const TIER_LABELS: Record<number, string> = { 1: 'focus.tier1', 2: 'focus.tier2', 3: 'focus.tier3' };

function scoreColor(v: number): string {
  if (v >= 70) return 'text-emerald-400';
  if (v >= 40) return 'text-amber-400';
  return 'text-red-400';
}

export default function FocusResults() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { config, saveFocusItems, markComplete, isSaving } = useFocusCoach();
  const [searchParams] = useSearchParams();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Support viewing history entry via ?idx=N
  const histIdx = searchParams.get('idx');
  const assessment: FocusAssessmentResult | undefined = useMemo(() => {
    if (histIdx != null) {
      const idx = parseInt(histIdx);
      return config.history?.[idx];
    }
    return config.latest_assessment;
  }, [histIdx, config]);

  const isHistorical = histIdx != null;


  if (!assessment) {
    return (
      <PageShell>
        <div className="text-center py-20" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className="text-muted-foreground">{t('focus.noResults')}</p>
          <Button onClick={() => navigate('/life/focus/assess')} className="mt-4">{t('focus.beginScan')}</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/focus')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('focus.resultsTitle')}</h1>
        </div>

        {/* A) Overall Index */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-6 bg-gradient-to-b from-cyan-500/10 to-transparent border-cyan-500/30 text-center">
            <p className="text-5xl font-black text-foreground">{assessment.overall_index}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('focus.overallIndex')}</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <Badge variant={assessment.confidence === 'high' ? 'default' : 'secondary'}>
                {t(`focus.confidence_${assessment.confidence}`)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {assessment.completeness_pct}% {t('focus.complete')}
              </span>
            </div>
          </Card>
        </motion.div>

        {/* B) Subscores grid */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('focus.subscoresTitle')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(assessment.subscores) as [SubsystemId, number][]).map(([key, val]) => (
              <Card key={key} className="p-3 bg-card border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <span>{SUBSYSTEM_ICONS[key]}</span>
                  <span className="text-xs text-muted-foreground">{t(`focus.sub_${key}`)}</span>
                </div>
                <p className={cn("text-2xl font-black", scoreColor(val))}>{val}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* C) Findings */}
        {assessment.findings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('focus.findingsTitle')}</h3>
            <div className="space-y-2">
              {assessment.findings.map(f => (
                <Card key={f.id} className={cn(
                  "p-3 flex items-start gap-3",
                  f.severity === 'high' ? 'border-red-500/30' : f.severity === 'med' ? 'border-amber-500/30' : 'border-border'
                )}>
                  <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0",
                    f.severity === 'high' ? 'text-red-400' : f.severity === 'med' ? 'text-amber-400' : 'text-muted-foreground'
                  )} />
                  <div>
                    <p className="text-sm text-foreground">{t(f.text_key)}</p>
                    <span className="text-xs text-muted-foreground">{t(`focus.sub_${f.subsystem}`)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Mark complete */}
        {!isHistorical && !config.completed && (
          <Button onClick={markComplete} disabled={isSaving} variant="outline"
            className="w-full border-cyan-500/40 text-cyan-500 hover:bg-cyan-500/10" size="lg">
            <Check className="w-4 h-4 me-1" /> {t('focus.markComplete')}
          </Button>
        )}
      </div>
    </PageShell>
  );
}
