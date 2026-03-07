import { useTranslation } from '@/hooks/useTranslation';
import { Settings } from 'lucide-react';

export default function FreelancerSettingsTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold">{isHe ? 'הגדרות פרילנסר' : 'Freelancer Settings'}</h3>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">{isHe ? 'כישורים' : 'Skills'}</label>
          <p className="text-xs text-muted-foreground mt-1">
            {isHe ? 'הוסף כישורים כדי שלקוחות ימצאו אותך.' : 'Add skills so clients can find you.'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">{isHe ? 'תעריף שעתי' : 'Hourly Rate'}</label>
          <p className="text-xs text-muted-foreground mt-1">
            {isHe ? 'הגדר את התעריף השעתי שלך.' : 'Set your hourly rate.'}
          </p>
        </div>
      </div>
    </div>
  );
}
