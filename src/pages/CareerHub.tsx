/**
 * CareerHub — Unified command center for all career paths.
 * Merges CoachHub, FreelancerHub, CreatorHub, and Business dashboard
 * into a single adaptive layout with career-type-specific tabs.
 */
import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCareerApplication } from '@/hooks/useCareerApplication';
import CareerWizard from '@/components/career/CareerWizard';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMyCoachProfile, useCoachReviewStats, useFirstCoachSlug, useCoach } from '@/domain/coaches';
import { useCoachClientStats } from '@/hooks/useCoachClients';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { PageSkeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, Briefcase, GraduationCap, Heart, Palette, Code, Loader2, XCircle } from 'lucide-react';
import {
  LayoutDashboard, Users, Star, DollarSign, FileText, Megaphone,
  Settings, ExternalLink, Search, FolderKanban, Image, BarChart3,
  BookOpen, Package, Video, TrendingUp, User
} from 'lucide-react';
import { PractitionerProfileHeader, PractitionerFeedTabs } from '@/components/practitioner-landing';

// Coach tabs
import CoachDashboardOverview from '@/components/coach/CoachDashboardOverview';
import CoachMarketingTab from '@/components/coach/CoachMarketingTab';
import CoachSettingsTab from '@/components/coach/CoachSettingsTab';
import CoachLandingPagesTab from '@/components/coach/CoachLandingPagesTab';
import CoachLeadsTab from '@/components/coach/CoachLeadsTab';
import CoachAnalyticsTab from '@/components/coach/CoachAnalyticsTab';
import CoachContentTab from '@/components/coach/CoachContentTab';
import CoachProductsTab from '@/components/coach/CoachProductsTab';
import CoachClientsTab from '@/components/coach/CoachClientsTab';
import CoachPlansTab from '@/components/coach/CoachPlansTab';

// Freelancer tabs
import FreelancerDashboardTab from '@/components/freelancer/FreelancerDashboardTab';
import FreelancerGigsTab from '@/components/freelancer/FreelancerGigsTab';
import FreelancerProjectsTab from '@/components/freelancer/FreelancerProjectsTab';
import FreelancerPortfolioTab from '@/components/freelancer/FreelancerPortfolioTab';
import FreelancerEarningsTab from '@/components/freelancer/FreelancerEarningsTab';
import FreelancerSettingsTab from '@/components/freelancer/FreelancerSettingsTab';

// Creator tabs
import CreatorDashboardTab from '@/components/creator/CreatorDashboardTab';
import CreatorCoursesTab from '@/components/creator/CreatorCoursesTab';
import CreatorProductsTab from '@/components/creator/CreatorProductsTab';
import CreatorContentTab from '@/components/creator/CreatorContentTab';
import CreatorAnalyticsTab from '@/components/creator/CreatorAnalyticsTab';
import CreatorSettingsTab from '@/components/creator/CreatorSettingsTab';

export type CareerPath = 'coach' | 'therapist' | 'freelancer' | 'creator' | 'business';

interface CareerHubProps {
  careerPath: CareerPath;
}

