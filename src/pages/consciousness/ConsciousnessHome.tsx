/**
 * @page ConsciousnessHome (/life/consciousness)
 * @tab Life
 * @purpose Entry point for Consciousness (תודעה) Engine
 * @data useConsciousnessCoach, life_domains
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useConsciousnessCoach } from '@/hooks/useConsciousnessCoach';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, Activity, Clock,
  ChevronRight, ChevronLeft, BarChart3, RefreshCw, Waves,
} from 'lucide-react';
import { motion } from 'framer-motion';

const SUBSYSTEM_ICONS: Record<string, string> = {
  soul_intent_clarity: '🔮', mask_awareness: '🎭',
  frequency_stability: '〰️', alignment_integrity: '🧭',
  inner_signal_access: '👁️', field_coherence: '🌀',
};

export default function ConsciousnessHome() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { config, isLoading } = useConsciousnessCoach();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;
  const latest = config.latest_assessment;
  const history = config.history ?? [];

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
            <Waves className="w-6 h-6 text-violet-500" />
            <h1 className="text-xl font-bold text-foreground">{t('consciousness.title')}</h1>
          </div>
        </div>

        {latest ? (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 bg-gradient-to-b from-violet-500/10 to-transparent border-violet-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-black text-foreground">{latest.consciousness_index}</p>
                    <p className="text-xs text-muted-foreground">{t('consciousness.overallIndex')}</p>
                  </div>
                  <Badge variant={latest.confidence === 'high' ? 'default' : 'secondary'} className="text-xs">
                    {t(`consciousness.confidence_${latest.confidence}`)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {(Object.entries(latest.subscores) as [string, number][]).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1.5 p-2 rounded-lg bg-background/50 border border-border/30">
                      <span className="text-sm">{SUBSYSTEM_ICONS[key]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{t(`consciousness.sub_${key}`)}</p>
                        <p className="text-sm font-bold text-foreground">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => navigate('/life/consciousness/results')} className="flex-1 bg-violet-600 hover:bg-violet-700">
                    <BarChart3 className="w-4 h-4 me-1" /> {t('consciousness.viewResults')}
                  </Button>
                  <Button onClick={() => navigate('/life/consciousness/assess')} variant="outline" className="border-violet-500/40">
                    <RefreshCw className="w-4 h-4 me-1" /> {t('consciousness.reassess')}
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
                  <h3 className="text-sm font-semibold text-muted-foreground">{t('consciousness.previousScans')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/life/consciousness/history')} className="text-xs">
                    {t('consciousness.seeAll')} <ForwardIcon className="w-3 h-3 ms-1" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {history.slice(0, 3).map((h, i) => (
                    <Card key={i} className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/life/consciousness/results?idx=${i}`)}>
                      <div>
                        <p className="text-sm font-medium">{h.consciousness_index}/100</p>
                        <p className="text-xs text-muted-foreground">{new Date(h.assessed_at).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{t(`consciousness.confidence_${h.confidence}`)}</Badge>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 bg-gradient-to-b from-violet-500/10 to-transparent border-violet-500/30 text-center">
              <Waves className="w-10 h-10 text-violet-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-1">{t('consciousness.startTitle')}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t('consciousness.startDesc')}</p>
              <Button onClick={() => navigate('/life/consciousness/assess')} className="bg-violet-600 hover:bg-violet-700" size="lg">
                {t('consciousness.beginScan')} <ForwardIcon className="w-4 h-4 ms-1" />
              </Button>
              <p className="text-[10px] text-muted-foreground mt-3">{t('consciousness.noPlanNote')}</p>
            </Card>
          </motion.div>
        )}

        {config.completed && (
          <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/30">
            ✓ {t('consciousness.pillarComplete')}
          </Badge>
        )}
      </div>
    </PageShell>
  );
}
