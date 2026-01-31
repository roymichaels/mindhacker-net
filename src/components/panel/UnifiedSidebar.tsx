import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { usePermissions } from '@/hooks/usePermissions';
import { ScrollArea } from '@/components/ui/scroll-area';
import AuroraAccountDropdown from '@/components/aurora/AuroraAccountDropdown';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Key,
  UserCog,
  Mail,
  Brain,
  Package,
  ShoppingBag,
  FileText,
  Palette,
  Settings,
  Megaphone,
  Link2,
  UserPlus,
  Wallet,
  Calendar,
  DollarSign,
  User,
  Video,
  Send,
  Shield,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  permission?: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

const UnifiedSidebar = () => {
  const { t } = useTranslation();
  const { hasRole } = useUserRoles();
  const { hasPermission } = usePermissions();

  const navGroups = useMemo(() => {
    const groups: NavGroup[] = [];

    // Dashboard - for everyone with panel access
    groups.push({
      id: 'dashboard',
      label: t('panel.overview'),
      icon: LayoutDashboard,
      items: [
        { to: '/panel', icon: LayoutDashboard, label: t('panel.dashboard') },
        { to: '/panel/analytics', icon: BarChart3, label: t('panel.analytics'), permission: 'analytics.view' },
      ],
    });

    // Admin section
    if (hasRole('admin')) {
      groups.push({
        id: 'admin',
        label: t('panel.administration'),
        icon: Shield,
        items: [
          { to: '/panel/users', icon: Users, label: t('panel.users'), permission: 'users.view' },
          { to: '/panel/roles', icon: Key, label: t('panel.roles'), permission: 'users.roles' },
          { to: '/panel/practitioners', icon: UserCog, label: t('panel.practitioners'), permission: 'practitioners.view' },
          { to: '/panel/leads', icon: Mail, label: t('panel.leads'), permission: 'leads.view' },
          { to: '/panel/aurora-insights', icon: Brain, label: 'Aurora Insights', permission: 'aurora.insights' },
        ],
      });

      groups.push({
        id: 'campaigns',
        label: t('panel.campaigns'),
        icon: Megaphone,
        items: [
          { to: '/panel/affiliates', icon: UserPlus, label: t('panel.affiliates'), permission: 'affiliates.view' },
          { to: '/panel/newsletter', icon: Send, label: t('panel.newsletter'), permission: 'newsletter.view' },
        ],
      });

      groups.push({
        id: 'content',
        label: t('panel.content'),
        icon: FileText,
        items: [
          { to: '/panel/products', icon: ShoppingBag, label: t('panel.products'), permission: 'products.view' },
          { to: '/panel/content', icon: FileText, label: t('panel.contentMgmt'), permission: 'content.view' },
          { to: '/panel/recordings', icon: Video, label: t('panel.recordings'), permission: 'recordings.view' },
        ],
      });

      groups.push({
        id: 'site',
        label: t('panel.site'),
        icon: Settings,
        items: [
          { to: '/panel/settings', icon: Settings, label: t('panel.settings'), permission: 'site.settings' },
          { to: '/panel/theme', icon: Palette, label: t('panel.theme'), permission: 'site.theme' },
          { to: '/panel/landing-pages', icon: FileText, label: t('panel.landingPages'), permission: 'site.landing' },
        ],
      });
    }

    // Practitioner section
    if (hasRole('practitioner')) {
      groups.push({
        id: 'my-practice',
        label: t('panel.myPractice'),
        icon: Briefcase,
        items: [
          { to: '/panel/my-clients', icon: Users, label: t('panel.clients'), permission: 'clients.view' },
          { to: '/panel/my-services', icon: Package, label: t('panel.services'), permission: 'services.view' },
          { to: '/panel/my-calendar', icon: Calendar, label: t('panel.calendar'), permission: 'calendar.view' },
          { to: '/panel/my-products', icon: ShoppingBag, label: t('panel.myProducts'), permission: 'products.own' },
          { to: '/panel/my-earnings', icon: DollarSign, label: t('panel.earnings'), permission: 'earnings.view' },
          { to: '/panel/my-profile', icon: User, label: t('panel.profile'), permission: 'profile.edit' },
        ],
      });
    }

    // Affiliate section
    if (hasRole('affiliate')) {
      groups.push({
        id: 'affiliate',
        label: t('panel.affiliate'),
        icon: Link2,
        items: [
          { to: '/panel/my-links', icon: Link2, label: t('panel.links'), permission: 'links.view' },
          { to: '/panel/my-referrals', icon: UserPlus, label: t('panel.referrals'), permission: 'referrals.view' },
          { to: '/panel/my-payouts', icon: Wallet, label: t('panel.payouts'), permission: 'payouts.view' },
        ],
      });
    }

    return groups;
  }, [hasRole, t]);

  const filteredGroups = useMemo(() => {
    return navGroups.map(group => ({
      ...group,
      items: group.items.filter(item => !item.permission || hasPermission(item.permission)),
    })).filter(group => group.items.length > 0);
  }, [navGroups, hasPermission]);

  return (
    <aside className="w-64 border-e border-border bg-card/50 min-h-[calc(100vh-64px)] sticky top-16 flex flex-col">
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.id}>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <group.icon className="h-4 w-4" />
                {group.label}
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
                    {item.label}
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

export default UnifiedSidebar;