// ── Theme config per career path ──
const THEME: Record<CareerPath, {
  icon: typeof Briefcase;
  color: string;
  activeTabBg: string;
  activeTabBorder: string;
  activeTabText: string;
  headerGradient: string;
  headerBorder: string;
  avatarBorder: string;
  avatarBg: string;
  avatarText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  gradientText: string;
  titleEn: string;
  titleHe: string;
  badgeLabelEn: string;
  badgeLabelHe: string;
}> = {
  coach: {
    icon: GraduationCap,
    color: 'purple',
    activeTabBg: 'bg-purple-500/15',
    activeTabBorder: 'border-purple-500/30',
    activeTabText: 'text-purple-400',
    headerGradient: 'from-purple-500/10 via-indigo-500/10 to-purple-500/5',
    headerBorder: 'border-purple-500/20',
    avatarBorder: 'border-purple-500/30',
    avatarBg: 'bg-purple-500/20',
    avatarText: 'text-purple-400',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/30',
    gradientText: 'from-purple-500 to-indigo-500',
    titleEn: 'Coach Command Center',
    titleHe: 'מרכז הפיקוד — מאמן',
    badgeLabelEn: 'Coach',
    badgeLabelHe: 'מאמן',
  },
  therapist: {
    icon: Heart,
    color: 'rose',
    activeTabBg: 'bg-rose-500/15',
    activeTabBorder: 'border-rose-500/30',
    activeTabText: 'text-rose-400',
    headerGradient: 'from-rose-500/10 via-pink-500/10 to-rose-500/5',
    headerBorder: 'border-rose-500/20',
    avatarBorder: 'border-rose-500/30',
    avatarBg: 'bg-rose-500/20',
    avatarText: 'text-rose-400',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/30',
    gradientText: 'from-rose-500 to-pink-500',
    titleEn: 'Therapy Practice Center',
    titleHe: 'מרכז הפיקוד — מטפל',
    badgeLabelEn: 'Therapist',
    badgeLabelHe: 'מטפל',
  },
  freelancer: {
    icon: Code,
    color: 'emerald',
    activeTabBg: 'bg-emerald-500/15',
    activeTabBorder: 'border-emerald-500/30',
    activeTabText: 'text-emerald-400',
    headerGradient: 'from-emerald-500/10 via-teal-500/10 to-emerald-500/5',
    headerBorder: 'border-emerald-500/20',
    avatarBorder: 'border-emerald-500/30',
    avatarBg: 'bg-emerald-500/20',
    avatarText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    gradientText: 'from-emerald-500 to-teal-500',
    titleEn: 'Freelancer Command Center',
    titleHe: 'מרכז הפיקוד — פרילנסר',
    badgeLabelEn: 'Freelancer',
    badgeLabelHe: 'פרילנסר',
  },
  creator: {
    icon: Palette,
    color: 'sky',
    activeTabBg: 'bg-sky-500/15',
    activeTabBorder: 'border-sky-500/30',
    activeTabText: 'text-sky-400',
    headerGradient: 'from-sky-500/10 via-blue-500/10 to-sky-500/5',
    headerBorder: 'border-sky-500/20',
    avatarBorder: 'border-sky-500/30',
    avatarBg: 'bg-sky-500/20',
    avatarText: 'text-sky-400',
    badgeBg: 'bg-sky-500/15',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30',
    gradientText: 'from-sky-500 to-blue-500',
    titleEn: 'Creator Studio',
    titleHe: 'סטודיו היוצר',
    badgeLabelEn: 'Creator',
    badgeLabelHe: 'יוצר',
  },
  business: {
    icon: Briefcase,
    color: 'amber',
    activeTabBg: 'bg-amber-500/15',
    activeTabBorder: 'border-amber-500/30',
    activeTabText: 'text-amber-400',
    headerGradient: 'from-amber-500/10 via-yellow-400/10 to-amber-500/5',
    headerBorder: 'border-amber-500/20',
    avatarBorder: 'border-amber-500/30',
    avatarBg: 'bg-amber-500/20',
    avatarText: 'text-amber-400',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
    gradientText: 'from-amber-500 to-yellow-500',
    titleEn: 'Business Command Center',
    titleHe: 'מרכז הפיקוד — עסק',
    badgeLabelEn: 'Business',
    badgeLabelHe: 'בעל עסק',
  },
};

// ── Tab definitions per career path ──
type TabDef = { id: string; icon: typeof LayoutDashboard; labelEn: string; labelHe: string };

const SHARED_TABS: TabDef[] = [
  { id: 'dashboard', icon: LayoutDashboard, labelEn: 'Overview', labelHe: 'סקירה' },
];

