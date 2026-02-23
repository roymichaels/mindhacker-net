/**
 * CoreHub — Body content rendered inside LifeLayoutWrapper.
 * Displays the user's personalized execution grid for Core/ליבה domains.
 */
import { AnalysisProgressBar } from '@/components/hubs/AnalysisProgressBar';
import { TodayExecutionSection } from '@/components/execution/TodayExecutionSection';
import { UserPlateGrid } from '@/components/plate/UserPlateGrid';

export default function LifeHub() {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-4 flex-1 px-1">
        <div className="pt-1" />
        <AnalysisProgressBar />
        <TodayExecutionSection hub="core" />
        <UserPlateGrid hub="core" />
      </div>
    </div>
  );
}
