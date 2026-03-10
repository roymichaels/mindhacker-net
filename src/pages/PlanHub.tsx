/**
 * PlanHub — Unified Play page with 4 tabs: Strategy, Now, Tactics & Work.
 */
import { useState, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Flame, Swords, Zap, Briefcase, MessageSquare, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';

const LifeHub = lazy(() => import('./LifeHub'));
const ArenaHub = lazy(() => import('./ArenaHub'));
const UserDashboard = lazy(() => import('./UserDashboard'));
const WorkHub = lazy(() => import('./WorkHub'));

type PlanTab = 'strategy' | 'now' | 'tactics' | 'work';

export default function PlanHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [activeTab, setActiveTab] = useState<PlanTab>('now');
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const auroraChat = useAuroraChatContextSafe();

  const tabs: { id: PlanTab; labelHe: string; labelEn: string; icon: typeof Flame }[] = [
    { id: 'strategy', labelHe: 'אסטרטגיה', labelEn: 'Strategy', icon: Flame },
    { id: 'now', labelHe: 'עכשיו', labelEn: 'Now', icon: Zap },
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

      {/* Talk to your plan button — hidden on Work tab */}
      {activeTab !== 'work' && (
        <div className="w-full max-w-xl px-4 pb-2 space-y-2">
          <button
            onClick={() => setChatOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-sm font-medium text-primary"
          >
            <MessageSquare className="w-4 h-4" />
            {isHe ? 'דבר עם התוכנית שלך' : 'Talk to Your Plan'}
          </button>

          {activeTab === 'strategy' && (
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={openFindCoachWizard}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/50 transition-all text-sm font-medium text-accent-foreground"
            >
              <Search className="w-4 h-4" />
              {isHe ? '🎯 מצא מאמן שיעזור לך להגשים את האסטרטגיה' : '🎯 Find a Coach to Help Execute Your Strategy'}
            </motion.button>
          )}
        </div>
      )}

      {/* Tab content */}
      <Suspense fallback={null}>
        {activeTab === 'strategy' && <LifeHub />}
        {activeTab === 'now' && <UserDashboard />}
        {activeTab === 'tactics' && <ArenaHub />}
        {activeTab === 'work' && <WorkHub />}
      </Suspense>

      <PlanChatWizard open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
