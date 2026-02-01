import { NavLink, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollArea } from '@/components/ui/scroll-area';
import RoleSwitcher from './RoleSwitcher';
import AuroraAccountDropdown from '@/components/aurora/AuroraAccountDropdown';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { Button } from '@/components/ui/button';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import {
  LayoutDashboard,
  Users,
  Package,
  Calendar,
  DollarSign,
  User,
  ShoppingBag,
  Palette,
  Briefcase,
  ExternalLink,
  BookOpen,
  Star,
  BarChart3,
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
    id: 'overview',
    label: 'Overview',
    labelHe: 'סקירה',
    icon: LayoutDashboard,
    items: [
      { to: '/coach', icon: LayoutDashboard, label: 'Dashboard', labelHe: 'דאשבורד' },
      { to: '/coach/analytics', icon: BarChart3, label: 'Analytics', labelHe: 'אנליטיקס' },
    ],
  },
  {
    id: 'practice',
    label: 'My Practice',
    labelHe: 'הפרקטיקה שלי',
    icon: Briefcase,
    items: [
      { to: '/coach/clients', icon: Users, label: 'My Clients', labelHe: 'הלקוחות שלי' },
      { to: '/coach/services', icon: Package, label: 'My Services', labelHe: 'השירותים שלי' },
      { to: '/coach/calendar', icon: Calendar, label: 'My Calendar', labelHe: 'היומן שלי' },
      { to: '/coach/products', icon: ShoppingBag, label: 'My Products', labelHe: 'המוצרים שלי' },
      { to: '/coach/content', icon: BookOpen, label: 'My Content', labelHe: 'התכנים שלי' },
      { to: '/coach/reviews', icon: Star, label: 'My Reviews', labelHe: 'הביקורות שלי' },
      { to: '/coach/earnings', icon: DollarSign, label: 'My Earnings', labelHe: 'ההכנסות שלי' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    labelHe: 'הגדרות',
    icon: User,
    items: [
      { to: '/coach/profile', icon: User, label: 'My Profile', labelHe: 'הפרופיל שלי' },
      { to: '/coach/theme', icon: Palette, label: 'Theme', labelHe: 'ערכת נושא' },
    ],
  },
];

const CoachSidebar = () => {
  const { language } = useTranslation();
  const isHebrew = language === 'he';
  const { data: myProfile } = useMyPractitionerProfile();

  return (
    <aside className="w-64 border-e border-border bg-card/50 h-screen sticky top-0 flex flex-col">
      {/* Logo and Brand at top */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <Link to="/coach" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <AuroraOrbIcon size={32} className="text-primary flex-shrink-0" />
          <span className="font-bold text-lg">{isHebrew ? 'מרכז שליטה' : 'Control Center'}</span>
        </Link>
      </div>

      <RoleSwitcher />
      
      {/* View My Page Button */}
      {myProfile?.slug && (
        <div className="px-4 pt-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full justify-between"
          >
            <Link to={`/practitioners/${myProfile.slug}`} target="_blank">
              {isHebrew ? 'הדף שלי' : 'View My Page'}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
      
      <ScrollArea className="flex-1">
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
                    end={item.to === '/coach'}
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

      {/* Account Dropdown at Bottom - using shared component */}
      <div className="border-t border-border p-3 mt-auto">
        <AuroraAccountDropdown showBackToAurora />
      </div>
    </aside>
  );
};

export default CoachSidebar;
