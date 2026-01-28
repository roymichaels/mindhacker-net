import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

const CompactSessions = () => {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const dateLocale = language === 'he' ? he : enUS;

  const { data: sessions } = useQuery({
    queryKey: ['compact-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('booking_status', 'scheduled')
        .not('scheduled_date', 'is', null)
        .order('scheduled_date', { ascending: true })
        .limit(2);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (!sessions || sessions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t('dashboard.scheduledSessions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {session.package_type === 'single' 
                  ? t('sessions.singleSession')
                  : t('sessions.packageOf4')
                }
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {session.scheduled_date && format(
                    new Date(session.scheduled_date), 
                    'dd MMM', 
                    { locale: dateLocale }
                  )}
                </span>
              </div>
              {session.scheduled_time && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{session.scheduled_time}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CompactSessions;
