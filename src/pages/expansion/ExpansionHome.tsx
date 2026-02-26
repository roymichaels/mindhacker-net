/**
 * @page ExpansionHome (/life/expansion)
 * Entry point for Expansion (התרחבות) Cognitive Expansion Engine.
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useExpansionCoach } from '@/hooks/useExpansionCoach';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, Brain, Activity, Clock,
  ChevronRight, ChevronLeft, BarChart3, RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';

const SUBSYSTEM_ICONS: Record<string, string> = {
  learning_depth: '📚',
  creative_output: '🎨',
  language_complexity: '🌐',
  philosophical_depth: '🧠',
};

export default function ExpansionHome() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { config, isLoading } = useExpansionCoach();
  const { startAssessment } = useAuroraChatContext();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;
  const latest = config.latest_assessment;
  const history = config.history ?? [];

  useEffect(() => {
    if (!isLoading && !latest) startAssessment('expansion');
  }, [isLoading, latest]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[300px]">
          <Activity className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-500" />
            <h1 className="text-xl font-bold text-foreground">{t('expansion.title')}</h1>
          </div>
        </div>

        {latest ? (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 bg-gradient-to-b from-indigo-500/10 to-transparent border-indigo-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-black text-foreground">{latest.expansion_index}</p>
                    <p className="text-xs text-muted-foreground">{t('expansion.overallIndex')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={latest.confidence === 'high' ? 'default' : 'secondary'} className="text-xs">
                      {t(`expansion.confidence_${latest.confidence}`)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {latest.completeness_pct}% {t('expansion.complete')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {(Object.entries(latest.subscores) as [string, number][]).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1.5 p-2 rounded-lg bg-background/50 border border-border/30">
                      <span className="text-sm">{SUBSYSTEM_ICONS[key]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{t(`expansion.sub_${key}`)}</p>
                        <p className="text-sm font-bold text-foreground">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => navigate('/life/expansion/results')} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    <BarChart3 className="w-4 h-4 me-1" /> {t('expansion.viewResults')}
                  </Button>
                  <Button onClick={() => startAssessment('expansion')} variant="outline" className="border-indigo-500/40">
                    <RefreshCw className="w-4 h-4 me-1" /> {t('expansion.reassess')}
                  </Button>
                </div>
              </Card>
            </motion.div>

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(latest.assessed_at).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}
            </p>

            {history.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">{t('expansion.previousScans')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/life/expansion/history')} className="text-xs">
                    {t('expansion.seeAll')} <ForwardIcon className="w-3 h-3 ms-1" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {history.slice(0, 3).map((h, i) => (
                    <Card key={i} className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/life/expansion/history?idx=${i}`)}>
                      <div>
                        <p className="text-sm font-medium">{h.expansion_index}/100</p>
                        <p className="text-xs text-muted-foreground">{new Date(h.assessed_at).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{t(`expansion.confidence_${h.confidence}`)}</Badge>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 bg-gradient-to-b from-indigo-500/10 to-transparent border-indigo-500/30 text-center">
              <Brain className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-1">{t('expansion.startTitle')}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t('expansion.startDesc')}</p>
              <Button onClick={() => startAssessment('expansion')} className="bg-indigo-600 hover:bg-indigo-700" size="lg">
                {t('expansion.beginScan')} <ForwardIcon className="w-4 h-4 ms-1" />
              </Button>
              <p className="text-[10px] text-muted-foreground mt-3">{t('expansion.noPlanNote')}</p>
            </Card>
          </motion.div>
        )}

        {config.completed && (
          <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/30">
            ✓ {t('expansion.pillarComplete')}
          </Badge>
        )}
      </div>
      
    </PageShell>
  );
}
