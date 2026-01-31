import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollArea } from '@/components/ui/scroll-area';
import RoleSwitcher from './RoleSwitcher';
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

  return (
    <aside className="w-64 border-e border-border bg-card/50 min-h-[calc(100vh-64px)] sticky top-16">
      <RoleSwitcher />
      <ScrollArea className="h-[calc(100vh-64px-80px)]">
        <nav className="p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.id}>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <group.icon className="h-4 w-4" />
                {isHebrew ? group.labelHe : group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/panel'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                        'hover:bg-accent hover:text-accent-foreground',
                        isActive
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-muted-foreground'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {isHebrew ? item.labelHe : item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
};

export default AdminSidebar;
