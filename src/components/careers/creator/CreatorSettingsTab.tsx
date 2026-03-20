import { useTranslation } from '@/hooks/useTranslation';
import { Settings } from 'lucide-react';

export default function CreatorSettingsTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold">{isHe ? 'הגדרות יוצר' : 'Creator Settings'}</h3>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">{isHe ? 'שם המותג' : 'Brand Name'}</label>
          <p className="text-xs text-muted-foreground mt-1">
            {isHe ? 'הגדר את שם המותג שלך.' : 'Set your brand name.'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">{isHe ? 'קטגוריות' : 'Categories'}</label>
          <p className="text-xs text-muted-foreground mt-1">
            {isHe ? 'בחר את הקטגוריות של התוכן שלך.' : 'Choose your content categories.'}
          </p>
        </div>
      </div>
    </div>
  );
}