const TABS_BY_PATH: Record<CareerPath, TabDef[]> = {
  coach: [
    ...SHARED_TABS,
    { id: 'clients', icon: Users, labelEn: 'Clients', labelHe: 'מתאמנים' },
    { id: 'leads', icon: Star, labelEn: 'Leads', labelHe: 'לידים' },
    { id: 'products', icon: DollarSign, labelEn: 'Products', labelHe: 'מוצרים' },
    { id: 'content', icon: FileText, labelEn: 'Content', labelHe: 'תוכן' },
    { id: 'plans', icon: FileText, labelEn: 'Plans', labelHe: 'תוכניות' },
    { id: 'marketing', icon: Megaphone, labelEn: 'Marketing', labelHe: 'שיווק' },
    { id: 'analytics', icon: ExternalLink, labelEn: 'Analytics', labelHe: 'אנליטיקס' },
    { id: 'landing-pages', icon: FileText, labelEn: 'Landing Pages', labelHe: 'דפי נחיתה' },
    { id: 'settings', icon: Settings, labelEn: 'Settings', labelHe: 'הגדרות' },
  ],
  therapist: [
    ...SHARED_TABS,
    { id: 'clients', icon: Users, labelEn: 'Clients', labelHe: 'מטופלים' },
    { id: 'leads', icon: Star, labelEn: 'Leads', labelHe: 'לידים' },
    { id: 'products', icon: DollarSign, labelEn: 'Services', labelHe: 'שירותים' },
    { id: 'content', icon: FileText, labelEn: 'Content', labelHe: 'תוכן' },
    { id: 'plans', icon: FileText, labelEn: 'Plans', labelHe: 'תוכניות' },
    { id: 'marketing', icon: Megaphone, labelEn: 'Marketing', labelHe: 'שיווק' },
    { id: 'analytics', icon: ExternalLink, labelEn: 'Analytics', labelHe: 'אנליטיקס' },
    { id: 'landing-pages', icon: FileText, labelEn: 'Landing Pages', labelHe: 'דפי נחיתה' },
    { id: 'settings', icon: Settings, labelEn: 'Settings', labelHe: 'הגדרות' },
  ],
  freelancer: [
    ...SHARED_TABS,
    { id: 'gigs', icon: Search, labelEn: 'Gigs', labelHe: 'הזדמנויות' },
    { id: 'projects', icon: FolderKanban, labelEn: 'Projects', labelHe: 'פרויקטים' },
    { id: 'clients', icon: Users, labelEn: 'Clients', labelHe: 'לקוחות' },
    { id: 'portfolio', icon: Image, labelEn: 'Portfolio', labelHe: 'תיק עבודות' },
    { id: 'products', icon: DollarSign, labelEn: 'Products', labelHe: 'מוצרים' },
    { id: 'content', icon: FileText, labelEn: 'Content', labelHe: 'תוכן' },
    { id: 'earnings', icon: DollarSign, labelEn: 'Earnings', labelHe: 'הכנסות' },
    { id: 'marketing', icon: Megaphone, labelEn: 'Marketing', labelHe: 'שיווק' },
    { id: 'analytics', icon: BarChart3, labelEn: 'Analytics', labelHe: 'אנליטיקס' },
    { id: 'settings', icon: Settings, labelEn: 'Settings', labelHe: 'הגדרות' },
  ],
  creator: [
    ...SHARED_TABS,
    { id: 'courses', icon: BookOpen, labelEn: 'Courses', labelHe: 'קורסים' },
    { id: 'products', icon: Package, labelEn: 'Products', labelHe: 'מוצרים' },
    { id: 'content', icon: FileText, labelEn: 'Content', labelHe: 'תוכן' },
    { id: 'clients', icon: Users, labelEn: 'Clients', labelHe: 'לקוחות' },
    { id: 'marketing', icon: Megaphone, labelEn: 'Marketing', labelHe: 'שיווק' },
    { id: 'analytics', icon: BarChart3, labelEn: 'Analytics', labelHe: 'אנליטיקס' },
    { id: 'landing-pages', icon: FileText, labelEn: 'Landing Pages', labelHe: 'דפי נחיתה' },
    { id: 'settings', icon: Settings, labelEn: 'Settings', labelHe: 'הגדרות' },
  ],
  business: [
    ...SHARED_TABS,
    { id: 'clients', icon: Users, labelEn: 'Clients', labelHe: 'לקוחות' },
    { id: 'leads', icon: Star, labelEn: 'Leads', labelHe: 'לידים' },
    { id: 'products', icon: DollarSign, labelEn: 'Products', labelHe: 'מוצרים' },
    { id: 'content', icon: FileText, labelEn: 'Content', labelHe: 'תוכן' },
    { id: 'marketing', icon: Megaphone, labelEn: 'Marketing', labelHe: 'שיווק' },
    { id: 'analytics', icon: ExternalLink, labelEn: 'Analytics', labelHe: 'אנליטיקס' },
    { id: 'landing-pages', icon: FileText, labelEn: 'Landing Pages', labelHe: 'דפי נחיתה' },
    { id: 'settings', icon: Settings, labelEn: 'Settings', labelHe: 'הגדרות' },
  ],
};

