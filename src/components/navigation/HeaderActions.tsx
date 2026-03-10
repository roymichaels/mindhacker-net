import { UserNotificationBell } from '@/components/UserNotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuroraSearchBar } from '@/components/aurora/AuroraSearchBar';

interface HeaderActionsProps {
  compact?: boolean;
}

export function HeaderActions({ compact }: HeaderActionsProps) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuroraPage = location.pathname === '/aurora';

  return (
    <div className="flex items-center gap-1">
      {isAuroraPage && <AuroraSearchBar />}
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
