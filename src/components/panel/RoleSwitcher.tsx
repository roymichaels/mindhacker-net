import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Briefcase, Link2, ChevronDown, Check } from 'lucide-react';

interface PanelConfig {
  role: AppRole;
  path: string;
  label: string;
  labelHe: string;
  icon: React.ElementType;
}

const panelConfigs: PanelConfig[] = [
  { role: 'admin', path: '/panel', label: 'Admin Panel', labelHe: 'פאנל אדמין', icon: Shield },
  { role: 'practitioner', path: '/coach', label: 'Coach Panel', labelHe: 'פאנל מאמנים', icon: Briefcase },
  { role: 'affiliate', path: '/affiliate', label: 'Affiliate Panel', labelHe: 'פאנל שותפים', icon: Link2 },
];

const RoleSwitcher = () => {
  const { roles, hasRole } = useUserRoles();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isHebrew = language === 'he';

  // Get available panels for this user
  const availablePanels = panelConfigs.filter(config => hasRole(config.role));

  // Determine current panel based on path
  const getCurrentPanel = (): PanelConfig | undefined => {
    if (location.pathname.startsWith('/panel')) {
      return panelConfigs.find(p => p.role === 'admin');
    }
    if (location.pathname.startsWith('/coach')) {
      return panelConfigs.find(p => p.role === 'practitioner');
    }
    if (location.pathname.startsWith('/affiliate')) {
      return panelConfigs.find(p => p.role === 'affiliate');
    }
    return availablePanels[0];
  };

  const currentPanel = getCurrentPanel();

  // Don't show if user has only one role
  if (availablePanels.length <= 1) {
    return null;
  }

  const handlePanelSwitch = (panel: PanelConfig) => {
    navigate(panel.path);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="p-3 border-b border-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-3 px-3"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-start">
              <div className="font-medium text-sm">{displayName}</div>
              {currentPanel && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <currentPanel.icon className="h-3 w-3" />
                  {isHebrew ? currentPanel.labelHe : currentPanel.label}
                </div>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {availablePanels.map((panel) => {
            const isActive = currentPanel?.role === panel.role;
            return (
              <DropdownMenuItem
                key={panel.role}
                onClick={() => handlePanelSwitch(panel)}
                className={cn(
                  'flex items-center gap-3 py-2.5',
                  isActive && 'bg-primary/10'
                )}
              >
                <panel.icon className="h-4 w-4" />
                <span className="flex-1">{isHebrew ? panel.labelHe : panel.label}</span>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RoleSwitcher;
