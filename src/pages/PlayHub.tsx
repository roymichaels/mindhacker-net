/**
 * PlayHub — Unified Play page with 2-tab layout:
 * Tab 1 (default): Text overview — motivating, non-demanding, shows strategy & all tasks
 * Tab 2: Mission Control — interactive with 10-day roadmap, media player, task execution
 */
import { useState, lazy, Suspense } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Flame, Briefcase, MessageSquare, Search, Gamepad2, Brain, X } from 'lucide-react';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAIONDisplayName } from '@/hooks/useAIONDisplayName';

import { TodayOverviewTab } from '@/components/play/TodayOverviewTab';
import { MissionControlTab } from '@/components/play/MissionControlTab';

const LifeHub = lazy(() => import('./LifeHub'));
const WorkHub = lazy(() => import('./WorkHub'));

function PlayHubImpl() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [missionOpen, setMissionOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const aionName = useAIONDisplayName();
  const auroraChat = useAuroraChatContextSafe();
  const { openHypnosis } = useAuroraActions();

  const openFindCoachWizard = () => {
    if (!user) { navigate('/auth'); return; }
    if (!auroraChat) return;
    auroraChat.setActivePillar('coach-find');
    auroraChat.setIsDockVisible(true);
    auroraChat.setIsChatExpanded(true);
    auroraChat.setPendingAssistantGreeting(
      isHe
        ? `👋 שלום! אני ${aionName}, ואני אעזור לך למצוא את המאמן המושלם בשבילך.\n\n**ספר/י לי מה הדבר שהכי היית רוצה לשפר בחיים שלך עכשיו?**`
        : `👋 Hey! I'm ${aionName}, and I'll help you find your perfect coach.\n\n**Tell me what you'd most like to improve in your life right now.**`
    );
  };

  const moreItems: Array<{ key: string; icon: any; label: string; onClick: () => void }> = [
    { key: 'mission', icon: Gamepad2, label: isHe ? 'בקרת משימות' : 'Mission Control', onClick: () => { setMoreOpen(false); setMissionOpen(true); } },
    { key: 'strategy', icon: Flame, label: isHe ? 'אסטרטגיה' : 'Strategy', onClick: () => { setMoreOpen(false); setStrategyOpen(true); } },
    { key: 'work', icon: Briefcase, label: isHe ? 'עבודה' : 'Work', onClick: () => { setMoreOpen(false); setWorkOpen(true); } },
    { key: 'chat', icon: MessageSquare, label: isHe ? 'תכנון בשיחה' : 'Plan in chat', onClick: () => { setMoreOpen(false); setChatOpen(true); } },
    { key: 'coach', icon: Search, label: isHe ? 'מצא מאמן' : 'Find a coach', onClick: () => { setMoreOpen(false); openFindCoachWizard(); } },
    { key: 'hypnosis', icon: Brain, label: isHe ? 'היפנוזה' : 'Hypnosis', onClick: () => { setMoreOpen(false); openHypnosis(); } },
  ];

  return (
    <div className="flex flex-col w-full items-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Ambient header — calm, single focus */}
      <div className="w-full max-w-xl px-6 pt-6 pb-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-foreground/40">
          {isHe ? 'המסע של היום' : "Today's path"}
        </p>
        <h1 className="mt-2 aion-text-hero text-[22px] font-light tracking-[0.18em]">
          {isHe ? 'נשמו. המשיכו.' : 'Breathe. Continue.'}
        </h1>
      </div>

      {/* Single-focus mission environment */}
      <div className="w-full max-w-xl px-4 pb-28">
        <TodayOverviewTab />
      </div>

      {/* Floating "more" — emerges contextually, no tab strip */}
      <button
        onClick={() => setMoreOpen(true)}
        aria-label={isHe ? 'עוד' : 'More'}
        className="fixed bottom-24 right-4 z-30 px-4 h-10 inline-flex items-center gap-2 rounded-full atmo-surface-soft text-foreground/70 hover:text-foreground transition text-[11px] uppercase tracking-[0.22em]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--aion-cyan))] animate-aion-breath" />
        {isHe ? 'מצבים' : 'Modes'}
      </button>

      {/* Modes drawer */}
      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="max-w-md w-[92vw] p-0 gap-0 atmo-surface border-0">
          <div className="px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.32em] text-foreground/40 mb-4 text-center">
              {isHe ? 'מצבים' : 'Modes'}
            </p>
            <div className="flex flex-col gap-1">
              {moreItems.map(item => (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  className="flex items-center gap-4 px-3 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-white/[0.03] transition text-left"
                >
                  <item.icon className="w-4 h-4 text-foreground/60" />
                  <span className="text-sm tracking-wide">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mission Control modal — summoned, not a tab */}
      <Dialog open={missionOpen} onOpenChange={setMissionOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 atmo-surface border-0">
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4">
            <h2 className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 flex items-center gap-2">
              <Gamepad2 className="w-3.5 h-3.5" />{isHe ? 'בקרת משימות' : 'Mission Control'}
            </h2>
            <button onClick={() => setMissionOpen(false)} className="p-1.5 rounded-full text-foreground/50 hover:text-foreground transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="atmo-divider mx-6" />
          <div className="p-4">
            <MissionControlTab />
          </div>
        </DialogContent>
      </Dialog>

      {/* Strategy Modal */}
      <Dialog open={strategyOpen} onOpenChange={setStrategyOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 atmo-surface border-0" preventClose>
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4">
            <h2 className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 flex items-center gap-2">
              <Flame className="w-3.5 h-3.5" />{isHe ? 'אסטרטגיה' : 'Strategy'}
            </h2>
            <button onClick={() => setStrategyOpen(false)} className="p-1.5 rounded-full text-foreground/50 hover:text-foreground transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="atmo-divider mx-6" />
          <Suspense fallback={null}>{strategyOpen && <LifeHub />}</Suspense>
        </DialogContent>
      </Dialog>

      {/* Work Hub Modal */}
      <Dialog open={workOpen} onOpenChange={setWorkOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 atmo-surface border-0" preventClose>
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4">
            <h2 className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" />{isHe ? 'מרכז העבודה' : 'Work Hub'}
            </h2>
            <button onClick={() => setWorkOpen(false)} className="p-1.5 rounded-full text-foreground/50 hover:text-foreground transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="atmo-divider mx-6" />
          <Suspense fallback={null}>{workOpen && <WorkHub />}</Suspense>
        </DialogContent>
      </Dialog>

      <PlanChatWizard open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}

// Phase C — quarantined legacy surface
import { withDeprecationLog } from '@/shellv2/LegacyMountGuard';
export default withDeprecationLog('PlayHub', PlayHubImpl);
