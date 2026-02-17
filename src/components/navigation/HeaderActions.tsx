import { useTranslation } from '@/hooks/useTranslation';
import { UserNotificationBell } from '@/components/UserNotificationBell';

interface HeaderActionsProps {
  compact?: boolean;
}

export function HeaderActions({ compact }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <UserNotificationBell />
    </div>
  );
}
