/**
 * @page CombatHome (/life/combat)
 * Entry — Warrior Capability Engine.
 * GATE: requires Vitality + Focus completed.
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useCombatCoach } from '@/hooks/useCombatCoach';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, Swords, Activity, Clock,
  ChevronRight, ChevronLeft, BarChart3, RefreshCw,
  Lock, Sun, Crosshair, Check, X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';

const SUBSYSTEM_ICONS: Record<string, string> = {
  striking_skill: '🥊',
  grappling_skill: '🤼',
  reaction_speed: '⚡',
  conditioning: '🫀',
  durability: '🛡️',
  tactical_awareness: '🧠',
};

export default function CombatHome() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { config, isLoading } = useCombatCoach();
  const { statusMap } = useLifeDomains();
  const { startAssessment } = useAuroraChatContext();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;

  const vitalityStatus = statusMap['vitality'] ?? 'unconfigured';
  const focusStatus = statusMap['focus'] ?? 'unconfigured';
  const vitalityComplete = vitalityStatus === 'active' || vitalityStatus === 'configured';
  const focusComplete = focusStatus === 'active' || focusStatus === 'configured';
  const isUnlocked = vitalityComplete && focusComplete;

  const latest = config.latest_assessment;
  const history = config.history ?? [];

  useEffect(() => {
    if (!isLoading && isUnlocked && !latest) {
      startAssessment('combat');
    }
  }, [isLoading, isUnlocked, latest]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[300px]">
          <Activity className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (!isUnlocked) {
    return (
      <PageShell>
        <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/life')}>
              <BackIcon className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Swords className="w-6 h-6 text-muted-foreground" />
              <h1 className="text-xl font-bold text-foreground">{t('combat.title')}</h1>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-8 text-center border-border/40 bg-gradient-to-b from-muted/30 to-transparent">
              <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">{t('combat.lockedTitle')}</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{t('combat.lockedDesc')}</p>

              <div className="space-y-3 max-w-xs mx-auto">
                <GateRow
                  icon={<Sun className={cn("w-5 h-5", vitalityComplete ? "text-emerald-400" : "text-amber-400")} />}
                  label={t('combat.reqVitality')}
                  done={vitalityComplete}
                  onClick={() => !vitalityComplete && navigate('/life/vitality')}
                />
                <GateRow
                  icon={<Crosshair className={cn("w-5 h-5", focusComplete ? "text-emerald-400" : "text-cyan-400")} />}
                  label={t('combat.reqFocus')}
                  done={focusComplete}
                  onClick={() => !focusComplete && navigate('/life/focus')}
                />
              </div>
            </Card>
          </motion.div>
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
            <Swords className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-xl font-bold text-foreground">{t('combat.title')}</h1>
          </div>
        </div>

        {latest ? (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 bg-gradient-to-b from-muted/20 to-transparent border-border/40">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-black text-foreground">{latest.warrior_index}</p>
                    <p className="text-xs text-muted-foreground">{t('combat.warriorIndex')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={latest.confidence === 'high' ? 'default' : 'secondary'} className="text-xs">
                      {t(`combat.confidence_${latest.confidence}`)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {latest.completeness_pct}% {t('combat.complete')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(Object.entries(latest.subscores) as [string, number][]).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1.5 p-2 rounded-lg bg-background/50 border border-border/30">
                      <span className="text-sm">{SUBSYSTEM_ICONS[key]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{t(`combat.sub_${key}`)}</p>
                        <p className="text-sm font-bold text-foreground">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => navigate('/life/combat/results')} className="flex-1">
                    <BarChart3 className="w-4 h-4 me-1" /> {t('combat.viewResults')}
                  </Button>
                  <Button onClick={() => startAssessment('combat')} variant="outline">
                    <RefreshCw className="w-4 h-4 me-1" /> {t('combat.reassess')}
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
                  <h3 className="text-sm font-semibold text-muted-foreground">{t('combat.previousScans')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/life/combat/history')} className="text-xs">
                    {t('combat.seeAll')} <ForwardIcon className="w-3 h-3 ms-1" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {history.slice(0, 3).map((h, i) => (
                    <Card key={i} className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/life/combat/history?idx=${i}`)}>
                      <div>
                        <p className="text-sm font-medium">{h.warrior_index}/100</p>
                        <p className="text-xs text-muted-foreground">{new Date(h.assessed_at).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{t(`combat.confidence_${h.confidence}`)}</Badge>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 bg-gradient-to-b from-muted/20 to-transparent border-border/40 text-center">
              <Swords className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-1">{t('combat.startTitle')}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t('combat.startDesc')}</p>
              <Button onClick={() => startAssessment('combat')} size="lg">
                {t('combat.beginScan')} <ForwardIcon className="w-4 h-4 ms-1" />
              </Button>
              <p className="text-[10px] text-muted-foreground mt-3">{t('combat.noPlanNote')}</p>
            </Card>
          </motion.div>
        )}

        {config.completed && (
          <Badge className="bg-primary/10 text-primary border-primary/30">
            ✓ {t('combat.pillarComplete')}
          </Badge>
        )}
      </div>
      
    </PageShell>
  );
}

function GateRow({ icon, label, done, onClick }: { icon: React.ReactNode; label: string; done: boolean; onClick: () => void }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
        done ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium text-foreground flex-1 text-start">{label}</span>
      {done ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-amber-400" />}
    </div>
  );
}
