import { useTranslation } from '@/hooks/useTranslation';
import { FolderKanban } from 'lucide-react';

export default function FreelancerProjectsTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FolderKanban className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold">{isHe ? 'הפרויקטים שלך' : 'Your Projects'}</h3>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {isHe ? 'אין פרויקטים פעילים. קבל הזדמנות ראשונה כדי להתחיל!' : 'No active projects. Land your first gig to get started!'}
        </p>
      </div>
    </div>
  );
}
