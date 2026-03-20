import { useTranslation } from '@/hooks/useTranslation';
import { Search } from 'lucide-react';

export default function FreelancerGigsTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold">{isHe ? 'הזדמנויות עבודה' : 'Available Gigs'}</h3>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {isHe ? 'אין הזדמנויות זמינות כרגע. בדוק שוב בקרוב!' : 'No gigs available right now. Check back soon!'}
        </p>
      </div>
    </div>
  );
}
