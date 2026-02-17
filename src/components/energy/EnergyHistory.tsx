import { useState, useEffect } from 'react';
import { Zap, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EnergyEvent {
  id: string;
  change: number;
  balance_after: number;
  source: string;
  reason: string | null;
  created_at: string;
}

const SOURCE_LABELS: Record<string, { en: string; he: string }> = {
  hypnosis: { en: 'Hypnosis Session', he: 'סשן היפנוזה' },
  aurora_message: { en: 'Aurora Message', he: 'הודעת אורורה' },
  achievement: { en: 'Achievement', he: 'הישג' },
  level_up: { en: 'Level Up', he: 'עלייה ברמה' },
  action_item: { en: 'Task Completed', he: 'משימה הושלמה' },
  streak: { en: 'Streak Bonus', he: 'בונוס רצף' },
  legacy: { en: 'Legacy', he: 'מורשת' },
  frontend: { en: 'Reward', he: 'פרס' },
  system: { en: 'System', he: 'מערכת' },
  re_eval: { en: 'Re-evaluation', he: 'הערכה מחדש' },
};

const EnergyHistory = () => {
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [events, setEvents] = useState<EnergyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('energy_events')
        .select('id, change, balance_after, source, reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetch();
  }, [user?.id]);

  const getLabel = (source: string) => {
    const labels = SOURCE_LABELS[source];
    return labels ? (isHe ? labels.he : labels.en) : source;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        <Zap className="w-8 h-8 mx-auto mb-2 opacity-40" />
        {isHe ? 'אין פעילות אנרגיה עדיין' : 'No energy activity yet'}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {events.map((event) => {
          const isEarning = event.change > 0;
          return (
            <div
              key={event.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                isEarning ? 'bg-emerald-500/15 text-emerald-500' : 'bg-orange-500/15 text-orange-500'
              )}>
                {isEarning ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {getLabel(event.source)}
                </p>
                {event.reason && (
                  <p className="text-xs text-muted-foreground truncate">{event.reason}</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className={cn(
                  'text-sm font-bold',
                  isEarning ? 'text-emerald-500' : 'text-orange-500'
                )}>
                  {isEarning ? '+' : ''}{event.change}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(event.created_at), 'dd/MM HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default EnergyHistory;
