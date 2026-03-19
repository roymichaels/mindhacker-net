/**
 * PlayHub — Unified Play page with 2-tab layout:
 * Tab 1 (default): Text overview — motivating, non-demanding, shows strategy & all tasks
 * Tab 2: Mission Control — interactive with 10-day roadmap, media player, task execution
 */
import { useState, useMemo, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Flame, Briefcase, MessageSquare, Search, MapPin, Trophy, Target, Clock, Zap, Star, BookOpen, Gamepad2, Brain, X } from 'lucide-react';
import { IPhoneWidget } from '@/components/ui/IPhoneWidget';
import { motion } from 'framer-motion';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useWeeklyTacticalPlan } from '@/hooks/useWeeklyTacticalPlan';
import { useTodayExecution } from '@/hooks/useTodayExecution';
import { getCurrentDayInIsrael } from '@/utils/currentDay';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';

import { TodayOverviewTab } from '@/components/play/TodayOverviewTab';
import { MissionControlTab } from '@/components/play/MissionControlTab';

const LifeHub = lazy(() => import('./LifeHub'));
const WorkHub = lazy(() => import('./WorkHub'));

export default function PlayHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [activeTab, setActiveTab] = useState<'overview' | 'control'>('overview');
  const [chatOpen, setChatOpen] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const auroraChat = useAuroraChatContextSafe();
  const { openHypnosis } = useAuroraActions();

  const { plan } = useLifePlanWithMilestones();

  const openFindCoachWizard = () => {
      <div className="w-full max-w-xl px-4 pt-3 pb-2">
        <div className="flex rounded-xl bg-muted/30 border border-border/30 p-1 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="w-full max-w-xl px-4 pb-6">
        {activeTab === 'overview' ? <TodayOverviewTab /> : <MissionControlTab />}
      </div>

      {/* Strategy Modal */}
      <Dialog open={strategyOpen} onOpenChange={setStrategyOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0" preventClose>
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />{isHe ? 'אסטרטגיה' : 'Strategy'}
            </h2>
            <button onClick={() => setStrategyOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <Suspense fallback={null}>{strategyOpen && <LifeHub />}</Suspense>
        </DialogContent>
      </Dialog>

      {/* Work Hub Modal */}
      <Dialog open={workOpen} onOpenChange={setWorkOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0" preventClose>
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-500" />{isHe ? 'מרכז העבודה' : 'Work Hub'}
            </h2>
            <button onClick={() => setWorkOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <Suspense fallback={null}>{workOpen && <WorkHub />}</Suspense>
        </DialogContent>
      </Dialog>

      <PlanChatWizard open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
