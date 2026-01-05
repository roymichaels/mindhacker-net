import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

interface BookingCalendarProps {
  onSubmit: (date: Date | undefined, time: string, notes: string) => void;
  isSubmitting?: boolean;
}

const BookingCalendar = ({ onSubmit, isSubmitting }: BookingCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const { t, isRTL, language } = useTranslation();

  const locale = language === 'he' ? 'he-IL' : 'en-US';

  useEffect(() => {
    const fetchAvailabilityHours = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'availability_hours')
        .single();

      if (data?.setting_value) {
        const [start, end] = data.setting_value.split('-');
        const startHour = parseInt(start.split(':')[0]);
        const endHour = parseInt(end.split(':')[0]);
        
        const slots: string[] = [];
        for (let hour = startHour; hour <= endHour; hour++) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        setTimeSlots(slots);
      } else {
        setTimeSlots([
          "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
          "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
        ]);
      }
    };

    fetchAvailabilityHours();
  }, []);

  const handleSubmit = () => {
    if (date && selectedTime) {
      onSubmit(date, selectedTime, notes);
    }
  };

  const isPastDate = (checkDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {t('booking.selectDate')}
          </CardTitle>
          <CardDescription>
            {t('booking.selectDateDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={isPastDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {date && (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('booking.selectTime')}
            </CardTitle>
            <CardDescription>
              {t('booking.selectTimeDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                  className="w-full"
                >
                  {time}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {date && selectedTime && (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>{t('booking.additionalNotes')}</CardTitle>
            <CardDescription>
              {t('booking.anythingToKnow')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">{t('booking.notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('booking.notesPlaceholder')}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-sm">{t('booking.requestSummary')}</p>
              <p className="text-sm">📅 {t('booking.date')}: {date.toLocaleDateString(locale)}</p>
              <p className="text-sm">🕐 {t('booking.time')}: {selectedTime}</p>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? t('booking.submitting') : t('booking.submitRequest')}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              {t('booking.willContactSoon')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingCalendar;