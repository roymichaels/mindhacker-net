import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import AuroraAccountDropdown from '@/components/aurora/AuroraAccountDropdown';
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
  const location = useLocation();
  const isHebrew = language === 'he';

  // All groups open by default
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    return navGroups.map(g => g.id);
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
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

      {/* Account Dropdown at Bottom - using shared component */}
      <div className="border-t border-border p-3 mt-auto">
        <AuroraAccountDropdown showBackToAurora />
      </div>
    </aside>
  );
};

export default AdminSidebar;
