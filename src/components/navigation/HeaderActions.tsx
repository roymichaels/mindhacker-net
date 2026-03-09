import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { UserNotificationBell } from '@/components/UserNotificationBell';
import { HelpCircle } from 'lucide-react';
import { UserDocsModal } from '@/components/modals/UserDocsModal';

interface HeaderActionsProps {
  compact?: boolean;
}

export function HeaderActions({ compact }: HeaderActionsProps) {
  const [docsOpen, setDocsOpen] = useState(false);
  const { isRTL } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setDocsOpen(true)}
        className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        title={isRTL ? 'מדריך למשתמש' : 'User Guide'}
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      <UserNotificationBell />
      <UserDocsModal open={docsOpen} onOpenChange={setDocsOpen} />
    </div>
  );
}
