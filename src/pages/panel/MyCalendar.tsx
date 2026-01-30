import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const MyCalendar = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          {t('panel.calendar')}
        </h1>
        <p className="text-muted-foreground">{t('panel.calendarPageDescription')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('panel.upcomingAppointments')}</CardTitle>
          <CardDescription>{t('panel.noAppointmentsYet')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('panel.appointmentsWillAppearHere')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCalendar;
