import { ChevronUp, LayoutDashboard, Settings, ListChecks, LogOut, Globe } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface AuroraAccountDropdownProps {
  isCollapsed: boolean;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
  onOpenChecklists: () => void;
}

const AuroraAccountDropdown = ({
  isCollapsed,
  onOpenDashboard,
  onOpenSettings,
  onOpenChecklists,
}: AuroraAccountDropdownProps) => {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const { setLanguage } = useLanguage();

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  

  const handleLanguageToggle = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-auto py-2",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <>
              <div className="flex-1 text-start min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align={isRTL ? "end" : "start"}
        side="top"
        className="w-56 bg-background border"
      >
        <DropdownMenuItem onClick={onOpenDashboard}>
          <LayoutDashboard className="h-4 w-4 me-2" />
          {t('aurora.account.dashboard')}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onOpenChecklists}>
          <ListChecks className="h-4 w-4 me-2" />
          {t('aurora.checklists.title')}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onOpenSettings}>
          <Settings className="h-4 w-4 me-2" />
          {t('aurora.account.settings')}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLanguageToggle}>
          <Globe className="h-4 w-4 me-2" />
          {language === 'he' ? 'English' : 'עברית'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 me-2" />
          {t('aurora.account.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuroraAccountDropdown;
