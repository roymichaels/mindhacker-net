import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollArea } from '@/components/ui/scroll-area';
import RoleSwitcher from './RoleSwitcher';
import {
  LayoutDashboard,
  Link2,
  UserPlus,
  Wallet,
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
      { to: '/affiliate', icon: LayoutDashboard, label: 'Dashboard', labelHe: 'דאשבורד' },
    ],
  },
  {
    id: 'affiliate',
    label: 'Affiliate',
    labelHe: 'שותפות',
    icon: Link2,
    items: [
      { to: '/affiliate/links', icon: Link2, label: 'My Links', labelHe: 'הקישורים שלי' },
      { to: '/affiliate/referrals', icon: UserPlus, label: 'My Referrals', labelHe: 'ההפניות שלי' },
      { to: '/affiliate/payouts', icon: Wallet, label: 'My Payouts', labelHe: 'התשלומים שלי' },
    ],
  },
];

const AffiliateSidebar = () => {
  const { language } = useTranslation();
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
                    end={item.to === '/affiliate'}
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

export default AffiliateSidebar;
