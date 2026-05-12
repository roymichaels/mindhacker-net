import { UserNotificationBell } from '@/components/UserNotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Wallet, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuroraSearchBar } from '@/components/aurora/AuroraSearchBar';
import { cn } from '@/lib/utils';
import { useWalletModal } from '@/contexts/WalletModalContext';

interface HeaderActionsProps {
  compact?: boolean;
}

export function HeaderActions({ compact }: HeaderActionsProps) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openWallet, isOpen: isWalletOpen } = useWalletModal();
  const isMindOSChatPage = location.pathname === '/mindos/chat' || location.pathname === '/aurora';
  const isFMPage = location.pathname.startsWith('/fm');

  return (
    <div className="flex items-center gap-1">
      {isMindOSChatPage && <AuroraSearchBar />}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-primary"
        onClick={() => navigate('/strategy?tab=missions')}
        title="Play"
        aria-label="Open Mission Control"
      >
        <Play className="h-4 w-4" />
      </Button>
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
            isWalletOpen
              ? "text-amber-500 dark:text-amber-400"
              : "text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400"
          )}
          onClick={openWallet}
          title="Wallet"
        >
          <Wallet className="h-4 w-4" />
        </Button>
      )}
      <UserNotificationBell />
    </div>
  );
}
