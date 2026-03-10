import { UserNotificationBell } from '@/components/UserNotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuroraSearchBar } from '@/components/aurora/AuroraSearchBar';
import { cn } from '@/lib/utils';

interface HeaderActionsProps {
  compact?: boolean;
}

export function HeaderActions({ compact }: HeaderActionsProps) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuroraPage = location.pathname === '/aurora';
  const isFMPage = location.pathname.startsWith('/fm');
  const isWalletActive = location.pathname.startsWith('/fm/wallet') || location.pathname.startsWith('/fm/cashout') || location.pathname.startsWith('/fm/bridge');

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
      {isFMPage && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            isWalletActive
              ? "text-amber-500 dark:text-amber-400"
              : "text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400"
          )}
          onClick={() => navigate('/fm/wallet')}
          title="Wallet"
        >
          <Wallet className="h-4 w-4" />
        </Button>
      )}
      <UserNotificationBell />
    </div>
  );
}
