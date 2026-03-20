import { useTranslation } from '@/hooks/useTranslation';
import { BarChart3 } from 'lucide-react';

export default function CreatorAnalyticsTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold">{isHe ? 'אנליטיקס' : 'Analytics'}</h3>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {isHe ? 'נתוני אנליטיקס יופיעו כאן ברגע שתפרסם תוכן.' : 'Analytics data will appear here once you publish content.'}
        </p>
      </div>
    </div>
  );
}