// ── Stats config per career ──
function getStatCards(path: CareerPath, isHe: boolean, coachStats?: { active: number; avg: number; count: number }) {
  const s = coachStats || { active: 0, avg: 0, count: 0 };
  switch (path) {
    case 'coach':
    case 'therapist':
      return [
        { icon: Users, value: s.active, label: isHe ? 'פעילים' : 'Active', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        { icon: Star, value: s.avg || 0, label: isHe ? 'דירוג' : 'Rating', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        { icon: DollarSign, value: '—', label: isHe ? 'הכנסות' : 'Revenue', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { icon: TrendingUp, value: s.count || 0, label: isHe ? 'ביקורות' : 'Reviews', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
      ];
    case 'freelancer':
      return [
        { icon: Briefcase, value: 0, label: isHe ? 'פרויקטים' : 'Projects', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { icon: Star, value: '—', label: isHe ? 'דירוג' : 'Rating', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        { icon: DollarSign, value: '—', label: isHe ? 'הכנסות' : 'Revenue', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
        { icon: TrendingUp, value: 0, label: isHe ? 'הזדמנויות' : 'Gigs', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
      ];
    case 'creator':
      return [
        { icon: BookOpen, value: 0, label: isHe ? 'קורסים' : 'Courses', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
        { icon: Star, value: '—', label: isHe ? 'דירוג' : 'Rating', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        { icon: DollarSign, value: '—', label: isHe ? 'הכנסות' : 'Revenue', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { icon: Video, value: 0, label: isHe ? 'תכנים' : 'Content', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
      ];
    case 'business':
      return [
        { icon: Users, value: 0, label: isHe ? 'לקוחות' : 'Clients', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        { icon: Star, value: '—', label: isHe ? 'דירוג' : 'Rating', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        { icon: DollarSign, value: '—', label: isHe ? 'הכנסות' : 'Revenue', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { icon: TrendingUp, value: 0, label: isHe ? 'צמיחה' : 'Growth', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
      ];
  }
}

export default function CareerHub({ careerPath }: CareerHubProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: application, isLoading: appLoading } = useCareerApplication(careerPath);

  // Gate: if no approved application, show wizard
  if (!appLoading && (!application || application.status !== 'approved')) {
    if (application?.status === 'pending') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
          <h2 className="text-xl font-black text-foreground">{isHe ? 'הבקשה שלך בבדיקה' : 'Application Under Review'}</h2>
          <p className="text-muted-foreground max-w-sm">
            {isHe ? 'נעדכן אותך ברגע שהבקשה תאושר. תודה על הסבלנות!' : 'We\'ll notify you once approved. Thank you for your patience!'}
          </p>
          <Button variant="outline" onClick={() => navigate('/fm/work')}>{isHe ? 'חזור' : 'Go Back'}</Button>
        </div>
      );
    }
    if (application?.status === 'rejected') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-black text-foreground">{isHe ? 'הבקשה נדחתה' : 'Application Rejected'}</h2>
          <p className="text-muted-foreground max-w-sm">{application.admin_notes || (isHe ? 'ניתן לפנות לתמיכה.' : 'Please contact support.')}</p>
          <Button variant="outline" onClick={() => navigate('/fm/work')}>{isHe ? 'חזור' : 'Go Back'}</Button>
        </div>
      );
    }
    // No application or revision_requested → show wizard
    return <CareerWizard careerPath={careerPath} />;
  }

  if (appLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  // Coach-specific hooks (only used for coach/therapist paths)
  const isCoachType = careerPath === 'coach' || careerPath === 'therapist';
  const { data: myProfile } = useMyCoachProfile();
  const { stats } = useCoachClientStats();
  const { data: reviewStats } = useCoachReviewStats(myProfile?.id);
  const { data: fallbackSlug } = useFirstCoachSlug(!myProfile?.slug);
  const storeSlug = myProfile?.slug || fallbackSlug;
  const { data: profilePractitioner } = useCoach(profileOpen ? storeSlug : undefined);

  const theme = THEME[careerPath];
  const tabs = TABS_BY_PATH[careerPath];
  const Icon = theme.icon;
  const coachStats = isCoachType ? { active: stats?.active || 0, avg: reviewStats?.avg || 0, count: reviewStats?.count || 0 } : undefined;
  const statCards = getStatCards(careerPath, isHe, coachStats);

  const displayName = isCoachType && myProfile?.display_name
    ? myProfile.display_name
    : profile?.community_username || '';

  const avatarUrl = isCoachType ? myProfile?.avatar_url : undefined;

  const renderTabContent = () => {
    // Coach/Therapist tabs — reuse coach components (therapist uses same data model)
    if (isCoachType) {
      switch (activeTab) {
        case 'clients': return <CoachClientsTab />;
        case 'leads': return <CoachLeadsTab />;
        case 'products': return <CoachProductsTab />;
        case 'content': return <CoachContentTab />;
        case 'plans': return <CoachPlansTab />;
        case 'marketing': return <CoachMarketingTab />;
        case 'analytics': return <CoachAnalyticsTab />;
        case 'landing-pages': return <CoachLandingPagesTab />;
        case 'settings': return <CoachSettingsTab />;
        default: return <CoachDashboardOverview />;
      }
    }

    // Freelancer tabs
    if (careerPath === 'freelancer') {
      switch (activeTab) {
        case 'gigs': return <FreelancerGigsTab />;
        case 'projects': return <FreelancerProjectsTab />;
        case 'portfolio': return <FreelancerPortfolioTab />;
        case 'earnings': return <FreelancerEarningsTab />;
        case 'settings': return <FreelancerSettingsTab />;
        // Shared tabs from coach
        case 'clients': return <CoachClientsTab />;
        case 'products': return <CoachProductsTab />;
        case 'content': return <CoachContentTab />;
        case 'marketing': return <CoachMarketingTab />;
        case 'analytics': return <CoachAnalyticsTab />;
        default: return <FreelancerDashboardTab />;
      }
    }

    // Creator tabs
    if (careerPath === 'creator') {
      switch (activeTab) {
        case 'courses': return <CreatorCoursesTab />;
        case 'products': return <CreatorProductsTab />;
        case 'content': return <CreatorContentTab />;
        case 'analytics': return <CreatorAnalyticsTab />;
        case 'settings': return <CreatorSettingsTab />;
        // Shared tabs from coach
        case 'clients': return <CoachClientsTab />;
        case 'marketing': return <CoachMarketingTab />;
        case 'landing-pages': return <CoachLandingPagesTab />;
        default: return <CreatorDashboardTab />;
      }
    }

    // Business tabs — reuse coach infrastructure
    switch (activeTab) {
      case 'clients': return <CoachClientsTab />;
      case 'leads': return <CoachLeadsTab />;
      case 'products': return <CoachProductsTab />;
      case 'content': return <CoachContentTab />;
      case 'marketing': return <CoachMarketingTab />;
      case 'analytics': return <CoachAnalyticsTab />;
      case 'landing-pages': return <CoachLandingPagesTab />;
      case 'settings': return <CoachSettingsTab />;
      default: return <CoachDashboardOverview />;
    }
  };

  return (
    <PageShell>
      <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full pb-24">
        {/* ── Back + Profile Header ── */}
        <div className={cn("rounded-2xl bg-gradient-to-br border p-5", theme.headerGradient, theme.headerBorder)}>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/fm')}
              className="shrink-0 -ms-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Avatar className={cn("w-12 h-12 border-2", theme.avatarBorder)}>
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback className={cn(theme.avatarBg, theme.avatarText)}>
                <Icon className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className={cn("text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent truncate", theme.gradientText)}>
                {isHe ? `שלום${displayName ? `, ${displayName}` : ''}` : `Welcome${displayName ? `, ${displayName}` : ''}`}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isHe ? theme.titleHe : theme.titleEn}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Badge variant="outline" className={cn("text-[10px]", theme.badgeBg, theme.badgeText, theme.badgeBorder)}>
                <Icon className="h-2.5 w-2.5 me-0.5" />
                {isHe ? theme.badgeLabelHe : theme.badgeLabelEn}
              </Badge>
              {isCoachType && storeSlug && (
                <button
                  onClick={() => setProfileOpen(true)}
                  className={cn("p-2 rounded-xl border transition-colors", theme.avatarBg, theme.headerBorder, `hover:${theme.activeTabBg}`)}
                  title={isHe ? 'צפה בפרופיל' : 'View Profile'}
                >
                  <User className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-4 gap-2">
          {statCards.map((s) => (
            <div key={s.label} className={cn("rounded-xl border p-3 flex flex-col items-center gap-1", s.bg)}>
              <s.icon className={cn("w-4 h-4", s.color)} />
              <span className="text-lg font-bold">{s.value}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Tab Navigation (scrollable pills) ── */}
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
          <div className="flex gap-1.5 min-w-max">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border whitespace-nowrap",
                  activeTab === item.id
                    ? cn(theme.activeTabBg, theme.activeTabBorder, theme.activeTabText, "shadow-sm")
                    : "bg-card/60 border-border/30 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {isHe ? item.labelHe : item.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="min-h-[40vh]">
          {renderTabContent()}
        </div>
      </div>

      {/* Profile Preview Modal (coach/therapist only) */}
      {isCoachType && (
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            {profilePractitioner && (
              <div dir={isHe ? 'rtl' : 'ltr'}>
                <PractitionerProfileHeader practitioner={profilePractitioner} postsCount={0} />
                <PractitionerFeedTabs practitioner={profilePractitioner} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </PageShell>
  );
}
