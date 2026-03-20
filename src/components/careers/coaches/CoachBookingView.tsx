/**
 * @tab Coaches
 * @purpose Booking flow for coach services — service selection, date, time, confirm
 * All data flows through domain hooks — no direct DB calls for practitioner tables.
 */
import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCoachAvailability } from '@/domain/coaches';
import type { CoachService } from '@/domain/coaches';
import { cn } from '@/lib/utils';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';

interface CoachBookingViewProps {
  practitionerId: string;
  services: CoachService[];
  practitionerName: string;
  onBack: () => void;
  preSelectedServiceId?: string;
}

type Step = 'service' | 'date' | 'time' | 'confirm';

const CoachBookingView = ({
  practitionerId,
  services,
  practitionerName,
  onBack,
  preSelectedServiceId,
}: CoachBookingViewProps) => {
  const { t, isRTL, language } = useTranslation();
  const queryClient = useQueryClient();
  const ArrowBack = isRTL ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState<Step>(preSelectedServiceId ? 'date' : 'service');
  const [selectedService, setSelectedService] = useState<CoachService | null>(
    preSelectedServiceId ? services.find(s => s.id === preSelectedServiceId) || null : null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const { data: availability } = useCoachAvailability(practitionerId);

  const { data: existingBookings } = useQuery({
    queryKey: ['bookings-for-date', practitionerId, selectedDate?.toISOString()],
    queryFn: async () => {
      if (!selectedDate) return [];
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('practitioner_id', practitionerId)
        .eq('booking_date', dateStr)
        .neq('status', 'cancelled');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDate,
  });

  const availableDays = useMemo(() => {
    if (!availability) return new Set<number>();
    return new Set(availability.map(a => a.day_of_week));
  }, [availability]);

  const timeSlots = useMemo(() => {
    if (!selectedDate || !availability || !selectedService) return [];
    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);
    if (!dayAvailability.length) return [];

    const duration = selectedService.duration_minutes || 60;
    const slots: string[] = [];
    const bookedTimes = new Set(
      (existingBookings || []).map(b => b.start_time)
    );

    for (const avail of dayAvailability) {
      const [startH, startM] = avail.start_time.split(':').map(Number);
      const [endH, endM] = avail.end_time.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      for (let m = startMinutes; m + duration <= endMinutes; m += 30) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const timeStr = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`;
        if (!bookedTimes.has(timeStr)) {
          slots.push(timeStr);
        }
      }
    }
    return slots;
  }, [selectedDate, availability, selectedService, existingBookings]);

  const bookMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (!selectedDate || !selectedSlot || !selectedService) throw new Error('Missing data');

      const duration = selectedService.duration_minutes || 60;
      const [h, m] = selectedSlot.split(':').map(Number);
      const endMinutes = h * 60 + m + duration;
      const endH = Math.floor(endMinutes / 60);
      const endM = endMinutes % 60;
      const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}:00`;

      const { error } = await supabase.from('bookings').insert({
        practitioner_id: practitionerId,
        service_id: selectedService.id,
        client_user_id: user.id,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedSlot,
        end_time: endTime,
        notes: notes || null,
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(language === 'he' ? 'הפגישה נקבעה בהצלחה!' : 'Booking confirmed!');
      queryClient.invalidateQueries({ queryKey: ['bookings-for-date'] });
      setStep('confirm');
    },
    onError: () => {
      toast.error(language === 'he' ? 'שגיאה בקביעת הפגישה' : 'Booking failed');
    },
  });

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    if (isBefore(addDays(new Date(), 90), date)) return true;
    return !availableDays.has(date.getDay());
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    return `${h}:${m}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={step === 'service' || step === 'confirm' ? onBack : () => {
          if (step === 'date') setStep('service');
          else if (step === 'time') { setStep('date'); setSelectedSlot(null); }
        }}>
          <ArrowBack className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-sm">
          {step === 'confirm' && bookMutation.isSuccess
            ? (language === 'he' ? '✅ הפגישה נקבעה' : '✅ Booking Confirmed')
            : (language === 'he' ? 'קביעת פגישה' : 'Book a Session')}
        </h3>
      </div>

      {step === 'service' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {language === 'he' ? 'בחר/י שירות:' : 'Select a service:'}
          </p>
          {services.map(service => {
            const sTitle = language === 'en' && service.title_en ? service.title_en : service.title;
            return (
              <button
                key={service.id}
                onClick={() => { setSelectedService(service); setStep('date'); }}
                className={cn(
                  "w-full text-start rounded-xl p-3 transition-all",
                  "bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm",
                  "border border-border/50 hover:border-primary/40 hover:shadow-md"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{sTitle}</p>
                    {service.duration_minutes && (
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline me-1" />
                        {service.duration_minutes} {language === 'he' ? 'דק׳' : 'min'}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {service.price > 0 ? `₪${service.price}` : (language === 'he' ? 'חינם' : 'Free')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {step === 'date' && (
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              if (date) { setSelectedSlot(null); setStep('time'); }
            }}
            disabled={isDateDisabled}
            className="rounded-md border"
          />
        </div>
      )}

      {step === 'time' && selectedDate && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {language === 'he' ? `בחר/י שעה ליום ${format(selectedDate, 'dd/MM/yyyy')}:` : `Pick a time for ${format(selectedDate, 'MMM dd, yyyy')}:`}
          </p>
          {timeSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {language === 'he' ? 'אין זמנים פנויים ביום זה' : 'No available slots for this date'}
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "rounded-lg py-2 px-3 text-sm font-medium transition-all border",
                    selectedSlot === slot
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/80 dark:bg-gray-900/60 border-border/50 hover:border-primary/40"
                  )}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          )}

          {selectedSlot && (
            <div className="space-y-3 pt-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'he' ? 'הערות (אופציונלי)...' : 'Notes (optional)...'}
                className="w-full rounded-lg border border-border/50 bg-white/80 dark:bg-gray-900/60 p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="bg-muted/30 rounded-xl p-3 border border-border/50 text-sm space-y-1">
                <p><strong>{language === 'he' ? 'שירות:' : 'Service:'}</strong> {language === 'en' && selectedService?.title_en ? selectedService.title_en : selectedService?.title}</p>
                <p><strong>{language === 'he' ? 'תאריך:' : 'Date:'}</strong> {format(selectedDate, 'dd/MM/yyyy')}</p>
                <p><strong>{language === 'he' ? 'שעה:' : 'Time:'}</strong> {formatTime(selectedSlot)}</p>
                {selectedService?.price && selectedService.price > 0 && (
                  <p><strong>{language === 'he' ? 'מחיר:' : 'Price:'}</strong> ₪{selectedService.price}</p>
                )}
              </div>
              <Button
                className="w-full"
                onClick={() => bookMutation.mutate()}
                disabled={bookMutation.isPending}
              >
                {bookMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <CalendarIcon className="h-4 w-4 me-2" />
                )}
                {language === 'he' ? 'אישור הזמנה' : 'Confirm Booking'}
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'confirm' && bookMutation.isSuccess && (
        <div className="text-center py-6 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'he'
              ? `הפגישה עם ${practitionerName} נקבעה. תקבל/י עדכון בקרוב.`
              : `Your session with ${practitionerName} is booked. You'll receive a confirmation soon.`}
          </p>
          <Button variant="outline" onClick={onBack}>
            {language === 'he' ? 'חזרה לפרופיל' : 'Back to Profile'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CoachBookingView;
