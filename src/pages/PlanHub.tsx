/**
 * PlanHub — Unified Play page with 2 tabs: Tactics & Work.
 * Strategy is accessed via a modal button below the tabs.
 */
import { useState, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Flame, Swords, Briefcase, MessageSquare, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const LifeHub = lazy(() => import('./LifeHub'));
const ArenaHub = lazy(() => import('./ArenaHub'));
const WorkHub = lazy(() => import('./WorkHub'));

type PlanTab = 'tactics' | 'work';

export default function PlanHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [activeTab, setActiveTab] = useState<PlanTab>('tactics');
  const [chatOpen, setChatOpen] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const auroraChat = useAuroraChatContextSafe();

  const tabs: { id: PlanTab; labelHe: string; labelEn: string; icon: typeof Flame }[] = [
    { id: 'tactics', labelHe: 'טקטיקה', labelEn: 'Tactics', icon: Swords },
    { id: 'work', labelHe: 'עבודה', labelEn: 'Work', icon: Briefcase },
  ];

  const openFindCoachWizard = () => {
    if (!user) { navigate('/auth'); return; }
    if (!auroraChat) return;
    auroraChat.setActivePillar('coach-find');
    auroraChat.setIsDockVisible(true);
    auroraChat.setIsChatExpanded(true);
    auroraChat.setPendingAssistantGreeting(
      isHe
        ? '👋 שלום! אני Aurora, ואני אעזור לך למצוא את המאמן המושלם בשבילך.\n\n**ספר/י לי — מה הדבר שהכי רוצה לשפר בחיים שלך עכשיו?**\n\nזה יכול להיות:\n- 🧠 בריאות נפשית ומיינדסט\n- 💪 כושר ותזונה\n- 💼 קריירה ועסקים\n- ❤️ זוגיות ומערכות יחסים\n- 🎯 מטרות ומוטיבציה\n\nככל שתהיה ספציפי יותר, כך אמצא לך התאמה טובה יותר.'
        : "👋 Hey! I'm Aurora, and I'll help you find your perfect coach.\n\n**Tell me — what's the one thing you'd most like to improve in your life right now?**\n\nIt could be:\n- 🧠 Mental health & mindset\n- 💪 Fitness & nutrition\n- 💼 Career & business\n- ❤️ Relationships\n- 🎯 Goals & motivation\n\nThe more specific you are, the better match I'll find for you."
    );
  };

  return (
    <div className="flex flex-col w-full items-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Tab switcher */}
      <div className="w-full max-w-xl px-4 pt-3 pb-1">
        <div className="flex gap-1 p-1 rounded-2xl bg-muted/60 border border-border/50">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                  isActive
                    ? "text-primary-foreground"
                    : "text-foreground/90 hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="plan-tab-bg"
                    className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/50 ring-2 ring-primary/70"
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

      {/* Strategy modal button + contextual actions */}
      <div className="w-full max-w-xl px-4 pb-2 space-y-2">
        <button
          onClick={() => setStrategyOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all text-sm font-medium text-amber-400"
        >
          <Flame className="w-4 h-4" />
          {isHe ? '🔥 אסטרטגיה — תוכנית 100 יום' : '🔥 Strategy — 100-Day Plan'}
        </button>

        {activeTab === 'tactics' && (
          <>
            <button
              onClick={() => setChatOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-sm font-medium text-primary"
            >
              <MessageSquare className="w-4 h-4" />
              {isHe ? 'דבר עם התוכנית שלך' : 'Talk to Your Plan'}
            </button>
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={openFindCoachWizard}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-sm font-medium text-primary"
            >
              <Search className="w-4 h-4" />
              {isHe ? '🎯 מצא מאמן' : '🎯 Find a Coach'}
            </motion.button>
          </>
        )}
      </div>

      {/* Tab content */}
      <Suspense fallback={null}>
        {activeTab === 'tactics' && <ArenaHub />}
        {activeTab === 'work' && <WorkHub />}
      </Suspense>

      {/* Strategy Modal — full LifeHub inside */}
      <Dialog open={strategyOpen} onOpenChange={setStrategyOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0" preventClose>
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              {isHe ? 'אסטרטגיה' : 'Strategy'}
            </h2>
            <button
              onClick={() => setStrategyOpen(false)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50"
            >
              {isHe ? 'סגור' : 'Close'}
            </button>
          </div>
          <Suspense fallback={null}>
            {strategyOpen && <LifeHub />}
          </Suspense>
        </DialogContent>
      </Dialog>

      <PlanChatWizard open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
