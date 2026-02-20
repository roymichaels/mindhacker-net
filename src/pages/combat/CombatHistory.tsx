/**
 * @page CombatHistory (/life/combat/history)
 * Past capability scans.
 */
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useCombatCoach } from '@/hooks/useCombatCoach';
import { ArrowLeft, ArrowRight, Swords, Clock } from 'lucide-react';

const SUBSYSTEM_ICONS: Record<string, string> = {
  striking_skill: '🥊',
  grappling_skill: '🤼',
  reaction_speed: '⚡',
  conditioning: '🫀',
  durability: '🛡️',
  tactical_awareness: '🧠',
};

export default function CombatHistory() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { config } = useCombatCoach();
  const [params] = useSearchParams();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const history = config.history ?? [];
  const selectedIdx = params.get('idx') ? parseInt(params.get('idx')!) : null;
  const selected = selectedIdx !== null ? history[selectedIdx] : null;

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => selected ? navigate('/life/combat/history') : navigate('/life/combat')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-lg font-bold text-foreground">{t('combat.historyTitle')}</h1>
          </div>
        </div>

        {selected ? (
          <div className="space-y-4">
            <Card className="p-5 text-center bg-gradient-to-b from-muted/20 to-transparent border-border/40">
              <p className="text-4xl font-black text-foreground">{selected.warrior_index}</p>
              <p className="text-sm text-muted-foreground">{t('combat.warriorIndex')}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="secondary">{t(`combat.confidence_${selected.confidence}`)}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(selected.assessed_at).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}
                </span>
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(selected.subscores) as [string, number][]).map(([key, val]) => (
                <Card key={key} className="p-3 flex items-center gap-2 border-border/30">
                  <span className="text-sm">{SUBSYSTEM_ICONS[key]}</span>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground truncate">{t(`combat.sub_${key}`)}</p>
                    <p className="text-sm font-bold text-foreground">{val}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : history.length === 0 ? (
          <Card className="p-6 text-center border-border/40">
            <p className="text-sm text-muted-foreground">{t('combat.noHistory')}</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {history.map((h, i) => (
              <Card
                key={i}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/life/combat/history?idx=${i}`)}
              >
                <div>
                  <p className="text-lg font-bold text-foreground">{h.warrior_index}/100</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(h.assessed_at).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}
                  </p>
                </div>
                <Badge variant="secondary">{t(`combat.confidence_${h.confidence}`)}</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
