import { LogOut, Shield, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AccountSettingsTabProps {
  onClose: () => void;
}

const AccountSettingsTab = ({ onClose }: AccountSettingsTabProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onClose();
      navigate('/');
      toast.success(t('settings.account.signedOut'));
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error(t('settings.account.signOutError'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Sign Out */}
      <Button
        variant="destructive"
        className="w-full justify-start gap-3"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        {t('common.logout')}
      </Button>

      <Separator className="bg-border/50" />

      {/* Legal Links */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {t('settings.account.legal')}
        </p>
        
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{t('settings.account.privacy')}</span>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{t('settings.account.terms')}</span>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </div>
  );
};

export default AccountSettingsTab;
