/**
 * EventsModal — Shows upcoming community events with RSVP.
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, Clock, Users, MapPin, ExternalLink, Check, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { format, isPast, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EventsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EventsModal({ open, onOpenChange }: EventsModalProps) {
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();

  // Fetch upcoming events
  const { data: events, isLoading } = useQuery({
    queryKey: ['community-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_events')
        .select('*')
        .eq('is_published', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Fetch user's RSVPs
  const { data: myRsvps } = useQuery({
    queryKey: ['my-event-rsvps', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('community_event_rsvps')
        .select('event_id, status')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: open && !!user,
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'attending' | 'cancelled' }) => {
      if (!user) throw new Error('Not authenticated');
      
      const existing = myRsvps?.find(r => r.event_id === eventId);
      
      if (status === 'cancelled' && existing) {
        await supabase
          .from('community_event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
      } else if (!existing) {
        const { error } = await supabase
          .from('community_event_rsvps')
          .insert({ event_id: eventId, user_id: user.id, status });
        if (error) throw error;
      }

      // Update attendee count
      const { count } = await supabase
        .from('community_event_rsvps')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'attending');

      await supabase
        .from('community_events')
        .update({ attendees_count: count || 0 })
        .eq('id', eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-events'] });
      queryClient.invalidateQueries({ queryKey: ['my-event-rsvps'] });
      toast.success(isHe ? 'עודכן!' : 'Updated!');
    },
    onError: () => {
      toast.error(isHe ? 'שגיאה בעדכון' : 'Failed to update');
    },
  });

  const EVENT_TYPE_META: Record<string, { icon: string; color: string }> = {
    challenge: { icon: '🎯', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    workshop: { icon: '🛠️', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    meetup: { icon: '🤝', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
    talk: { icon: '🎙️', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
    live: { icon: '📡', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="p-4 pb-2 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-sky-500" />
            {isHe ? 'אירועים קרובים' : 'Upcoming Events'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !events?.length ? (
            <div className="text-center py-12">
              <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {isHe ? 'אין אירועים קרובים כרגע' : 'No upcoming events right now'}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {isHe ? 'אירועים חדשים יתווספו בקרוב!' : 'New events will be added soon!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const isRsvped = myRsvps?.some(r => r.event_id === event.id && r.status === 'attending');
                const typeMeta = EVENT_TYPE_META[event.event_type || 'meetup'] || EVENT_TYPE_META.meetup;
                const title = isHe ? (event.title || event.title_en) : (event.title_en || event.title);
                const desc = isHe ? (event.description || event.description_en) : (event.description_en || event.description);
                const isFull = event.max_attendees ? (event.attendees_count || 0) >= event.max_attendees : false;

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "rounded-xl border p-4 transition-all",
                      isRsvped
                        ? "border-sky-500/30 bg-sky-500/[0.05]"
                        : "border-border/40 bg-card/60"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", typeMeta.color)}>
                            {typeMeta.icon} {event.event_type || 'meetup'}
                          </Badge>
                          {isRsvped && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                              <Check className="w-2.5 h-2.5 me-0.5" />
                              {isHe ? 'רשום' : 'Going'}
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-foreground">{title}</h4>
                      </div>
                    </div>

                    {/* Description */}
                    {desc && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{desc}</p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {format(new Date(event.start_time), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(event.start_time), 'HH:mm')}
                        {event.end_time && ` - ${format(new Date(event.end_time), 'HH:mm')}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.attendees_count || 0}
                        {event.max_attendees && ` / ${event.max_attendees}`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isRsvped ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'cancelled' })}
                          disabled={rsvpMutation.isPending}
                        >
                          {isHe ? 'ביטול הרשמה' : 'Cancel RSVP'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="text-xs h-8 bg-sky-600 hover:bg-sky-700"
                          onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'attending' })}
                          disabled={rsvpMutation.isPending || isFull}
                        >
                          {isFull
                            ? (isHe ? 'מלא' : 'Full')
                            : (isHe ? 'הרשמה' : 'RSVP')
                          }
                        </Button>
                      )}
                      {event.meeting_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-8"
                          onClick={() => window.open(event.meeting_url!, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 me-1" />
                          {isHe ? 'קישור' : 'Join'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
