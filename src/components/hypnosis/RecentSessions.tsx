import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, ChevronRight, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getEgoState } from '@/lib/egoStates';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface Session {
  id: string;
  ego_state: string;
  action: string | null;
  duration_seconds: number;
  experience_gained: number | null;
  created_at: string;
}

interface RecentSessionsProps {
  language: 'he' | 'en';
  isRTL: boolean;
  onViewAll?: () => void;
}

export function RecentSessions({ language, isRTL, onViewAll }: RecentSessionsProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('hypnosis_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setSessions(data);
      }
      setLoading(false);
    };

    fetchSessions();
  }, [user?.id]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} ${language === 'he' ? 'דק׳' : 'min'}`;
  };

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: language === 'he' ? he : undefined,
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground text-sm">
          {language === 'he' 
            ? 'עדיין אין סשנים. התחל את המסע שלך!'
            : 'No sessions yet. Start your journey!'
          }
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session, index) => {
        const ego = getEgoState(session.ego_state);
        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-xl",
                  "bg-gradient-to-br",
                  ego.colors.gradient
                )}
              >
                {ego.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.action || (language === 'he' ? 'סשן חופשי' : 'Free Session')}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(session.duration_seconds)}
                  </span>
                  <span>•</span>
                  <span>{formatTimeAgo(session.created_at)}</span>
                </p>
              </div>
              {session.experience_gained && (
                <span className="text-xs font-medium text-primary shrink-0">
                  +{session.experience_gained} XP
                </span>
              )}
            </Card>
          </motion.div>
        );
      })}

      {onViewAll && sessions.length >= 5 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-1 text-muted-foreground"
          onClick={onViewAll}
        >
          {language === 'he' ? 'הצג הכל' : 'View All'}
          <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
        </Button>
      )}
    </div>
  );
}
