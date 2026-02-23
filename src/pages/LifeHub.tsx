/**
 * CoreHub — Body content rendered inside LifeLayoutWrapper.
 * Displays the user's personalized execution grid for Core/ליבה domains.
 */
import { UserPlateGrid } from '@/components/plate/UserPlateGrid';

export default function LifeHub() {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-4 flex-1 px-1 pt-2">
        <UserPlateGrid hub="core" />
      </div>
    </div>
  );
}
