import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import AuroraAccountDropdown from '@/components/aurora/AuroraAccountDropdown';
import RoleSwitcher from './RoleSwitcher';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { NotificationBell } from '@/components/admin/NotificationBell';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Key,
  UserCog,
  Mail,
  Brain,
  ShoppingBag,
  Briefcase,
  FileText,
  Palette,
  Settings,
  Send,
  UserPlus,
  Video,
  Shield,
  Megaphone,
  ChevronDown,
  Bell,
  Plus,
  HelpCircle,
  Quote,
  Layout,
  FileEdit,
  Headphones,
  PanelTop,
  Sparkles,
  Bot,
  Bug,
  type LucideIcon,
} from 'lucide-react';

interface AdminSidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  labelHe: string;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  labelHe: string;
  icon: LucideIcon;
  items: NavItem[];
}

const AdminSidebar = ({ isMobile = false, onNavigate }: AdminSidebarProps) => {
  const { language, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isHebrew = language === 'he';

  // Fetch unread notifications count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['admin-unread-notifications'],
    queryFn: async () => {
      const { count } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      return count || 0;
    },
  });

  // Fetch new leads count
  const { data: newLeadsCount = 0 } = useQuery({
    queryKey: ['admin-new-leads'],
    queryFn: async () => {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
      return count || 0;
    },
  });

  // Fetch draft campaigns count
  const { data: draftCampaignsCount = 0 } = useQuery({
    queryKey: ['admin-draft-campaigns'],
    queryFn: async () => {
      const { count } = await supabase
        .from('newsletter_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');
      return count || 0;
    },
  });

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
        { to: '/panel/businesses', icon: Briefcase, label: 'Businesses', labelHe: 'עסקים' },
        { to: '/panel/leads', icon: Mail, label: 'Leads', labelHe: 'לידים', badge: newLeadsCount },
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
        { to: '/panel/newsletter', icon: Send, label: 'Newsletter', labelHe: 'ניוזלטר', badge: draftCampaignsCount },
        { to: '/panel/offers', icon: Sparkles, label: 'Offers', labelHe: 'הצעות' },
        { to: '/panel/purchases', icon: ShoppingBag, label: 'Purchases', labelHe: 'רכישות' },
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
        { to: '/panel/videos', icon: Video, label: 'Videos', labelHe: 'סרטונים' },
        { to: '/panel/recordings', icon: Headphones, label: 'Recordings', labelHe: 'הקלטות' },
        { to: '/panel/forms', icon: FileEdit, label: 'Forms', labelHe: 'טפסים' },
      ],
    },
    {
      id: 'site',
      label: 'Site',
      labelHe: 'אתר',
      icon: Settings,
      items: [
        { to: '/panel/landing-pages', icon: PanelTop, label: 'Landing Pages', labelHe: 'דפי נחיתה' },
        { to: '/panel/homepage', icon: Layout, label: 'Homepage', labelHe: 'עמוד הבית' },
        { to: '/panel/theme', icon: Palette, label: 'Theme', labelHe: 'ערכת נושא' },
        { to: '/panel/faqs', icon: HelpCircle, label: 'FAQs', labelHe: 'שאלות נפוצות' },
        { to: '/panel/testimonials', icon: Quote, label: 'Testimonials', labelHe: 'המלצות' },
      ],
    },
    {
      id: 'system',
      label: 'System',
      labelHe: 'מערכת',
      icon: Settings,
      items: [
        { to: '/panel/bug-reports', icon: Bug, label: 'Bug Reports', labelHe: 'דיווחי באגים' },
        { to: '/panel/chat-assistant', icon: Bot, label: 'Chat Assistant', labelHe: 'עוזר צ\'אט' },
        { to: '/panel/settings', icon: Settings, label: 'Settings', labelHe: 'הגדרות' },
      ],
    },
  ];

  // All groups open by default
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    return navGroups.map(g => g.id);
  });

  // Auto-expand group containing current route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeGroup = navGroups.find(group => 
      group.items.some(item => currentPath === item.to || currentPath.startsWith(item.to + '/'))
    );
    if (activeGroup && !openGroups.includes(activeGroup.id)) {
      setOpenGroups(prev => [...prev, activeGroup.id]);
    }
  }, [location.pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getGroupBadgeCount = (group: NavGroup) => 
    group.items.reduce((sum, item) => sum + (item.badge || 0), 0);

  return (
    <aside className={cn(
      "flex flex-col bg-card/50",
      isMobile 
        ? "w-full h-full border-0" 
        : "w-64 border-e border-border h-screen sticky top-0"
    )}>
      {/* Logo and Brand at top */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link to="/panel" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <AuroraOrbIcon size={32} className="text-primary flex-shrink-0" />
            <span className="font-bold text-lg">{t('sidebar.controlCenter')}</span>
          </Link>
          <NotificationBell />
        </div>
      </div>

      {/* Role Switcher for multi-role users */}
      <RoleSwitcher />

      {/* Quick Actions */}
      <div className="p-3 border-b border-border flex-shrink-0">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs gap-1 h-8"
            onClick={() => { navigate('/panel/newsletter'); onNavigate?.(); }}
          >
            <Plus className="w-3 h-3" />
            {t('sidebar.newCampaign')}
          </Button>
          <Button 
            size="sm" 
            variant={newLeadsCount > 0 ? "default" : "ghost"} 
            className="relative h-8 px-3"
            onClick={() => { navigate('/panel/leads'); onNavigate?.(); }}
          >
            <Mail className="w-4 h-4" />
            {newLeadsCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -end-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {newLeadsCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          {navGroups.map((group) => {
            const isOpen = openGroups.includes(group.id);
            const hasActiveItem = group.items.some(item => 
              location.pathname === item.to || 
              (item.to === '/panel' && location.pathname === '/panel') ||
              (item.to !== '/panel' && location.pathname.startsWith(item.to))
            );
            const groupBadgeCount = getGroupBadgeCount(group);

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
                    <div className="flex items-center gap-2">
                      {!isOpen && groupBadgeCount > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                          {groupBadgeCount}
                        </Badge>
                      )}
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isOpen && "rotate-180"
                        )} 
                      />
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1 ps-4">
                  <div className="space-y-0.5 border-s border-border/50 ps-2">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/panel'}
                        onClick={() => onNavigate?.()}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-all',
                            'hover:bg-accent hover:text-accent-foreground',
                            isActive
                              ? 'bg-primary text-primary-foreground font-medium'
                              : 'text-muted-foreground'
                          )
                        }
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-3.5 w-3.5" />
                          {isHebrew ? item.labelHe : item.label}
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="h-5 px-1.5 text-[10px]"
                          >
                            {item.badge}
                          </Badge>
                        )}
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
        <AuroraAccountDropdown showBackToAurora />
      </div>
    </aside>
  );
};

export default AdminSidebar;
