/**
 * @page ConsciousnessHistory (/life/consciousness/history)
 * @tab Life
 * @purpose Lists previous consciousness assessments
 * @data useConsciousnessCoach, life_domains
 */
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useConsciousnessCoach } from '@/hooks/useConsciousnessCoach';
import { ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, Waves } from 'lucide-react';

export default function ConsciousnessHistory() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { config } = useConsciousnessCoach();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;
  const history = config.history ?? [];

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/consciousness')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('consciousness.historyTitle')}</h1>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <Waves className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t('consciousness.noHistory')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => (
              <Card key={i} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/life/consciousness/results?idx=${i}`)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-foreground">{h.consciousness_index}/100</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.assessed_at).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {t(`consciousness.confidence_${h.confidence}`)}
                    </Badge>
                    <ForwardIcon className="w-4 h-4 text-muted-foreground" />
                    <ForwardIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
