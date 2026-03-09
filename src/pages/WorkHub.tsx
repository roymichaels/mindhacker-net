/**
 * WorkHub — Full work management hub with tabs: Timer, Tasks, Log, Stats.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ListTodo, Clock, BarChart3, Play, Square, Plus, Trash2, Brain, Zap, MessageSquare, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import {
  useTodayWorkSessions,
  useRecentWorkSessions,
  useStartWorkSession,
  useStopWorkSession,
  useCreateManualWorkBlock,
  useDeleteWorkSession,
} from '@/hooks/useWorkSessions';
import { toast } from 'sonner';
import type { WorkSession } from '@/services/workSessions';
import { WorkChatWizard } from '@/components/work/WorkChatWizard';

// ── Timer Component ──────────────────────────────────
function WorkTimer() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: sessions = [] } = useTodayWorkSessions();
  const startMut = useStartWorkSession();
  const stopMut = useStopWorkSession();

  const activeSession = useMemo(
    () => sessions.find((s) => !s.ended_at),
    [sessions]
  );

  const [elapsed, setElapsed] = useState(0);
  const [taskTitle, setTaskTitle] = useState('');
  const [isDeepWork, setIsDeepWork] = useState(false);

  useEffect(() => {
    if (!activeSession) { setElapsed(0); return; }
    const start = new Date(activeSession.started_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [activeSession]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    const title = taskTitle.trim() || (isHe ? 'בלוק עבודה' : 'Work Block');
    startMut.mutate({ title, is_deep_work: isDeepWork }, {
      onSuccess: () => {
        toast.success(isHe ? 'טיימר התחיל' : 'Timer started');
        setTaskTitle('');
      },
    });
  };

  const handleStop = () => {
    if (!activeSession) return;
    stopMut.mutate(activeSession.id, {
      onSuccess: () => toast.success(isHe ? 'בלוק עבודה נשמר!' : 'Work block saved!'),
    });
  };

  const todayMinutes = useMemo(() => {
    return sessions
      .filter((s) => s.ended_at)
      .reduce((sum, s) => sum + Math.floor(s.duration_seconds / 60), 0);
  }, [sessions]);

  return (
    <div className="space-y-6">
      {/* Timer display */}
      <motion.div
        className={cn(
          "relative flex flex-col items-center justify-center py-10 rounded-2xl border",
          activeSession
            ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/10"
            : "bg-card border-border"
        )}
        animate={activeSession ? { scale: [1, 1.005, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {activeSession && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-xs font-medium text-primary">
              {isHe ? 'פעיל' : 'Active'}
            </span>
          </div>
        )}

        {activeSession && (
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
            {activeSession.is_deep_work && <Brain className="w-3.5 h-3.5 text-primary" />}
            {activeSession.title}
          </p>
        )}

        <p className="text-5xl font-mono font-bold tracking-wider text-foreground tabular-nums">
          {formatTime(elapsed)}
        </p>

        <p className="text-sm text-muted-foreground mt-3">
          {isHe ? `סה"כ היום: ${todayMinutes} דקות` : `Today: ${todayMinutes} min`}
        </p>
      </motion.div>

      {/* Controls */}
      {!activeSession ? (
        <div className="space-y-3">
          <Input
            placeholder={isHe ? 'על מה אתה עובד?' : 'What are you working on?'}
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleStart}
              className="flex-1 gap-2"
              disabled={startMut.isPending}
            >
              <Play className="w-4 h-4" />
              {isHe ? 'התחל טיימר' : 'Start Timer'}
            </Button>
            <Button
              variant={isDeepWork ? 'default' : 'outline'}
              size="icon"
              onClick={() => setIsDeepWork(!isDeepWork)}
              title={isHe ? 'עבודה עמוקה' : 'Deep Work'}
            >
              <Brain className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleStop}
          variant="destructive"
          className="w-full gap-2"
          disabled={stopMut.isPending}
        >
          <Square className="w-4 h-4" />
          {isHe ? 'עצור וסכם' : 'Stop & Save'}
        </Button>
      )}
    </div>
  );
}

// ── Manual Block Entry ───────────────────────────────
function ManualBlockEntry() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const createMut = useCreateManualWorkBlock();
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('0');
  const [isDeepWork, setIsDeepWork] = useState(false);

  const handleAdd = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalMin = h * 60 + m;
    if (totalMin <= 0 || !title.trim()) {
      toast.error(isHe ? 'נא למלא כותרת ומשך' : 'Please fill title and duration');
      return;
    }
    const now = new Date();
    const start = new Date(now.getTime() - totalMin * 60 * 1000);
    createMut.mutate(
      {
        title: title.trim(),
        started_at: start.toISOString(),
        ended_at: now.toISOString(),
        duration_seconds: totalMin * 60,
        is_deep_work: isDeepWork,
      },
      {
        onSuccess: () => {
          toast.success(isHe ? 'בלוק עבודה נוסף!' : 'Work block added!');
          setTitle('');
          setHours('1');
          setMinutes('0');
        },
      }
    );
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <Plus className="w-4 h-4" />
        {isHe ? 'הוסף בלוק עבודה ידני' : 'Add Manual Work Block'}
      </h3>
      <Input
        placeholder={isHe ? 'שם המשימה' : 'Task name'}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">{isHe ? 'שעות' : 'Hours'}</Label>
          <Input type="number" min="0" max="12" value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">{isHe ? 'דקות' : 'Minutes'}</Label>
          <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleAdd} className="flex-1 gap-2" disabled={createMut.isPending}>
          <Plus className="w-4 h-4" />
          {isHe ? 'הוסף' : 'Add'}
        </Button>
        <Button
          variant={isDeepWork ? 'default' : 'outline'}
          size="icon"
          onClick={() => setIsDeepWork(!isDeepWork)}
          title={isHe ? 'עבודה עמוקה' : 'Deep Work'}
        >
          <Brain className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Session Log ──────────────────────────────────────
