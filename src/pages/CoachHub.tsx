/**
 * CoachHub - Sidebar-less coach command center.
 * Tab navigation, client list, and stats are all inline.
 */
import { useState, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useMyCoachProfile, useCoachReviewStats, useFirstCoachSlug, useCoach } from '@/domain/coaches';
import { useCoachClientStats, useCoachClients, useAddCoachClient, PractitionerClient } from '@/hooks/useCoachClients';
import { useCoachActivityFeed } from '@/domain/coaches';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Users, Star, DollarSign, FileText, Megaphone,
  Settings, ExternalLink, Briefcase, User, Search, UserPlus, Brain,
  Loader2, ChevronLeft, MessageSquare, Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { PractitionerProfileHeader, PractitionerFeedTabs } from '@/components/practitioner-landing';

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

export default function CoachHub() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileOpen, setProfileOpen] = useState(false);

  // Profile & stats
  const { data: myProfile } = useMyCoachProfile();
  const { stats } = useCoachClientStats();
  const { data: reviewStats } = useCoachReviewStats(myProfile?.id);
  const { data: fallbackSlug } = useFirstCoachSlug(!myProfile?.slug);
  const storeSlug = myProfile?.slug || fallbackSlug;

  // Profile preview
  const { data: profilePractitioner } = useCoach(profileOpen ? storeSlug : undefined);
  const { data: profilePostsCount = 0 } = useQuery({
    queryKey: ['practitioner-posts-count', profilePractitioner?.user_id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('community_posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profilePractitioner!.user_id);
      return error ? 0 : (count || 0);
    },
    enabled: !!profilePractitioner?.user_id,
  });

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: isHe ? 'סקירה' : 'Overview' },
    { id: 'clients', icon: Users, label: isHe ? 'מתאמנים' : 'Clients' },
    { id: 'leads', icon: Star, label: isHe ? 'לידים' : 'Leads' },
    { id: 'products', icon: DollarSign, label: isHe ? 'מוצרים' : 'Products' },
    { id: 'content', icon: FileText, label: isHe ? 'תוכן' : 'Content' },
    { id: 'plans', icon: FileText, label: isHe ? 'תוכניות' : 'Plans' },
    { id: 'marketing', icon: Megaphone, label: isHe ? 'שיווק' : 'Marketing' },
    { id: 'analytics', icon: ExternalLink, label: isHe ? 'אנליטיקס' : 'Analytics' },
    { id: 'landing-pages', icon: FileText, label: isHe ? 'דפי נחיתה' : 'Landing Pages' },
    { id: 'settings', icon: Settings, label: isHe ? 'הגדרות' : 'Settings' },
  ];

  const statCards = [
    { icon: Users, value: stats.active, label: isHe ? 'פעילים' : 'Active', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: Star, value: reviewStats?.avg || 0, label: isHe ? 'דירוג' : 'Rating', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: DollarSign, value: '—', label: isHe ? 'הכנסות' : 'Revenue', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: MessageSquare, value: reviewStats?.count || 0, label: isHe ? 'ביקורות' : 'Reviews', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  ];

  const handleProfileClick = () => {
    if (storeSlug) setProfileOpen(true);
    else toast.error(isHe ? 'אין פרופיל זמין' : 'No profile available');
  };

  const renderTabContent = () => {
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
  };

  return (
    <PageShell>
      <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full pb-24">
        {/* ── Coach Profile Header ── */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-purple-500/5 border border-purple-500/20 p-5">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-purple-500/30">
              <AvatarImage src={myProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-purple-500/20 text-purple-400">
                <Briefcase className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent truncate">
                {isHe ? `שלום${myProfile?.display_name ? `, ${myProfile.display_name}` : ''}` : `Welcome${myProfile?.display_name ? `, ${myProfile.display_name}` : ''}`}
              </h1>
              <p className="text-xs text-muted-foreground">{isHe ? 'מרכז הפיקוד שלך' : 'Coach Command Center'}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Badge variant="outline" className="text-[10px] bg-purple-500/15 text-purple-400 border-purple-500/30">
                <Briefcase className="h-2.5 w-2.5 me-0.5" /> Coach Pro
              </Badge>
              <button
                onClick={handleProfileClick}
                className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-purple-400"
                title={isHe ? 'צפה בפרופיל' : 'View Profile'}
              >
                <User className="w-4 h-4" />
              </button>
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
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border whitespace-nowrap",
                  activeTab === item.id
                    ? "bg-purple-500/15 border-purple-500/30 text-purple-400 shadow-sm"
                    : "bg-card/60 border-border/30 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="min-h-[40vh]">
          {renderTabContent()}
        </div>
      </div>

      {/* Profile Preview Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {profilePractitioner && (
            <div dir={isHe ? 'rtl' : 'ltr'}>
              <PractitionerProfileHeader practitioner={profilePractitioner} postsCount={profilePostsCount} />
              <PractitionerFeedTabs practitioner={profilePractitioner} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
