/**
 * Learn — Aurora Teaches You. Full curriculum system.
 * Sidebar-less: course list + curriculum tree are inline.
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { toast } from 'sonner';
import {
  Sparkles, BookOpen, GraduationCap, Trophy, Play, CheckCircle, Lock,
  FileText, Brain, Target, Flame, Clock, Zap, ChevronDown, ChevronUp, Plus,
  ChevronLeft, RefreshCw, Loader2, Lightbulb, TrendingUp, AlertTriangle,
} from 'lucide-react';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LessonFocusSession from '@/components/learn/LessonFocusSession';
import { cn } from '@/lib/utils';
import { PageShell } from '@/components/aurora-ui/PageShell';

interface Curriculum {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  topic: string;
  category: string | null;
  status: string;
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
  total_modules: number;
  estimated_days: number;
  pillar: string | null;
  created_at: string;
}

interface Module {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  difficulty: string;
  order_index: number;
  status: string;
  total_lessons: number;
  completed_lessons: number;
}

interface Lesson {
  id: string;
  title: string;
  title_en: string | null;
  lesson_type: string;
  order_index: number;
  status: string;
  content: any;
  score: number | null;
  xp_reward: number;
  time_estimate_minutes: number;
  completed_at: string | null;
  user_submission: any;
  feedback: any;
  module_id: string;
  curriculum_id: string;
}

const LESSON_TYPE_ICONS: Record<string, React.ElementType> = {
  theory: BookOpen,
  practice: Target,
  quiz: Brain,
  project: Trophy,
};

const LESSON_TYPE_LABELS: Record<string, { he: string; en: string }> = {
  theory: { he: 'תיאוריה', en: 'Theory' },
  practice: { he: 'תרגול', en: 'Practice' },
  quiz: { he: 'בוחן', en: 'Quiz' },
  project: { he: 'פרויקט', en: 'Project' },
};

export default function Learn() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { canAccessCourseCreation, showUpgradePrompt } = useSubscriptionGate();
  const queryClient = useQueryClient();
  const auroraChat = useAuroraChatContextSafe();

  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [recalibrating, setRecalibrating] = useState(false);

  // Sync curriculum selection with events
  useEffect(() => {
    const handler = (e: Event) => setSelectedCurriculum((e as CustomEvent).detail);
    window.addEventListener('learn:select-curriculum', handler);
    return () => window.removeEventListener('learn:select-curriculum', handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const lesson = (e as CustomEvent).detail;
      if (lesson) setSelectedLesson(lesson);
    };
    window.addEventListener('learn:open-lesson', handler);
    return () => window.removeEventListener('learn:open-lesson', handler);
  }, []);

  const selectCurriculum = useCallback((id: string | null) => {
    setSelectedCurriculum(id);
    if (id) window.dispatchEvent(new CustomEvent('learn:select-curriculum', { detail: id }));
  }, []);

  // Fetch curricula
  const { data: curricula, isLoading } = useQuery({
    queryKey: ['learning-curricula', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_curricula')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Curriculum[];
    },
    enabled: !!user?.id,
  });

  const activeCurrId = selectedCurriculum || curricula?.find(c => c.status === 'active')?.id || curricula?.[0]?.id || null;
  const activeCurriculum = curricula?.find(c => c.id === activeCurrId);

  // Fetch modules for active curriculum
  const { data: modules } = useQuery({
    queryKey: ['learning-modules', activeCurrId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('curriculum_id', activeCurrId!)
        .order('order_index');
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!activeCurrId,
  });

  // Fetch lessons for active curriculum
  const { data: lessons } = useQuery({
    queryKey: ['learning-lessons', activeCurrId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('curriculum_id', activeCurrId!)
        .order('order_index');
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!activeCurrId,
  });

  const openWizardInDock = useCallback(() => {
    if (!auroraChat) return;
    auroraChat.setActivePillar('learn');
    auroraChat.setIsDockVisible(true);
    auroraChat.setIsChatExpanded(true);
    auroraChat.setPendingAssistantGreeting(
      isHe
        ? '🔥 שלום! אני Aurora, ואני הולכת לבנות לך תוכנית לימודים אינטנסיבית.\n\nזה לא קורס רגיל — זה **Boot Camp**. אני אדחוף אותך מאפס למקצוען.\n\n**מה אתה רוצה ללמוד?**\n\nתהיה ספציפי — "Python לData Science", "גיטרה קלאסית", "שיווק דיגיטלי" — כל מה שתרצה.'
        : "🔥 Hey! I'm Aurora, and I'm about to build you an intensive learning curriculum.\n\nThis isn't a casual course — this is a **Boot Camp**. I'll push you from zero to pro.\n\n**What do you want to learn?**\n\nBe specific — \"Python for Data Science\", \"Classical Guitar\", \"Digital Marketing\" — anything you want to master."
    );
  }, [auroraChat, isHe]);

  const handleRecalibrate = useCallback(async () => {
    if (!activeCurriculum) return;
    setRecalibrating(true);
    window.dispatchEvent(new CustomEvent('learn:recalibrating', { detail: true }));
    try {
      await supabase.from('learning_curricula').delete().eq('id', activeCurriculum.id);
      queryClient.invalidateQueries({ queryKey: ['learning-curricula'] });
      queryClient.invalidateQueries({ queryKey: ['learning-modules'] });
      queryClient.invalidateQueries({ queryKey: ['learning-lessons'] });
      selectCurriculum(null);
      openWizardInDock();
      toast.success(isHe ? 'הקורס נמחק — בוא ניצור חדש!' : 'Course deleted — let\'s create a new one!');
    } catch (e) {
      console.error('Recalibrate failed:', e);
      toast.error(isHe ? 'שגיאה בכיול מחדש' : 'Recalibration failed');
    } finally {
      setRecalibrating(false);
      window.dispatchEvent(new CustomEvent('learn:recalibrating', { detail: false }));
    }
  }, [activeCurriculum, queryClient, isHe, openWizardInDock, selectCurriculum]);

  useEffect(() => {
    const handler = () => handleRecalibrate();
    window.addEventListener('learn:recalibrate', handler);
    return () => window.removeEventListener('learn:recalibrate', handler);
  }, [handleRecalibrate]);

  // Fetch user's selected pillars for suggested courses
  const { data: profilePillars } = useQuery({
    queryKey: ['profile-pillars', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('selected_pillars')
        .eq('id', user!.id)
        .single();
      return (data?.selected_pillars as any) || { core: [], arena: [] };
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // Fetch user skills for gap analysis
  const { data: userSkills } = useQuery({
    queryKey: ['user-skills-learn', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('skills')
        .select('name, name_he, pillar, current_level, target_level')
        .limit(50);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const PILLAR_COURSE_SUGGESTIONS: Record<string, { en: string; he: string; icon: string }[]> = {
    consciousness: [
      { en: 'Mindfulness & Meditation', he: 'מיינדפולנס ומדיטציה', icon: '🧘' },
      { en: 'Cognitive Psychology', he: 'פסיכולוגיה קוגניטיבית', icon: '🧠' },
    ],
    presence: [
      { en: 'Public Speaking Mastery', he: 'מיומנויות דיבור ציבורי', icon: '🎤' },
      { en: 'Emotional Intelligence', he: 'אינטליגנציה רגשית', icon: '💡' },
    ],
    power: [
      { en: 'Leadership Fundamentals', he: 'יסודות מנהיגות', icon: '👑' },
      { en: 'Negotiation Skills', he: 'מיומנויות משא ומתן', icon: '🤝' },
    ],
    vitality: [
      { en: 'Nutrition Science', he: 'מדע התזונה', icon: '🥗' },
      { en: 'Sleep Optimization', he: 'אופטימיזציית שינה', icon: '😴' },
    ],
    focus: [
      { en: 'Deep Work Strategies', he: 'אסטרטגיות עבודה עמוקה', icon: '🎯' },
      { en: 'Time Management Systems', he: 'מערכות ניהול זמן', icon: '⏱️' },
    ],
    combat: [
      { en: 'Martial Arts Principles', he: 'עקרונות אומנויות לחימה', icon: '🥊' },
      { en: 'Stress Resilience', he: 'חוסן תחת לחץ', icon: '🛡️' },
    ],
    expansion: [
      { en: 'Creative Thinking', he: 'חשיבה יצירתית', icon: '🎨' },
      { en: 'Growth Mindset', he: 'חשיבת צמיחה', icon: '🌱' },
    ],
    wealth: [
      { en: 'Personal Finance', he: 'כספים אישיים', icon: '💰' },
      { en: 'Investing Basics', he: 'יסודות השקעות', icon: '📈' },
    ],
    relationships: [
      { en: 'Communication Skills', he: 'מיומנויות תקשורת', icon: '💬' },
      { en: 'Conflict Resolution', he: 'פתרון קונפליקטים', icon: '🕊️' },
    ],
    projects: [
      { en: 'Project Management', he: 'ניהול פרויקטים', icon: '📋' },
      { en: 'Agile Methodologies', he: 'מתודולוגיות אג׳ייל', icon: '🔄' },
    ],
    play: [
      { en: 'Creative Hobbies', he: 'תחביבים יצירתיים', icon: '🎭' },
      { en: 'Adventure Planning', he: 'תכנון הרפתקאות', icon: '🏔️' },
    ],
    order: [
      { en: 'Systems Thinking', he: 'חשיבה מערכתית', icon: '🔧' },
      { en: 'Habit Architecture', he: 'ארכיטקטורת הרגלים', icon: '🏗️' },
    ],
  };

  const suggestedCourses = useMemo(() => {
    if (!profilePillars) return [];
    const allPillars = [...(profilePillars.core || []), ...(profilePillars.arena || [])];
    const suggestions: { en: string; he: string; icon: string; pillar: string }[] = [];
    allPillars.forEach((p: string) => {
      const courses = PILLAR_COURSE_SUGGESTIONS[p];
      if (courses) courses.forEach(c => suggestions.push({ ...c, pillar: p }));
    });
    // Filter out courses user already has
    const existingTopics = new Set((curricula || []).map(c => c.topic?.toLowerCase()));
    return suggestions.filter(s => !existingTopics.has(s.en.toLowerCase())).slice(0, 4);
  }, [profilePillars, curricula]);

  const skillGaps = useMemo(() => {
    if (!userSkills) return [];
    return userSkills
      .filter((s: any) => s.target_level && s.current_level < s.target_level)
      .sort((a: any, b: any) => (b.target_level - b.current_level) - (a.target_level - a.current_level))
      .slice(0, 4);
  }, [userSkills]);

  const nextLesson = useMemo(() => {
    if (!lessons) return null;
    return lessons.find(l => l.status === 'unlocked' || l.status === 'in_progress') ||
           lessons.find(l => l.status !== 'completed' && l.status !== 'locked') || null;
  }, [lessons]);

  const nextLessonModule = useMemo(() => {
    if (!nextLesson || !modules) return null;
    return modules.find(m => m.id === nextLesson.module_id);
  }, [nextLesson, modules]);

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (nextLesson) {
      setExpandedModules(prev => {
        const next = new Set(prev);
        next.add(nextLesson.module_id);
        return next;
      });
    }
  }, [nextLesson]);

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId); else next.add(modId);
      return next;
    });
  };

  const handleLessonComplete = async () => {
    const completedId = selectedLesson?.id;
    setSelectedLesson(null);
    await queryClient.invalidateQueries({ queryKey: ['learning-lessons', activeCurrId] });
    queryClient.invalidateQueries({ queryKey: ['learning-modules', activeCurrId] });
    queryClient.invalidateQueries({ queryKey: ['learning-curricula'] });
    setTimeout(() => {
      const fresh = queryClient.getQueryData<any[]>(['learning-lessons', activeCurrId]);
      if (!fresh) return;
      const next = fresh.find((l: any) => (l.status === 'unlocked' || l.status === 'in_progress') && l.id !== completedId)
        || fresh.find((l: any) => l.status !== 'completed' && l.status !== 'locked' && l.id !== completedId);
      if (next) setSelectedLesson(next);
    }, 600);
  };

  // Determine view: 'list' (all courses) or 'detail' (selected course)
  const showDetail = !!activeCurrId && !!activeCurriculum;
  const showList = !selectedCurriculum; // Show course cards when no explicit selection

  const totalXp = useMemo(() => {
    if (!lessons) return 0;
    return lessons.filter(l => l.status === 'completed').reduce((s, l) => s + (l.xp_reward || 0), 0);
  }, [lessons]);

  const quotes = isHe
    ? ['כל מסע של אלף מיל מתחיל בצעד אחד.', 'הידע הוא הכוח הגדול ביותר שיש.', 'אתה לא צריך להיות מושלם — רק להתקדם.']
    : ['Every expert was once a beginner.', 'Knowledge is the most powerful weapon.', "You don't have to be perfect — just keep moving."];
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  return (
    <PageShell>
      <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full pb-52">
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">{isHe ? 'טוען...' : 'Loading...'}</div>
        ) : !curricula?.length ? (
          /* ── Empty state ── */
          <div className="flex-1 flex items-center justify-center px-4 min-h-[60vh]">
            <div className="text-center space-y-5 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{isHe ? 'מוכן להתחיל ללמוד?' : 'Ready to learn?'}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {isHe ? 'ספר ל-Aurora מה אתה רוצה ללמוד והיא תבנה לך תוכנית אינטנסיבית.' : "Tell Aurora what you want to learn and she'll build an intensive curriculum."}
                </p>
              </div>
              <Button onClick={openWizardInDock} className="gap-2 rounded-full px-6">
                <Sparkles className="h-4 w-4" />
                {isHe ? 'בואי נתחיל' : "Let's start"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Suggested Courses ── */}
            {!selectedCurriculum && suggestedCourses.length > 0 && (
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 via-purple-800/10 to-amber-900/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    {isHe ? 'קורסים מומלצים לך' : 'Suggested For You'}
                  </h2>
                  <span className="text-[10px] text-purple-300/70">
                    {isHe ? 'לפי המסלול שלך' : 'Based on your pillars'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedCourses.map((sc, i) => {
                    const colors = [
                      'border-purple-500/30 bg-purple-900/25 hover:border-purple-400/50 hover:shadow-purple-500/10',
                      'border-amber-500/25 bg-amber-900/20 hover:border-amber-400/40 hover:shadow-amber-500/10',
                      'border-purple-400/25 bg-purple-800/20 hover:border-purple-300/40 hover:shadow-purple-400/10',
                      'border-amber-400/20 bg-amber-800/15 hover:border-amber-300/35 hover:shadow-amber-400/10',
                    ];
                    return (
                    <button
                      key={i}
                      onClick={() => {
                        if (auroraChat) {
                          auroraChat.setActivePillar('learn');
                          auroraChat.setIsDockVisible(true);
                          auroraChat.setIsChatExpanded(true);
                          auroraChat.setPendingAssistantGreeting(
                            isHe
                              ? `🔥 בוא ניצור קורס Boot Camp ב**${sc.he}**! מוכן?`
                              : `🔥 Let's build a Boot Camp on **${sc.en}**! Ready?`
                          );
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2.5 p-3 rounded-xl border hover:shadow-md transition-all text-start active:scale-[0.98]",
                        colors[i % colors.length]
                      )}
                    >
                      <span className="text-lg">{sc.icon}</span>
                      <span className="text-xs font-semibold text-foreground line-clamp-1">
                        {isHe ? sc.he : sc.en}
                      </span>
                    </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Skill Gap Analysis ── */}
            {!selectedCurriculum && skillGaps.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    {isHe ? 'פערי מיומנויות' : 'Skill Gaps'}
                  </h2>
                  <span className="text-[10px] text-muted-foreground">
                    {isHe ? 'מיומנויות שכדאי לחזק' : 'Skills to strengthen'}
                  </span>
                </div>
                <div className="space-y-2">
                  {skillGaps.map((skill: any, i: number) => {
                    const gap = skill.target_level - skill.current_level;
                    const pct = Math.round((skill.current_level / skill.target_level) * 100);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (auroraChat) {
                            const name = isHe ? (skill.name_he || skill.name) : skill.name;
                            auroraChat.setActivePillar('learn');
                            auroraChat.setIsDockVisible(true);
                            auroraChat.setIsChatExpanded(true);
                            auroraChat.setPendingAssistantGreeting(
                              isHe
                                ? `🎯 זיהיתי שאתה צריך לחזק את **${name}**. בוא ניצור קורס ממוקד!`
                                : `🎯 I noticed you need to strengthen **${name}**. Let's create a focused course!`
                            );
                          }
                        }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border/30 bg-card/40 hover:border-amber-500/30 hover:shadow-md transition-all text-start"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {isHe ? (skill.name_he || skill.name) : skill.name}
                            </span>
                            <span className="text-[10px] text-amber-400 font-bold shrink-0">
                              Lv.{skill.current_level}→{skill.target_level}
                            </span>
                          </div>
                          <Progress value={pct} className="h-1 mt-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedCurriculum && (
                  <button
                    onClick={() => selectCurriculum(null)}
                    className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <ChevronLeft className={cn("h-5 w-5", isHe && "rotate-180")} />
                  </button>
                )}
                <h1 className="text-lg font-bold text-foreground truncate">
                  {selectedCurriculum && activeCurriculum
                    ? activeCurriculum.title
                    : (isHe ? 'הקורסים שלי' : 'My Courses')}
                </h1>
              </div>
              <Button
                onClick={() => canAccessCourseCreation ? openWizardInDock() : showUpgradePrompt(isHe ? 'יצירת קורס' : 'Course Creation')}
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-full border-primary/30 text-primary hover:bg-primary/10 flex-shrink-0"
              >
                {canAccessCourseCreation ? <Plus className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {isHe ? 'קורס חדש' : 'New Course'}
              </Button>
            </div>

            {/* ── Motivational quote ── */}
            {!selectedCurriculum && (
              <div className="text-center py-2">
                <Sparkles className="h-4 w-4 text-primary mx-auto opacity-50 mb-1" />
                <p className="text-xs italic text-muted-foreground">"{dailyQuote}"</p>
              </div>
            )}

            {/* ── Course Cards Grid (when no course selected) ── */}
            {!selectedCurriculum && (
              <div className="grid grid-cols-1 gap-3">
                {curricula.map((curr) => {
                  const isDone = curr.status === 'completed';
                  return (
                    <button
                      key={curr.id}
                      onClick={() => selectCurriculum(curr.id)}
                      className={cn(
                        "w-full text-start rounded-2xl p-4 transition-all border",
                        "bg-card/60 border-border/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                        "active:scale-[0.99]"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          isDone ? "bg-emerald-500/10" : "bg-primary/10"
                        )}>
                          {isDone
                            ? <Trophy className="h-5 w-5 text-emerald-400" />
                            : <Flame className="h-5 w-5 text-primary" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{curr.title}</p>
                          {curr.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{curr.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={curr.progress_percentage} className="h-1.5 flex-1" />
                            <span className="text-xs font-bold text-primary">{curr.progress_percentage}%</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" />{curr.completed_lessons}/{curr.total_lessons}</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />~{curr.estimated_days}{isHe ? 'י' : 'd'}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Course Detail View (selected course) ── */}
            {selectedCurriculum && activeCurriculum && (
              <div className="flex flex-col gap-4">
                {/* Course stats */}
                <div className="rounded-2xl border border-border/40 bg-card/60 p-4 space-y-3">
                  {activeCurriculum.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{activeCurriculum.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Progress value={activeCurriculum.progress_percentage} className="h-2 flex-1" />
                    <span className="text-sm font-bold text-primary">{activeCurriculum.progress_percentage}%</span>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-center">
                    <div>
                      <p className="text-base font-bold">{activeCurriculum.total_modules}</p>
                      <p className="text-[10px] text-muted-foreground">{isHe ? 'מודולים' : 'Modules'}</p>
                    </div>
                    <div className="w-px h-6 bg-border/30" />
                    <div>
                      <p className="text-base font-bold">{activeCurriculum.completed_lessons}/{activeCurriculum.total_lessons}</p>
                      <p className="text-[10px] text-muted-foreground">{isHe ? 'שיעורים' : 'Lessons'}</p>
                    </div>
                    <div className="w-px h-6 bg-border/30" />
                    <div>
                      <p className="text-base font-bold flex items-center gap-0.5"><Zap className="h-3 w-3 text-amber-400" />{totalXp}</p>
                      <p className="text-[10px] text-muted-foreground">XP</p>
                    </div>
                    <div className="w-px h-6 bg-border/30" />
                    <div>
                      <p className="text-base font-bold">~{activeCurriculum.estimated_days}</p>
                      <p className="text-[10px] text-muted-foreground">{isHe ? 'ימים' : 'Days'}</p>
                    </div>
                  </div>
                </div>

                {/* Next lesson card */}
                {nextLesson && (
                  <Card
                    className="cursor-pointer group border-primary/20 hover:border-primary/40 bg-card/80 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-primary/5"
                    onClick={() => setSelectedLesson(nextLesson)}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className="text-[10px] bg-primary/15 text-primary border-0">
                          {isHe ? 'השיעור הבא' : 'Up Next'}
                        </Badge>
                        {nextLessonModule && (
                          <span className="text-[10px] text-muted-foreground">{nextLessonModule.title}</span>
                        )}
                      </div>
                      <h3 className="text-base font-bold group-hover:text-primary transition-colors">
                        {nextLesson.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {(() => {
                          const Icon = LESSON_TYPE_ICONS[nextLesson.lesson_type] || FileText;
                          const label = LESSON_TYPE_LABELS[nextLesson.lesson_type];
                          return (
                            <span className="flex items-center gap-1">
                              <Icon className="h-3.5 w-3.5" />
                              {label ? (isHe ? label.he : label.en) : nextLesson.lesson_type}
                            </span>
                          );
                        })()}
                        {nextLesson.time_estimate_minutes > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {nextLesson.time_estimate_minutes} {isHe ? 'דק׳' : 'min'}
                          </span>
                        )}
                        {nextLesson.xp_reward > 0 && (
                          <span className="flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            {nextLesson.xp_reward} XP
                          </span>
                        )}
                      </div>
                      <Button className="w-full gap-2 rounded-xl group-hover:bg-primary">
                        <Play className="h-4 w-4" />
                        {isHe ? 'התחל שיעור' : 'Start Lesson'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Curriculum tree */}
                <div className="rounded-2xl border border-border/40 bg-card/60 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isHe ? 'תוכנית הלימודים' : 'Curriculum'}
                    </span>
                    <button
                      onClick={handleRecalibrate}
                      disabled={recalibrating}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {recalibrating
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <RefreshCw className="w-3 h-3" />
                      }
                      {recalibrating ? (isHe ? 'מכייל...' : 'Recalibrating...') : (isHe ? 'כיול מחדש' : 'Recalibrate')}
                    </button>
                  </div>
                  <ModulesLessonsTree
                    modules={modules}
                    lessons={lessons}
                    nextLesson={nextLesson}
                    expandedModules={expandedModules}
                    toggleModule={toggleModule}
                    onSelectLesson={setSelectedLesson}
                    isHe={isHe}
                  />
                </div>

                {/* All done state */}
                {lessons && lessons.length > 0 && !nextLesson && (
                  <div className="text-center space-y-3 py-6">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                      <Trophy className="h-7 w-7 text-amber-400" />
                    </div>
                    <h3 className="text-base font-bold">{isHe ? 'סיימת את כל השיעורים! 🎉' : 'All lessons completed! 🎉'}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      {isHe ? 'כל הכבוד! אתה יכול ליצור קורס חדש.' : 'Amazing work! You can create a new course.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {selectedLesson && (
          <LessonFocusSession
            lesson={selectedLesson}
            onComplete={handleLessonComplete}
            onClose={() => setSelectedLesson(null)}
          />
        )}
      </div>
    </PageShell>
  );
}

// ── Shared Modules/Lessons Tree Component ──
function ModulesLessonsTree({ modules, lessons, nextLesson, expandedModules, toggleModule, onSelectLesson, isHe }: {
  modules: Module[] | undefined;
  lessons: Lesson[] | undefined;
  nextLesson: Lesson | null;
  expandedModules: Set<string>;
  toggleModule: (id: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
  isHe: boolean;
}) {
  return (
    <div>
      {modules?.map((mod) => {
        const isLocked = mod.status === 'locked';
        const isDone = mod.status === 'completed';
        const isActive = mod.status === 'in_progress' || mod.status === 'unlocked';
        const isOpen = expandedModules.has(mod.id);
        const modLessons = lessons?.filter(l => l.module_id === mod.id) || [];

        return (
          <div key={mod.id}>
            <button
              onClick={() => !isLocked && toggleModule(mod.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 transition-colors border-b border-border/15",
                isLocked ? "opacity-35 cursor-not-allowed" : "active:bg-muted/40 hover:bg-muted/20",
              )}
            >
              {isLocked ? (
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : isDone ? (
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <Play className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              )}
              <div className="flex-1 min-w-0 text-start">
                <p className="text-[13px] font-semibold leading-tight">{mod.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{mod.completed_lessons}/{mod.total_lessons}</p>
              </div>
              {!isLocked && (
                isOpen
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              )}
            </button>

            {isOpen && !isLocked && modLessons.map((lesson, lesIdx) => {
              const Icon = LESSON_TYPE_ICONS[lesson.lesson_type] || FileText;
              const isNext = lesson.id === nextLesson?.id;
              const lessonDone = lesson.status === 'completed';
              const lessonLocked = lesson.status === 'locked';

              return (
                <button
                  key={lesson.id}
                  disabled={lessonLocked}
                  onClick={() => !lessonLocked && onSelectLesson(lesson)}
                  className={cn(
                    "w-full flex items-center gap-3 ps-10 pe-4 py-2.5 transition-colors text-start",
                    lesIdx < modLessons.length - 1 && "border-b border-border/8",
                    lessonLocked && "opacity-20 cursor-not-allowed",
                    lessonDone && "text-muted-foreground",
                    isNext && "bg-primary/5",
                    !isNext && !lessonDone && !lessonLocked && "active:bg-muted/30 hover:bg-muted/15",
                  )}
                >
                  {lessonLocked ? (
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                  ) : lessonDone ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", isNext ? "text-primary" : "text-muted-foreground/60")} />
                  )}
                  <span className="text-[13px] flex-1 leading-tight">{lesson.title}</span>
                  {isNext && (
                    <Badge className="text-[9px] h-4 px-1.5 bg-primary/15 text-primary border-0 shrink-0">
                      {isHe ? 'הבא' : 'Next'}
                    </Badge>
                  )}
                  {lesson.score !== null && (
                    <span className="text-[11px] text-primary shrink-0">{lesson.score}%</span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
