import { UserNotificationBell } from '@/components/UserNotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderActionsProps {
  compact?: boolean;
}

export function HeaderActions({ compact }: HeaderActionsProps) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1">
      {isAdmin && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => navigate('/panel')}
          title="Admin Panel"
        >
          <Shield className="h-4 w-4" />
        </Button>
      )}
      <UserNotificationBell />
    </div>
  );
}
