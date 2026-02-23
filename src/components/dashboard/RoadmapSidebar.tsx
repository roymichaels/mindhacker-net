/**
 * RoadmapSidebar — replaced by TodayEngine.
 * Renders Recalibrate button only. No legacy milestone timeline.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { RefreshCw } from 'lucide-react';
import { RecalibrateModal } from '@/components/dashboard/RecalibrateModal';

export function RoadmapSidebar() {
  const { language } = useTranslation();
  const [recalibrateOpen, setRecalibrateOpen] = useState(false);
  const isHe = language === 'he';

  return (
    <>
      <aside className="hidden lg:flex flex-col items-center justify-end w-[54px] min-w-[54px] border-s border-border/50 py-3">
        <button
          onClick={() => setRecalibrateOpen(true)}
          className="p-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
          title={isHe ? 'כיול מחדש' : 'Recalibrate'}
        >
          <RefreshCw className="w-4 h-4 text-primary" />
        </button>
      </aside>
      <RecalibrateModal open={recalibrateOpen} onOpenChange={setRecalibrateOpen} />
    </>
  );
}
