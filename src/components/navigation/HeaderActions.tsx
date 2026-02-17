import { Users, Compass } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { UserNotificationBell } from '@/components/UserNotificationBell';
import { usePractitionersModal } from '@/contexts/PractitionersModalContext';
import { cn } from '@/lib/utils';

interface HeaderActionsProps {
  compact?: boolean;
  onOpenHypnosis: () => void;
}

export function HeaderActions({ compact, onOpenHypnosis }: HeaderActionsProps) {
  const { language } = useTranslation();
  const { openPractitioners } = usePractitionersModal();

  const size = compact ? 'h-8 w-8' : 'h-9 w-9';
  const iconSize = compact ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-1">
      <button
        className={cn(
          size,
          "rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center hover:brightness-110 transition"
        )}
        onClick={() => openPractitioners()}
        title={language === 'he' ? 'מאמנים' : 'Coaches'}
      >
        <Users className={cn(iconSize, "text-pink-600 dark:text-pink-400")} />
      </button>
      <button
        className={cn(
          size,
          "rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center hover:brightness-110 transition"
        )}
        onClick={onOpenHypnosis}
        title={language === 'he' ? 'כוח-על' : 'Power-Up'}
      >
        <Compass className={cn(iconSize, "text-violet-600 dark:text-violet-400")} />
      </button>
      <UserNotificationBell />
    </div>
  );
}
