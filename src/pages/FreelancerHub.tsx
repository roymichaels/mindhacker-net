/**
 * FreelancerHub — Full command center for freelancers.
 * Mirrors CoachHub with freelancer-specific tabs.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Briefcase, FolderKanban, Image, DollarSign,
  Settings, Star, TrendingUp, Search, FileText
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useProfile } from '@/hooks/useProfile';
import FreelancerDashboardTab from '@/components/careers/freelancer/FreelancerDashboardTab';
import FreelancerGigsTab from '@/components/careers/freelancer/FreelancerGigsTab';
import FreelancerProjectsTab from '@/components/careers/freelancer/FreelancerProjectsTab';
import FreelancerPortfolioTab from '@/components/careers/freelancer/FreelancerPortfolioTab';
import FreelancerEarningsTab from '@/components/careers/freelancer/FreelancerEarningsTab';
import FreelancerSettingsTab from '@/components/careers/freelancer/FreelancerSettingsTab';

export default function FreelancerHub() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: isHe ? 'סקירה' : 'Overview' },
    { id: 'gigs', icon: Search, label: isHe ? 'הזדמנויות' : 'Gigs' },
    { id: 'projects', icon: FolderKanban, label: isHe ? 'פרויקטים' : 'Projects' },
    { id: 'portfolio', icon: Image, label: isHe ? 'תיק עבודות' : 'Portfolio' },
    { id: 'earnings', icon: DollarSign, label: isHe ? 'הכנסות' : 'Earnings' },
    { id: 'settings', icon: Settings, label: isHe ? 'הגדרות' : 'Settings' },
  ];

  const statCards = [
    { icon: Briefcase, value: 0, label: isHe ? 'פרויקטים' : 'Projects', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: Star, value: '—', label: isHe ? 'דירוג' : 'Rating', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: DollarSign, value: '—', label: isHe ? 'הכנסות' : 'Revenue', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    { icon: TrendingUp, value: 0, label: isHe ? 'הזדמנויות' : 'Gigs', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'gigs': return <FreelancerGigsTab />;
      case 'projects': return <FreelancerProjectsTab />;
      case 'portfolio': return <FreelancerPortfolioTab />;
      case 'earnings': return <FreelancerEarningsTab />;
      case 'settings': return <FreelancerSettingsTab />;
      default: return <FreelancerDashboardTab />;
    }
  };

  return (
    <PageShell>
      <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full pb-24">
        {/* ── Freelancer Profile Header ── */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/20 p-5">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-emerald-500/30">
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400">
                <Briefcase className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent truncate">
                {isHe ? `שלום${profile?.community_username ? `, ${profile.community_username}` : ''}` : `Welcome${profile?.community_username ? `, ${profile.community_username}` : ''}`}
              </h1>
              <p className="text-xs text-muted-foreground">{isHe ? 'מרכז הפרילנסר שלך' : 'Freelancer Command Center'}</p>
            </div>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              <Briefcase className="h-2.5 w-2.5 me-0.5" /> {isHe ? 'פרילנסר' : 'Freelancer'}
            </Badge>
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

        {/* ── Tab Navigation ── */}
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
          <div className="flex gap-1.5 min-w-max">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border whitespace-nowrap",
                  activeTab === item.id
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm"
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
    </PageShell>
  );
}
