/**
 * CoreHub — Body content rendered inside LifeLayoutWrapper.
 * Displays the user's personalized execution grid for Core/ליבה domains.
 */
import { UserPlateGrid } from '@/components/plate/UserPlateGrid';
import { HubPillarsList } from '@/components/hubs/HubPillarsList';
import { DailyMilestones } from '@/components/hubs/DailyMilestones';

export default function LifeHub() {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-6 flex-1 px-1 pt-2">
        <DailyMilestones hub="core" />
        <UserPlateGrid hub="core" />
        <HubPillarsList hub="core" />
      </div>
    </div>
  );
}