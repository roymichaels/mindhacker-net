import { ChevronUp, Settings, LogOut, Globe, Sun, Moon, Shield, UserCog, Link2 } from 'lucide-react';
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
import { useTheme } from 'next-themes';
import { MultiThreadOrb } from '@/components/orb/MultiThreadOrb';
import { useMultiThreadOrbProfile } from '@/hooks/useMultiThreadOrbProfile';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useNavigate } from 'react-router-dom';

interface AuroraAccountDropdownProps {
  isCollapsed: boolean;
  onOpenSettings: () => void;
}

const AuroraAccountDropdown = ({
  isCollapsed,
  onOpenSettings,
}: AuroraAccountDropdownProps) => {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const { setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { profile: orbProfile } = useMultiThreadOrbProfile();
  const { hasRole } = useUserRoles();
  const navigate = useNavigate();

  const isAdmin = hasRole('admin');
  const isPractitioner = hasRole('practitioner');
  const isAffiliate = hasRole('affiliate');

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

  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
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
          {/* MultiThread Orb Avatar - consistent with header */}
          <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden">
            <MultiThreadOrb 
              size={40}
              showGlow={false}
              profile={orbProfile}
            />
          </div>
          
          {!isCollapsed && (
            <>
              <div className="flex-1 text-start min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align={isRTL ? "end" : "start"}
        side="top"
        className="w-56 bg-card border border-border shadow-xl z-[100]"
      >
        {/* Panel Links - Role-based */}
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/panel')}>
            <Shield className="h-4 w-4 me-2" />
            {language === 'he' ? 'פאנל ניהול' : 'Admin Panel'}
          </DropdownMenuItem>
        )}
        
        {isPractitioner && (
          <DropdownMenuItem onClick={() => navigate('/coach')}>
            <UserCog className="h-4 w-4 me-2" />
            {language === 'he' ? 'פאנל מאמן' : 'Coach Panel'}
          </DropdownMenuItem>
        )}
        
        {isAffiliate && (
          <DropdownMenuItem onClick={() => navigate('/affiliate')}>
            <Link2 className="h-4 w-4 me-2" />
            {language === 'he' ? 'פאנל שותפים' : 'Affiliate Panel'}
          </DropdownMenuItem>
        )}
        
        {(isAdmin || isPractitioner || isAffiliate) && <DropdownMenuSeparator />}
        
        <DropdownMenuItem onClick={onOpenSettings}>
          <Settings className="h-4 w-4 me-2" />
          {t('aurora.account.settings')}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Language Toggle */}
        <DropdownMenuItem onClick={handleLanguageToggle}>
          <Globe className="h-4 w-4 me-2" />
          {language === 'he' ? 'English' : 'עברית'}
        </DropdownMenuItem>
        
        {/* Theme Toggle */}
        <DropdownMenuItem onClick={handleThemeToggle}>
          {isDark ? (
            <Sun className="h-4 w-4 me-2" />
          ) : (
            <Moon className="h-4 w-4 me-2" />
          )}
          {isDark 
            ? (language === 'he' ? 'מצב בהיר' : 'Light Mode')
            : (language === 'he' ? 'מצב כהה' : 'Dark Mode')
          }
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
