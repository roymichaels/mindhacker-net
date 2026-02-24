/**
 * @page CombatResults (/life/combat/results)
 * Warrior Index + subscores + findings + fix library.
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useCombatCoach } from '@/hooks/useCombatCoach';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, Swords, Check, AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';

const SUBSYSTEM_ICONS: Record<string, string> = {
  striking_skill: '🥊',
  grappling_skill: '🤼',
  reaction_speed: '⚡',
  conditioning: '🫀',
  durability: '🛡️',
  tactical_awareness: '🧠',
};

const SEVERITY_COLORS: Record<string, string> = {
  low: 'text-emerald-400',
  med: 'text-amber-400',
  high: 'text-red-400',
};

export default function CombatResults() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { config, saveFocusItems, markComplete, isSaving } = useCombatCoach();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const latest = config.latest_assessment;


  if (!latest) {
    return (
      <PageShell>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">{t('combat.noResults')}</p>
          <Button className="mt-4" onClick={() => navigate('/life/combat/assess')}>{t('combat.beginScan')}</Button>
        </div>
      </PageShell>
    );
  }

  const handleComplete = async () => {
    await markComplete();
    navigate('/life/combat');
  };

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/combat')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-lg font-bold text-foreground">{t('combat.resultsTitle')}</h1>
          </div>
        </div>

        {/* Overall Index */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-6 text-center bg-gradient-to-b from-muted/20 to-transparent border-border/40">
            <p className="text-5xl font-black text-foreground">{latest.warrior_index}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('combat.warriorIndex')}</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <Badge variant={latest.confidence === 'high' ? 'default' : 'secondary'}>
                {t(`combat.confidence_${latest.confidence}`)}
              </Badge>
              <span className="text-xs text-muted-foreground">{latest.completeness_pct}% {t('combat.complete')}</span>
            </div>
          </Card>
        </motion.div>

        {/* Subscores */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('combat.subscoresTitle')}</h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(latest.subscores) as [string, number][]).map(([key, val]) => (
              <Card key={key} className="p-3 flex items-center gap-2 border-border/30">
                <span className="text-lg">{SUBSYSTEM_ICONS[key]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{t(`combat.sub_${key}`)}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${val}%` }} />
                    </div>
                    <span className="text-sm font-bold text-foreground w-8 text-end">{val}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Findings */}
        {latest.findings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t('combat.findingsTitle')}</h3>
            <div className="space-y-2">
              {latest.findings.map(f => (
                <Card key={f.id} className="p-3 flex items-start gap-2 border-border/30">
                  <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0", SEVERITY_COLORS[f.severity])} />
                  <div>
                    <p className="text-sm text-foreground">{t(f.text_key)}</p>
                    <p className="text-xs text-muted-foreground">{t(`combat.sub_${f.subsystem}`)}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Mark complete */}
        <Button variant="outline" className="w-full" onClick={handleComplete} disabled={isSaving}>
          <Check className="w-4 h-4 me-1" /> {t('combat.markComplete')}
        </Button>
      </div>
    </PageShell>
  );
}
