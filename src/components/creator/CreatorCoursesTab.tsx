import { useTranslation } from '@/hooks/useTranslation';
import { BookOpen } from 'lucide-react';

export default function CreatorCoursesTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold">{isHe ? 'הקורסים שלך' : 'Your Courses'}</h3>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {isHe ? 'אין קורסים עדיין. צור את הקורס הראשון שלך!' : 'No courses yet. Create your first course!'}
        </p>
      </div>
    </div>
  );
}
