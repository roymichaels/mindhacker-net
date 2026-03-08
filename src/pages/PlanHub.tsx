/**
 * PlanHub — Unified Plan page (מסלול) with 3 tabs: Strategy, Now & Tactics.
 */
import { useState, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Flame, Swords, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const LifeHub = lazy(() => import('./LifeHub'));
const ArenaHub = lazy(() => import('./ArenaHub'));
const UserDashboard = lazy(() => import('./UserDashboard'));

type PlanTab = 'strategy' | 'now' | 'tactics';

export default function PlanHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [activeTab, setActiveTab] = useState<PlanTab>('now');

  const tabs: { id: PlanTab; labelHe: string; labelEn: string; icon: typeof Flame }[] = [
    { id: 'strategy', labelHe: 'אסטרטגיה', labelEn: 'Strategy', icon: Flame },
    { id: 'now', labelHe: 'עכשיו', labelEn: 'Now', icon: Zap },
    { id: 'tactics', labelHe: 'טקטיקה', labelEn: 'Tactics', icon: Swords },
  ];

  return (
    <div className="flex flex-col w-full items-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Tab switcher */}
      <div className="w-full max-w-xl px-4 pt-3 pb-1">
        <div className="flex gap-1 p-1 rounded-2xl bg-muted/30 border border-border/30">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground/70"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="plan-tab-bg"
                    className="absolute inset-0 rounded-xl bg-primary shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {isHe ? tab.labelHe : tab.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <Suspense fallback={null}>
        {activeTab === 'strategy' && <LifeHub />}
        {activeTab === 'now' && <UserDashboard />}
        {activeTab === 'tactics' && <ArenaHub />}
      </Suspense>
    </div>
  );
}
