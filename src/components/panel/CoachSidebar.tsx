import { NavLink, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollArea } from '@/components/ui/scroll-area';
import RoleSwitcher from './RoleSwitcher';
import AuroraAccountDropdown from '@/components/aurora/AuroraAccountDropdown';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  Globe,
  Store,
  Video,
  Mic,
  FileText,
  UserPlus,
  Mail,
  Tag,
  Receipt,
  MessageSquareQuote,
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
      { to: '/coach/clients', icon: Users, label: 'Clients', labelHe: 'לקוחות' },
      { to: '/coach/client-plans', icon: FileText, label: 'Client Plans', labelHe: 'תוכניות לקוחות' },
      { to: '/coach/services', icon: Package, label: 'Services', labelHe: 'שירותים' },
      { to: '/coach/calendar', icon: Calendar, label: 'Calendar', labelHe: 'יומן' },
      { to: '/coach/earnings', icon: DollarSign, label: 'Earnings', labelHe: 'הכנסות' },
    ],
  },
  {
    id: 'content',
    label: 'Content & Products',
    labelHe: 'תוכן ומוצרים',
    icon: BookOpen,
    items: [
      { to: '/coach/manage-content', icon: BookOpen, label: 'Content', labelHe: 'תוכן' },
      { to: '/coach/manage-products', icon: ShoppingBag, label: 'Products', labelHe: 'מוצרים' },
      { to: '/coach/videos', icon: Video, label: 'Videos', labelHe: 'סרטונים' },
      { to: '/coach/recordings', icon: Mic, label: 'Recordings', labelHe: 'הקלטות' },
      { to: '/coach/forms', icon: FileText, label: 'Forms', labelHe: 'טפסים' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    labelHe: 'שיווק',
    icon: Tag,
    items: [
      { to: '/coach/testimonials', icon: MessageSquareQuote, label: 'Testimonials', labelHe: 'המלצות' },
      { to: '/coach/reviews', icon: Star, label: 'Reviews', labelHe: 'ביקורות' },
      { to: '/coach/offers', icon: Tag, label: 'Offers', labelHe: 'הצעות' },
      { to: '/coach/leads', icon: UserPlus, label: 'Leads', labelHe: 'לידים' },
      { to: '/coach/newsletter', icon: Mail, label: 'Newsletter', labelHe: 'ניוזלטר' },
      { to: '/coach/purchases', icon: Receipt, label: 'Purchases', labelHe: 'רכישות' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    labelHe: 'הגדרות',
    icon: User,
    items: [
      { to: '/coach/profile', icon: User, label: 'Profile', labelHe: 'פרופיל' },
      { to: '/coach/storefront', icon: Globe, label: 'Storefront', labelHe: 'חנות' },
      { to: '/coach/theme', icon: Palette, label: 'Theme', labelHe: 'ערכת נושא' },
    ],
  },
];

interface CoachSidebarProps {
  onNavigate?: () => void;
  isMobileSheet?: boolean;
}

const CoachSidebar = ({ onNavigate, isMobileSheet = false }: CoachSidebarProps) => {
  const { language } = useTranslation();
  const isHebrew = language === 'he';
  const { data: myProfile } = useMyPractitionerProfile();

  // Fallback: fetch first practitioner slug for admin users
  const { data: fallbackSlug } = useQuery({
    queryKey: ['fallback-practitioner-slug'],
    queryFn: async () => {
      const { data } = await supabase
        .from('practitioners')
        .select('slug')
        .limit(1)
        .single();
      return data?.slug || null;
    },
    enabled: !myProfile?.slug,
  });

  const storeSlug = myProfile?.slug || fallbackSlug;

  const handleNavClick = () => {
    onNavigate?.();
  };

  return (
    <aside className={cn(
      "border-e border-border bg-card/50 flex flex-col",
      isMobileSheet ? "w-full h-full" : "w-64 h-screen sticky top-0"
    )}>
      {/* Logo and Brand at top */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <Link to="/coach" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <AuroraOrbIcon size={32} className="text-primary flex-shrink-0" />
          <span className="font-bold text-lg">{isHebrew ? 'מרכז שליטה' : 'Control Center'}</span>
        </Link>
      </div>

      <RoleSwitcher />
      
      {/* View My Page Button */}
      {storeSlug && (
        <div className="px-4 pt-4 space-y-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full justify-between"
          >
            <Link to={`/p/${storeSlug}`} target="_blank">
              {isHebrew ? 'הדף שלי' : 'View Storefront'}
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
                    onClick={handleNavClick}
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
