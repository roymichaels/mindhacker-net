/**
 * PlanHub — Unified Play page: Tactics view with Strategy & Work as modals.
 */
import { useState, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Flame, Swords, Briefcase, MessageSquare, Search, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const LifeHub = lazy(() => import('./LifeHub'));
const ArenaHub = lazy(() => import('./ArenaHub'));
const WorkHub = lazy(() => import('./WorkHub'));

export default function PlanHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [chatOpen, setChatOpen] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const auroraChat = useAuroraChatContextSafe();

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
      {/* Strategy & Work modal cards — community style */}
      <div className="w-full max-w-xl px-4 pt-3 pb-1">
        <div className="grid grid-cols-2 gap-3">
          {/* Strategy Card */}
          <button
            onClick={() => setStrategyOpen(true)}
            className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-orange-500/[0.03] p-4 text-start transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 active:scale-[0.99]"
          >
            <div className="absolute top-0 end-0 w-20 h-20 rounded-full bg-amber-400/10 blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">
                  {isHe ? 'אסטרטגיה' : 'Strategy'}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                  {isHe ? 'תוכנית 100 יום' : '100-Day Plan'}
                </p>
              </div>
            </div>
          </button>

          {/* Work Hub Card */}
          <button
            onClick={() => setWorkOpen(true)}
            className="group relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.03] p-4 text-start transition-all hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 active:scale-[0.99]"
          >
            <div className="absolute top-0 end-0 w-20 h-20 rounded-full bg-violet-400/10 blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">
                  {isHe ? 'מרכז עבודה' : 'Work Hub'}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                  {isHe ? 'טיימר ופרודוקטיביות' : 'Timer & Productivity'}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Talk to Plan & Find Coach — community style 2-col grid */}
      <div className="w-full max-w-xl px-4 pb-2">
        <div className="grid grid-cols-2 gap-3">
          {/* Talk to Plan */}
          <button
            onClick={() => setChatOpen(true)}
            className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] to-primary/[0.03] p-4 text-start transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 active:scale-[0.99]"
          >
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">
                  {isHe ? 'דבר עם התוכנית' : 'Talk to Plan'}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                  {isHe ? 'שאל את Aurora' : 'Ask Aurora'}
                </p>
              </div>
            </div>
          </button>

          {/* Find Coach */}
          <button
            onClick={openFindCoachWizard}
            className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-teal-500/[0.03] p-4 text-start transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99]"
          >
            <div className="absolute top-0 end-0 w-20 h-20 rounded-full bg-emerald-400/10 blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">
                  {isHe ? 'מצא מאמן' : 'Find a Coach'}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                  {isHe ? 'התאמה חכמה' : 'AI Matching'}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Tactics content — always visible */}
      <Suspense fallback={null}>
        <ArenaHub />
      </Suspense>

      {/* Strategy Modal */}
      <Dialog open={strategyOpen} onOpenChange={setStrategyOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0" preventClose>
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              {isHe ? 'אסטרטגיה' : 'Strategy'}
            </h2>
            <button
              onClick={() => setStrategyOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <Suspense fallback={null}>
            {strategyOpen && <LifeHub />}
          </Suspense>
        </DialogContent>
      </Dialog>

      {/* Work Hub Modal */}
      <Dialog open={workOpen} onOpenChange={setWorkOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0" preventClose>
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-500" />
              {isHe ? 'מרכז העבודה' : 'Work Hub'}
            </h2>
            <button
              onClick={() => setWorkOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <Suspense fallback={null}>
            {workOpen && <WorkHub />}
          </Suspense>
        </DialogContent>
      </Dialog>

      <PlanChatWizard open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
