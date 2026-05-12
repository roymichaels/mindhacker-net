import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWalletModal } from '@/contexts/WalletModalContext';

interface HeaderActionsProps {
  compact?: boolean;
}

export function HeaderActions({ compact }: HeaderActionsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openWallet, isOpen: isWalletOpen } = useWalletModal();
  const isFMPage = location.pathname.startsWith('/fm');

  return (
    <div className="flex items-center gap-1">
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
    </div>
  );
}
