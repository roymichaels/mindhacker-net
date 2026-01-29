import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommunityLayout from '@/components/community/CommunityLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, Video, Users, Check } from 'lucide-react';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

const CommunityEvents = () => {
  const { t, isRTL } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dateLocale = isRTL ? he : enUS;

  useSEO({
    title: t('community.eventsPageTitle'),
    description: t('community.eventsPageDescription'),
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/community/events');
    }
  }, [user, loading, navigate]);

  const { data: events, isLoading } = useQuery({
    queryKey: ['community-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_events')
        .select('*')
        .eq('is_published', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: userRsvps } = useQuery({
    queryKey: ['user-event-rsvps', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('community_event_rsvps')
        .select('event_id, status')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const existingRsvp = userRsvps?.find(r => r.event_id === eventId);
      
      if (existingRsvp) {
        if (status === 'cancel') {
          const { error } = await supabase
            .from('community_event_rsvps')
            .delete()
            .eq('event_id', eventId)
            .eq('user_id', user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('community_event_rsvps')
            .update({ status })
            .eq('event_id', eventId)
            .eq('user_id', user.id);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase
          .from('community_event_rsvps')
          .insert({ event_id: eventId, user_id: user.id, status });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-event-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['community-events'] });
      toast.success(t('community.rsvpUpdated'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'webinar': return Video;
      case 'qa': return Users;
      default: return Video;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'webinar': return t('community.eventTypeWebinar');
      case 'qa': return t('community.eventTypeQA');
      case 'live_session': return t('community.eventTypeLiveSession');
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      <main className="pt-0">
        <CommunityLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{t('community.events')}</h1>
              <p className="text-muted-foreground">{t('community.eventsSubtitle')}</p>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {events.map((event) => {
                  const EventIcon = getEventTypeIcon(event.event_type || 'live_session');
                  const userRsvp = userRsvps?.find(r => r.event_id === event.id);
                  const isGoing = userRsvp?.status === 'going';

                  return (
                    <Card key={event.id} className="overflow-hidden">
                      {event.cover_image_url && (
                        <div className="aspect-video relative">
                          <img 
                            src={event.cover_image_url} 
                            alt={event.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <Badge variant="outline" className="gap-1">
                              <EventIcon className="h-3 w-3" />
                              {getEventTypeLabel(event.event_type || 'live_session')}
                            </Badge>
                            <CardTitle className="text-xl">{isRTL ? event.title : event.title_en || event.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">{event.attendees_count || 0}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground line-clamp-2">
                          {isRTL ? event.description : event.description_en || event.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(event.start_time), 'EEEE, d MMMM', { locale: dateLocale })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(event.start_time), 'HH:mm', { locale: dateLocale })}
                            </span>
                          </div>
                        </div>

                        <Button 
                          className={cn("w-full gap-2", isGoing && "bg-green-600 hover:bg-green-700")}
                          onClick={() => rsvpMutation.mutate({ 
                            eventId: event.id, 
                            status: isGoing ? 'cancel' : 'going' 
                          })}
                          disabled={rsvpMutation.isPending}
                        >
                          {isGoing ? (
                            <>
                              <Check className="h-4 w-4" />
                              {t('community.youreGoing')}
                            </>
                          ) : (
                            t('community.rsvp')
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('community.noEvents')}</p>
              </div>
            )}
          </div>
        </CommunityLayout>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityEvents;
