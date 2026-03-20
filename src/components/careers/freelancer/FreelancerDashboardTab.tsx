import { useTranslation } from '@/hooks/useTranslation';
import { Sparkles, Search, FolderKanban } from 'lucide-react';

export default function FreelancerDashboardTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const quickActions = [
    {
      icon: Search,
      label: isHe ? 'חפש הזדמנויות' : 'Find Gigs',
      desc: isHe ? 'גלה עבודות חדשות שמתאימות לכישורים שלך' : 'Discover new jobs matching your skills',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      icon: FolderKanban,
      label: isHe ? 'פרויקטים פעילים' : 'Active Projects',
      desc: isHe ? '0 פרויקטים' : '0 projects',
      color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30',
      iconColor: 'text-sky-400',
    },
    {
      icon: Sparkles,
      label: isHe ? 'שפר פרופיל' : 'Enhance Profile',
      desc: isHe ? 'הוסף כישורים ותיק עבודות' : 'Add skills & portfolio items',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {isHe ? 'פעולות מהירות' : 'Quick Actions'}
        </h3>
        <div className="grid gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={`w-full text-start rounded-xl bg-gradient-to-r ${action.color} border p-4 flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]`}
            >
              <div className="w-10 h-10 rounded-lg bg-card/50 flex items-center justify-center flex-shrink-0">
                <action.icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
