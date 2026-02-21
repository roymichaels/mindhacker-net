/**
 * NowSection — "מנוע עכשיו" Dashboard Component
 * Shows Next Action card + Today Queue list
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, ChevronDown, ChevronUp, CheckCircle2, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNowEngine, NowQueueItem } from '@/hooks/useNowEngine';
import { useCompleteNowAction } from '@/hooks/useNowEngine';
import { getDomainById } from '@/navigation/lifeDomains';
import { toast } from 'sonner';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';

function PillarBadge({ pillarId, hub }: { pillarId: string; hub: 'core' | 'arena' }) {
  const { language } = useTranslation();
  const domain = getDomainById(pillarId);
  if (!domain) return null;
  const Icon = domain.icon;
  const label = language === 'he' ? domain.labelHe : domain.labelEn;
  const hubLabel = language === 'he' ? (hub === 'core' ? 'ליבה' : 'זירה') : hub;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/60 border border-border/50 text-muted-foreground">
      <Icon className="h-3 w-3" />
      {label}
      <span className="opacity-50">·</span>
      <span className="opacity-60">{hubLabel}</span>
    </span>
  );
}

function QueueItemCard({
  item,
  index,
  onExecute,
}: {
  item: NowQueueItem;
  index: number;
  onExecute: (item: NowQueueItem) => void;
}) {
  const { language, isRTL } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/40 hover:border-primary/30 hover:bg-accent/5 transition-all cursor-pointer"
      onClick={() => onExecute(item)}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Number */}
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center text-[11px] font-bold text-muted-foreground">
        {index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <PillarBadge pillarId={item.pillarId} hub={item.hub} />
        </div>
        <p className="text-sm font-medium truncate">{item.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {item.durationMin} {language === 'he' ? 'דק׳' : 'min'}
          </span>
          <span className="text-[10px] text-muted-foreground/60">{item.reason}</span>
        </div>
      </div>

      {/* Execute CTA */}
      <ArrowRight className={cn("h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0", isRTL && "rotate-180")} />
    </motion.div>
  );
}

export function NowSection() {
  const { language, isRTL } = useTranslation();
  const { queue, nextAction, tier, isLoading, refetch } = useNowEngine();
  const [expanded, setExpanded] = useState(true);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);

  const handleExecute = (item: NowQueueItem) => {
    setExecutionAction(item);
    setExecutionOpen(true);
  };

  const handleExecutionComplete = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="border border-border/50 bg-card/30">
        <CardContent className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{language === 'he' ? 'מחשב את היום שלך...' : 'Computing your day...'}</span>
        </CardContent>
      </Card>
    );
  }

  if (!nextAction) return null;

  const restQueue = queue.slice(1);

  return (
    <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ─── NEXT ACTION (Hero Card) ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card
          className="relative overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent cursor-pointer group"
          onClick={() => handleExecute(nextAction)}
        >
          {/* Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />

          <CardContent className="p-4 relative">
            <div className="flex items-center gap-1 mb-2">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {language === 'he' ? 'הדבר הבא' : 'Next Action'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <PillarBadge pillarId={nextAction.pillarId} hub={nextAction.hub} />
                <h3 className="text-base font-bold mt-1 break-words">{nextAction.title}</h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {nextAction.durationMin} {language === 'he' ? 'דקות' : 'min'}
                  </span>
                  <span className="text-xs text-muted-foreground/60">{nextAction.reason}</span>
                </div>
              </div>

              <Button
                size="sm"
                className="flex-shrink-0 gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecute(nextAction);
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {language === 'he' ? 'בצע' : 'Start'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── TODAY QUEUE ──────────────────────────────── */}
      {restQueue.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 px-1 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              {language === 'he'
                ? `עוד ${restQueue.length} פעולות להיום`
                : `${restQueue.length} more actions today`}
            </span>
            {expanded ? <ChevronUp className="h-3 w-3 ms-auto" /> : <ChevronDown className="h-3 w-3 ms-auto" />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-1.5 mt-1"
              >
                {restQueue.map((item, i) => (
                  <QueueItemCard key={`${item.actionType}-${i}`} item={item} index={i + 1} onExecute={handleExecute} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {/* Execution Modal */}
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={handleExecutionComplete}
      />
    </div>
  );
}
