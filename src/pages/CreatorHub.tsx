/**
 * CreatorHub — Full command center for content creators.
 * Mirrors CoachHub with creator-specific tabs.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, Package, FileText, BarChart3,
  Settings, Star, DollarSign, Palette, Video
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useProfile } from '@/hooks/useProfile';
import CreatorDashboardTab from '@/components/careers/creator/CreatorDashboardTab';
import CreatorCoursesTab from '@/components/careers/creator/CreatorCoursesTab';
import CreatorProductsTab from '@/components/careers/creator/CreatorProductsTab';
import CreatorContentTab from '@/components/careers/creator/CreatorContentTab';
import CreatorAnalyticsTab from '@/components/careers/creator/CreatorAnalyticsTab';
import CreatorSettingsTab from '@/components/careers/creator/CreatorSettingsTab';

export default function CreatorHub() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: isHe ? 'סקירה' : 'Overview' },
    { id: 'courses', icon: BookOpen, label: isHe ? 'קורסים' : 'Courses' },
    { id: 'products', icon: Package, label: isHe ? 'מוצרים' : 'Products' },
    { id: 'content', icon: FileText, label: isHe ? 'תוכן' : 'Content' },
    { id: 'analytics', icon: BarChart3, label: isHe ? 'אנליטיקס' : 'Analytics' },
    { id: 'settings', icon: Settings, label: isHe ? 'הגדרות' : 'Settings' },
  ];

  const statCards = [
    { icon: BookOpen, value: 0, label: isHe ? 'קורסים' : 'Courses', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    { icon: Star, value: '—', label: isHe ? 'דירוג' : 'Rating', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: DollarSign, value: '—', label: isHe ? 'הכנסות' : 'Revenue', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: Video, value: 0, label: isHe ? 'תכנים' : 'Content', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses': return <CreatorCoursesTab />;
      case 'products': return <CreatorProductsTab />;
      case 'content': return <CreatorContentTab />;
      case 'analytics': return <CreatorAnalyticsTab />;
      case 'settings': return <CreatorSettingsTab />;
      default: return <CreatorDashboardTab />;
    }
  };

  return (
    <PageShell>
      <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full pb-24">
        {/* ── Creator Profile Header ── */}
        <div className="rounded-2xl bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-sky-500/5 border border-sky-500/20 p-5">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-sky-500/30">
              <AvatarFallback className="bg-sky-500/20 text-sky-400">
                <Palette className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent truncate">
                {isHe ? `שלום${profile?.community_username ? `, ${profile.community_username}` : ''}` : `Welcome${profile?.community_username ? `, ${profile.community_username}` : ''}`}
              </h1>
              <p className="text-xs text-muted-foreground">{isHe ? 'סטודיו היוצר שלך' : 'Creator Studio'}</p>
            </div>
            <Badge variant="outline" className="text-[10px] bg-sky-500/15 text-sky-400 border-sky-500/30">
              <Palette className="h-2.5 w-2.5 me-0.5" /> {isHe ? 'יוצר' : 'Creator'}
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
                    ? "bg-sky-500/15 border-sky-500/30 text-sky-400 shadow-sm"
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
