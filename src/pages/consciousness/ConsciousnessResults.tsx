/**
 * @page ConsciousnessResults (/life/consciousness/results)
 * @tab Life
 * @purpose Displays consciousness index, subscores, findings, calibration library
 * @data useConsciousnessCoach, life_domains
 */
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useConsciousnessCoach } from '@/hooks/useConsciousnessCoach';
import { CONSCIOUSNESS_LEVERS, autoPickLevers } from '@/lib/consciousness/levers';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, Check, AlertTriangle,
  ChevronDown, ChevronUp, Trophy, Waves, AlertCircle,
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
  const { t, isRTL } = useTranslation();
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

  const [selectedLevers, setSelectedLevers] = useState<string[]>(
    () => assessment?.selected_focus_items ?? []
  );
  const [expandedTier, setExpandedTier] = useState<number | null>(1);

  const autoPicks = useMemo(() =>
    assessment ? autoPickLevers(assessment.subscores as Record<ConsciousnessSubsystemId, number>) : [],
    [assessment]
  );

  const toggleLever = (id: string) => {
    setSelectedLevers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

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
            <div className="flex items-center justify-center gap-3 mt-3">
              <Badge variant={assessment.confidence === 'high' ? 'default' : 'secondary'}>
                {t(`consciousness.confidence_${assessment.confidence}`)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {assessment.completeness_pct}% {t('consciousness.complete')}
              </span>
            </div>
          </Card>
        </motion.div>

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
                    <p className="text-sm text-foreground">{t(f.text_key)}</p>
                    <span className="text-xs text-muted-foreground">{t(`consciousness.sub_${f.subsystem}`)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Top 3 Auto-Picks */}
        {autoPicks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-violet-500" />
              {t('consciousness.topPriorities')}
            </h3>
            <div className="space-y-2">
              {autoPicks.map(id => {
                const lever = CONSCIOUSNESS_LEVERS.find(l => l.id === id);
                if (!lever) return null;
                const isSelected = selectedLevers.includes(id);
                return (
                  <button key={id} type="button" onClick={() => toggleLever(id)}
                    className={cn(
                      'w-full p-3 rounded-xl border text-start transition-all flex items-center justify-between',
                      isSelected ? 'border-violet-500 bg-violet-500/10' : 'border-border bg-card hover:bg-muted/50'
                    )}>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t(lever.nameKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(lever.whyKey)}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-violet-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Calibration Library grouped by Tier */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('consciousness.calibrationLibrary')}</h3>
          {[1, 2, 3].map(tier => {
            const tierLevers = CONSCIOUSNESS_LEVERS.filter(l => l.tier === tier);
            const isExpanded = expandedTier === tier;
            return (
              <div key={tier} className="mb-2">
                <button type="button" onClick={() => setExpandedTier(isExpanded ? null : tier)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium text-foreground">{t(TIER_LABELS[tier])}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{tierLevers.length}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="space-y-2 mt-2">
                    {tierLevers.map(lever => {
                      const isSelected = selectedLevers.includes(lever.id);
                      return (
                        <button key={lever.id} type="button" onClick={() => toggleLever(lever.id)}
                          className={cn(
                            'w-full p-3 rounded-xl border text-start transition-all flex items-center justify-between',
                            isSelected ? 'border-violet-500 bg-violet-500/10' : 'border-border bg-card hover:bg-muted/50'
                          )}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{t(lever.nameKey)}</p>
                              <Badge variant="outline" className="text-[9px]">{lever.difficulty}</Badge>
                              <Badge variant="outline" className={cn("text-[9px]",
                                lever.impact === 'high' ? 'text-emerald-400 border-emerald-500/30' : ''
                              )}>{lever.impact}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{t(lever.whyKey)}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-violet-500 shrink-0 ms-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Save & Complete */}
        {!isHistorical && (
          <div className="space-y-3">
            {selectedLevers.length > 0 && (
              <Button onClick={() => saveFocusItems(selectedLevers)} disabled={isSaving}
                className="w-full bg-violet-600 hover:bg-violet-700" size="lg">
                {t('consciousness.saveSelection')} ({selectedLevers.length})
              </Button>
            )}

            {!config.completed && (
              <Button onClick={markComplete} disabled={isSaving} variant="outline"
                className="w-full border-violet-500/40 text-violet-500 hover:bg-violet-500/10" size="lg">
                <Check className="w-4 h-4 me-1" /> {t('consciousness.markComplete')}
              </Button>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
