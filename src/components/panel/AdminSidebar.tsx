import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MultiThreadOrb } from '@/components/orb/MultiThreadOrb';
import { useMultiThreadOrbProfile } from '@/hooks/useMultiThreadOrbProfile';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Key,
  UserCog,
  Mail,
  Brain,
  ShoppingBag,
  FileText,
  Palette,
  Settings,
  Send,
  UserPlus,
  Video,
  Shield,
  Megaphone,
  ChevronDown,
  ChevronUp,
  Globe,
  Sun,
  Moon,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  labelHe: string;
}

interface NavGroup {
  id: string;
  label: string;
  labelHe: string;
  icon: LucideIcon;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    labelHe: 'סקירה',
    icon: LayoutDashboard,
    items: [
      { to: '/panel', icon: LayoutDashboard, label: 'Dashboard', labelHe: 'דאשבורד' },
      { to: '/panel/analytics', icon: BarChart3, label: 'Analytics', labelHe: 'אנליטיקס' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    labelHe: 'ניהול',
    icon: Shield,
    items: [
      { to: '/panel/users', icon: Users, label: 'Users', labelHe: 'משתמשים' },
      { to: '/panel/roles', icon: Key, label: 'Roles', labelHe: 'תפקידים' },
      { to: '/panel/practitioners', icon: UserCog, label: 'Practitioners', labelHe: 'מאמנים' },
      { to: '/panel/leads', icon: Mail, label: 'Leads', labelHe: 'לידים' },
      { to: '/panel/aurora-insights', icon: Brain, label: 'Aurora Insights', labelHe: 'תובנות Aurora' },
    ],
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    labelHe: 'קמפיינים',
    icon: Megaphone,
    items: [
      { to: '/panel/affiliates', icon: UserPlus, label: 'Affiliates', labelHe: 'שותפים' },
      { to: '/panel/newsletter', icon: Send, label: 'Newsletter', labelHe: 'ניוזלטר' },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    labelHe: 'תוכן',
    icon: FileText,
    items: [
      { to: '/panel/products', icon: ShoppingBag, label: 'Products', labelHe: 'מוצרים' },
      { to: '/panel/content', icon: FileText, label: 'Content', labelHe: 'תוכן' },
      { to: '/panel/recordings', icon: Video, label: 'Recordings', labelHe: 'הקלטות' },
    ],
  },
  {
    id: 'site',
    label: 'Site',
    labelHe: 'אתר',
    icon: Settings,
    items: [
      { to: '/panel/settings', icon: Settings, label: 'Settings', labelHe: 'הגדרות' },
      { to: '/panel/theme', icon: Palette, label: 'Theme', labelHe: 'ערכת נושא' },
      { to: '/panel/landing-pages', icon: FileText, label: 'Landing Pages', labelHe: 'דפי נחיתה' },
    ],
  },
];

const AdminSidebar = () => {
  const { language } = useTranslation();
  const { setLanguage } = useLanguage();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { profile: orbProfile } = useMultiThreadOrbProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const isHebrew = language === 'he';
  const isDark = resolvedTheme === 'dark';

  // Track which groups are open - default open the group containing current route
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    const currentPath = location.pathname;
    const activeGroup = navGroups.find(g => g.items.some(item => 
      item.to === currentPath || (item.to === '/panel' && currentPath === '/panel')
    ));
    return activeGroup ? [activeGroup.id] : ['dashboard'];
  });

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

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <aside className="w-64 border-e border-border bg-card/50 min-h-[calc(100vh-64px)] sticky top-16 flex flex-col">
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          {navGroups.map((group) => {
            const isOpen = openGroups.includes(group.id);
            const hasActiveItem = group.items.some(item => 
              location.pathname === item.to || 
              (item.to === '/panel' && location.pathname === '/panel')
            );

            return (
              <Collapsible
                key={group.id}
                open={isOpen}
                onOpenChange={() => toggleGroup(group.id)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      'hover:bg-accent/50',
                      hasActiveItem && !isOpen && 'bg-accent/30 text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <group.icon className="h-4 w-4" />
                      <span>{isHebrew ? group.labelHe : group.label}</span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                      )} 
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1 ps-4">
                  <div className="space-y-0.5 border-s border-border/50 ps-2">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/panel'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all',
                            'hover:bg-accent hover:text-accent-foreground',
                            isActive
                              ? 'bg-primary text-primary-foreground font-medium'
                              : 'text-muted-foreground'
                          )
                        }
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {isHebrew ? item.labelHe : item.label}
                      </NavLink>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Account Dropdown at Bottom */}
      <div className="border-t border-border p-3 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-2 px-2"
            >
              <div className="h-9 w-9 shrink-0 rounded-full overflow-hidden">
                <MultiThreadOrb 
                  size={36}
                  showGlow={false}
                  profile={orbProfile}
                />
              </div>
              <div className="flex-1 text-start min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            align="end"
            side="top"
            className="w-56 bg-card border border-border shadow-xl z-[100]"
          >
            <DropdownMenuItem onClick={() => navigate('/aurora')}>
              <LayoutDashboard className="h-4 w-4 me-2" />
              {isHebrew ? 'חזרה לאורורה' : 'Back to Aurora'}
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
                ? (isHebrew ? 'מצב בהיר' : 'Light Mode')
                : (isHebrew ? 'מצב כהה' : 'Dark Mode')
              }
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 me-2" />
              {isHebrew ? 'התנתקות' : 'Sign Out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};

export default AdminSidebar;
