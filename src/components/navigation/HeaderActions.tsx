import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { UserNotificationBell } from '@/components/UserNotificationBell';
import { Wallet, Store } from 'lucide-react';
import { FMWalletModal } from '@/components/fm/FMWalletModal';

interface HeaderActionsProps {
  compact?: boolean;
}

export function HeaderActions({ compact }: HeaderActionsProps) {
  const [walletOpen, setWalletOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isFM = location.pathname.startsWith('/fm') || location.pathname.startsWith('/coaches') || location.pathname.startsWith('/business');

  return (
    <div className="flex items-center gap-1">
      {isFM && (
        <button
          onClick={() => setWalletOpen(true)}
          className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          title="Wallet"
        >
          <Wallet className="w-5 h-5" />
        </button>
      )}
      {!isFM && (
        <button
          onClick={() => navigate('/fm')}
          className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          title="Free Market"
        >
          <Store className="w-5 h-5" />
        </button>
      )}
      <UserNotificationBell />
      {isFM && <FMWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />}
    </div>
  );
}
