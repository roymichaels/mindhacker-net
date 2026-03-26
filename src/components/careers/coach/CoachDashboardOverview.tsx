/**
 * CoachDashboardOverview - Quick actions & tips panel (no sidebar references).
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCoachClientStats } from '@/hooks/coaches';
import { useMyCoachProfile, useCoachReviewStats, useCoachUpcomingBookings, useCoachPlansCount } from '@/domain/coaches';
import { Sparkles, DollarSign, FileText } from 'lucide-react';
import AutoPlanEngineModal from './AutoPlanEngineModal';

const CoachDashboardOverview = () => {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: myProfile } = useMyCoachProfile();
  const [showPlanEngine, setShowPlanEngine] = useState(false);

  const { data: plansCount } = useCoachPlansCount(myProfile?.id);

  const quickActions = [
    {
      icon: Sparkles,
      label: isHe ? 'צור תוכנית AI' : 'Generate AI Plan',
      desc: isHe ? 'תוכנית מותאמת שהופכת למשימות' : 'Custom plan that becomes playable tasks',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
      iconColor: 'text-purple-400',
      onClick: () => setShowPlanEngine(true),
    },
    {
      icon: FileText,
      label: isHe ? 'תוכניות פעילות' : 'Active Plans',
      desc: isHe ? `${plansCount || 0} תוכניות` : `${plansCount || 0} plans`,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      onClick: () => {},
    },
    {
      icon: DollarSign,
      label: isHe ? 'הכנסות' : 'Revenue',
      desc: isHe ? 'בקרוב' : 'Coming soon',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      iconColor: 'text-amber-400',
      onClick: () => {},
    },
  ];

  return (
    <div className="space-y-5">
      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {isHe ? 'פעולות מהירות' : 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`rounded-xl border bg-gradient-to-br ${action.color} p-4 text-start hover:scale-[1.02] transition-transform`}
            >
              <action.icon className={`w-6 h-6 ${action.iconColor} mb-2`} />
              <div className="font-medium text-sm">{action.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {isHe ? 'מה אפשר לעשות?' : 'Quick Start'}
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>{isHe ? 'נווטו בין הלשוניות למעלה כדי לגשת לכל הכלים' : 'Use the tabs above to access all your tools'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>{isHe ? 'צרו תוכנית AI שהופכת למשימות אוטומטיות' : 'Generate an AI plan that auto-converts to playable tasks'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>{isHe ? 'לחצו על "מתאמנים" כדי לנהל את הלקוחות שלכם' : 'Click "Clients" to manage your client roster'}</span>
          </li>
        </ul>
      </div>

      <AutoPlanEngineModal open={showPlanEngine} onOpenChange={setShowPlanEngine} />
    </div>
  );
};

export default CoachDashboardOverview;
