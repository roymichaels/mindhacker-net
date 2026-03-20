import { useTranslation } from '@/hooks/useTranslation';
import { FileText } from 'lucide-react';

export default function CreatorContentTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold">{isHe ? 'התכנים שלך' : 'Your Content'}</h3>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {isHe ? 'אין תכנים עדיין. התחל ליצור תוכן!' : 'No content yet. Start creating!'}
        </p>
      </div>
    </div>
  );
}