function SessionLog() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: sessions = [], isLoading } = useRecentWorkSessions();
  const deleteMut = useDeleteWorkSession();

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  if (isLoading) return <div className="text-center text-muted-foreground py-8">{isHe ? 'טוען...' : 'Loading...'}</div>;

  if (!sessions.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>{isHe ? 'אין בלוקי עבודה עדיין' : 'No work blocks yet'}</p>
        <p className="text-xs mt-1">{isHe ? 'התחל טיימר או הוסף ידנית' : 'Start a timer or add manually'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.filter(s => s.ended_at).map((session) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
        >
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            session.is_deep_work ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {session.is_deep_work ? <Brain className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(session.started_at).toLocaleDateString(isHe ? 'he-IL' : 'en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
              {' · '}
              {formatDuration(session.duration_seconds)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => deleteMut.mutate(session.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

// ── Stats Panel ──────────────────────────────────────
function WorkStats() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: sessions = [] } = useTodayWorkSessions();

  const stats = useMemo(() => {
    const completed = sessions.filter(s => s.ended_at);
    const totalMin = completed.reduce((sum, s) => sum + Math.floor(s.duration_seconds / 60), 0);
    const deepMin = completed.filter(s => s.is_deep_work).reduce((sum, s) => sum + Math.floor(s.duration_seconds / 60), 0);
    return {
      totalBlocks: completed.length,
      totalMinutes: totalMin,
      deepWorkMinutes: deepMin,
      deepWorkPercent: totalMin > 0 ? Math.round((deepMin / totalMin) * 100) : 0,
    };
  }, [sessions]);

  const cards = [
    { labelHe: 'סה"כ בלוקים', labelEn: 'Total Blocks', value: stats.totalBlocks, icon: ListTodo, color: 'text-primary' },
    { labelHe: 'דקות עבודה', labelEn: 'Work Minutes', value: stats.totalMinutes, icon: Clock, color: 'text-emerald-500' },
    { labelHe: 'עבודה עמוקה', labelEn: 'Deep Work', value: `${stats.deepWorkMinutes}m`, icon: Brain, color: 'text-violet-500' },
    { labelHe: '% עבודה עמוקה', labelEn: 'Deep %', value: `${stats.deepWorkPercent}%`, icon: Zap, color: 'text-amber-500' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div key={card.labelEn} className="p-4 rounded-xl border border-border bg-card text-center space-y-1">
          <card.icon className={cn("w-5 h-5 mx-auto", card.color)} />
          <p className="text-2xl font-bold">{card.value}</p>
          <p className="text-xs text-muted-foreground">{isHe ? card.labelHe : card.labelEn}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Hub ─────────────────────────────────────────
export default function WorkHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { isPlus } = useSubscriptionGate();
  const [chatMode, setChatMode] = useState<'chat' | 'wizard' | null>(null);

  const tabs = [
    { id: 'timer', labelHe: 'טיימר', labelEn: 'Timer', icon: Timer },
    { id: 'log', labelHe: 'יומן', labelEn: 'Log', icon: Clock },
    { id: 'stats', labelHe: 'סטטיסטיקה', labelEn: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col w-full items-center pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="w-full max-w-xl px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold">
          {isHe ? '🔧 מרכז העבודה' : '🔧 Work Hub'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isHe ? 'עקוב אחר שעות העבודה שלך ומדוד פרודוקטיביות' : 'Track your work hours and measure productivity'}
        </p>
      </div>

      {/* AI Action buttons */}
      <div className="w-full max-w-xl px-4 pb-2 space-y-2">
        <button
          onClick={() => setChatMode('chat')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-sm font-medium text-primary"
        >
          <MessageSquare className="w-4 h-4" />
          {isHe ? 'דבר עם תוכנית העבודה' : 'Talk to Work Plan'}
          {!isPlus && <Lock className="w-3 h-3 opacity-60" />}
        </button>
        <button
          onClick={() => setChatMode('wizard')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/50 transition-all text-sm font-medium text-accent-foreground"
        >
          <Sparkles className="w-4 h-4" />
          {isHe ? '✨ אשף עבודה AI' : '✨ AI Work Wizard'}
          {!isPlus && <Lock className="w-3 h-3 opacity-60" />}
        </button>
      </div>

      {/* Tab bar — matching PlanHub style */}
      <div className="w-full max-w-xl px-4 pt-1 pb-3">
        <Tabs defaultValue="timer" className="w-full">
          <div className="flex gap-1 p-1 rounded-2xl bg-muted/60 border border-border/50">
            <TabsList className="w-full bg-transparent border-none shadow-none p-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {isHe ? tab.labelHe : tab.labelEn}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="mt-4">
            <TabsContent value="timer" className="space-y-6">
              <WorkTimer />
              <ManualBlockEntry />
            </TabsContent>

            <TabsContent value="log">
              <SessionLog />
            </TabsContent>

            <TabsContent value="stats">
              <WorkStats />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
