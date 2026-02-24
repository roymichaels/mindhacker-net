/**
 * @page ConsciousnessResults (/life/consciousness/results)
 * @tab Life
 * @purpose Displays consciousness assessment results — mirror, scores, findings, toolkit
 * @data useConsciousnessCoach, life_domains
 */
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useConsciousnessCoach } from '@/hooks/useConsciousnessCoach';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, Check, AlertTriangle,
  AlertCircle, Sparkles, Target,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { ConsciousnessAssessmentResult, ConsciousnessSubsystemId } from '@/lib/consciousness/types';

const SUBSYSTEM_ICONS: Record<string, string> = {
  soul_intent_clarity: '🔮', mask_awareness: '🎭',
  frequency_stability: '〰️', alignment_integrity: '🧭',
  inner_signal_access: '👁️', field_coherence: '🌀',
};

const TIER_LABELS: Record<number, string> = { 1: 'consciousness.tier1', 2: 'consciousness.tier2', 3: 'consciousness.tier3' };

function scoreColor(v: number): string {
  if (v >= 70) return 'text-emerald-400';
  if (v >= 40) return 'text-amber-400';
  return 'text-red-400';
}

export default function ConsciousnessResults() {
  const navigate = useNavigate();
  const { t, language, isRTL } = useTranslation();
  const { config, saveFocusItems, markComplete, isSaving } = useConsciousnessCoach();
  const [searchParams] = useSearchParams();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const histIdx = searchParams.get('idx');
  const assessment: ConsciousnessAssessmentResult | undefined = useMemo(() => {
    if (histIdx != null) {
      const idx = parseInt(histIdx);
      return config.history?.[idx];
    }
    return config.latest_assessment;
  }, [histIdx, config]);

  const isHistorical = histIdx != null;


  const lang = language === 'he' ? 'he' : 'en';

  if (!assessment) {
    return (
      <PageShell>
        <div className="text-center py-20" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className="text-muted-foreground">{t('consciousness.noResults')}</p>
          <Button onClick={() => navigate('/life/consciousness/assess')} className="mt-4">{t('consciousness.beginScan')}</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/consciousness')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('consciousness.resultsTitle')}</h1>
        </div>

        {/* Low confidence banner */}
        {assessment.confidence === 'low' && (
          <Card className="p-3 border-amber-500/30 bg-amber-500/5 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-400">{t('consciousness.lowConfidenceBanner')}</p>
          </Card>
        )}

        {/* Overall Index */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-6 bg-gradient-to-b from-violet-500/10 to-transparent border-violet-500/30 text-center">
            <p className="text-5xl font-black text-foreground">{assessment.consciousness_index}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('consciousness.overallIndex')}</p>
            <Badge variant={assessment.confidence === 'high' ? 'default' : 'secondary'} className="mt-2">
              {t(`consciousness.confidence_${assessment.confidence}`)}
            </Badge>
          </Card>
        </motion.div>

        {/* Mirror Statement */}
        {assessment.mirror_statement && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-5 border-violet-500/20 bg-violet-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-violet-400">{t('consciousness.mirrorTitle')}</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {assessment.mirror_statement[lang]}
              </p>
            </Card>
          </motion.div>
        )}

        {/* Subscores grid */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('consciousness.subscoresTitle')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(assessment.subscores) as [ConsciousnessSubsystemId, number][]).map(([key, val]) => (
              <Card key={key} className="p-3 bg-card border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <span>{SUBSYSTEM_ICONS[key]}</span>
                  <span className="text-xs text-muted-foreground">{t(`consciousness.sub_${key}`)}</span>
                </div>
                <p className={cn("text-2xl font-black", scoreColor(val))}>{val}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Findings */}
        {assessment.findings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('consciousness.findingsTitle')}</h3>
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
                    <p className="text-sm text-foreground">{lang === 'he' ? f.text_he : f.text_en}</p>
                    <span className="text-xs text-muted-foreground">{t(`consciousness.sub_${f.subsystem}`)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* One Next Step */}
        {assessment.one_next_step && (
          <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-400">{t('consciousness.oneNextStep')}</h3>
            </div>
            <p className="text-sm text-foreground">{assessment.one_next_step[lang]}</p>
          </Card>
        )}

        {/* Mark complete */}
        {!isHistorical && !config.completed && (
          <Button onClick={markComplete} disabled={isSaving} variant="outline"
            className="w-full border-violet-500/40 text-violet-500 hover:bg-violet-500/10" size="lg">
            <Check className="w-4 h-4 me-1" /> {t('consciousness.markComplete')}
          </Button>
        )}
      </div>
    </PageShell>
  );
}
