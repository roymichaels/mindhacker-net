import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Sparkles, ListTodo, Calendar, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChecklistsData } from '@/hooks/aurora/useChecklistsData';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  checklist_id: string;
  content: string;
  is_completed: boolean;
  order_index: number;
  created_at: string;
  due_date?: string | null;
  completed_at?: string | null;
}

interface Checklist {
  id: string;
  user_id: string;
  title: string;
  origin: 'manual' | 'aurora';
  context: string | null;
  status: 'active' | 'archived';
  created_at: string;
  aurora_checklist_items?: ChecklistItem[];
}

const getDateStatus = (dueDate: string | null | undefined, isCompleted: boolean): 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'completed' | 'none' => {
  if (isCompleted) return 'completed';
  if (!dueDate) return 'none';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  return 'upcoming';
};

const formatDueDate = (dueDate: string | null | undefined, language: string): string => {
  if (!dueDate) return '';
  const status = getDateStatus(dueDate, false);
  const date = new Date(dueDate);
  if (language === 'he') {
    switch (status) {
      case 'overdue': return `${Math.abs(Math.ceil((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24)))} ימים באיחור`;
      case 'today': return 'היום';
      case 'tomorrow': return 'מחר';
      default: return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
    }
  }
  switch (status) {
    case 'overdue': return `${Math.abs(Math.ceil((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24)))}d overdue`;
    case 'today': return 'Today';
    case 'tomorrow': return 'Tomorrow';
    default: return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
};

const getChecklistIcon = (title: string): string => {
  if (title.includes('להפסיק') || title.includes('stop') || title.includes('🚫')) return '🚫';
  if (title.includes('לבנות') || title.includes('build') || title.includes('🏗️')) return '🏗️';
  if (title.includes('קריירה') || title.includes('career') || title.includes('💼')) return '💼';
  if (title.includes('אתגר') || title.includes('challenge') || title.includes('⚡')) return '⚡';
  return '📋';
};

const getChecklistColor = (title: string): string => {
  if (title.includes('להפסיק') || title.includes('stop') || title.includes('🚫')) return 'from-red-500/10 to-orange-500/10 border-red-500/20';
  if (title.includes('לבנות') || title.includes('build') || title.includes('🏗️')) return 'from-green-500/10 to-emerald-500/10 border-green-500/20';
  if (title.includes('קריירה') || title.includes('career') || title.includes('💼')) return 'from-blue-500/10 to-indigo-500/10 border-blue-500/20';
  if (title.includes('אתגר') || title.includes('challenge') || title.includes('⚡')) return 'from-amber-500/10 to-orange-500/10 border-amber-500/20';
  return 'from-purple-500/10 to-violet-500/10 border-purple-500/20';
};

export function ChecklistsCard() {
  const { user } = useAuth();
  const { checklists, loading, toggleItem } = useChecklistsData(user);
  const { t, isRTL, language } = useTranslation();
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set());

  const toggleExpand = (checklistId: string) => {
    setExpandedChecklists(prev => {
      const next = new Set(prev);
      if (next.has(checklistId)) next.delete(checklistId);
      else next.add(checklistId);
      return next;
    });
  };

  const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
    const result = await toggleItem(itemId, !isCompleted);
    if (result && !isCompleted) {
      toast.success(language === 'he' ? 'הושלם! +10 XP' : 'Done! +10 XP', { icon: '🎉' });
    }
  };

  if (loading) {
    return <div className="rounded-xl border bg-card p-3 animate-pulse"><div className="h-4 bg-muted rounded w-24 mb-2" /><div className="h-8 bg-muted rounded" /></div>;
  }

  if (checklists.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-3 text-center">
        <ListTodo className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
        <h3 className="font-semibold text-xs mb-0.5">{language === 'he' ? 'אין משימות' : 'No tasks'}</h3>
        <p className="text-[10px] text-muted-foreground">{language === 'he' ? 'השלם את התוכנית ליצירת משימות' : 'Complete the plan to create tasks'}</p>
      </div>
    );
  }

  const allItems = checklists.flatMap(c => c.aurora_checklist_items || []);
  const completedItems = allItems.filter(i => i.is_completed);
  const overallProgress = allItems.length > 0 ? Math.round((completedItems.length / allItems.length) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{language === 'he' ? 'משימות' : 'Tasks'}</span>
          <span className="text-xs text-muted-foreground">{completedItems.length}/{allItems.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{overallProgress}%</span>
          <div className="w-16"><Progress value={overallProgress} className="h-1.5" /></div>
        </div>
      </div>

      {/* Checklists */}
      <div className="divide-y">
        {checklists.map((checklist) => {
          const items = checklist.aurora_checklist_items || [];
          const completed = items.filter(i => i.is_completed).length;
          const isExpanded = expandedChecklists.has(checklist.id);
          const icon = getChecklistIcon(checklist.title);
          const colorClass = getChecklistColor(checklist.title);
          const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

          return (
            <div key={checklist.id} className="overflow-hidden">
              <button
                onClick={() => toggleExpand(checklist.id)}
                className="w-full py-3 px-4 flex items-center gap-2.5 hover:bg-muted/50 transition-colors text-start"
              >
                <span className="text-base">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{checklist.title.replace(/^[🚫🏗️💼⚡📋]\s*/, '')}</span>
                    <span className="text-xs text-muted-foreground">({completed}/{items.length})</span>
                  </div>
                  <Progress value={progress} className="h-1.5 mt-1" />
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn("border-t bg-gradient-to-br", colorClass)}
                  >
                    <div className="p-3 space-y-1">
                      {items.sort((a, b) => a.order_index - b.order_index).map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "flex items-center gap-2.5 py-2.5 px-3 rounded-lg bg-background/80",
                            "border border-border/50 transition-all cursor-pointer hover:border-primary/30",
                            item.is_completed && "opacity-60",
                            getDateStatus(item.due_date, item.is_completed) === 'overdue' && "border-destructive/50 bg-destructive/5"
                          )}
                          onClick={() => handleToggleItem(item.id, item.is_completed)}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                            item.is_completed ? "bg-primary border-primary" : "border-muted-foreground/50"
                          )}>
                            {item.is_completed && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={cn("text-sm block", item.is_completed && "line-through text-muted-foreground")}>{item.content}</span>
                            {item.due_date && !item.is_completed && (
                              <div className="mt-0.5">
                                {getDateStatus(item.due_date, item.is_completed) === 'overdue' ? (
                                  <Badge variant="destructive" className="text-[9px] h-4 gap-0.5 px-1"><AlertCircle className="w-2.5 h-2.5" />{formatDueDate(item.due_date, language)}</Badge>
                                ) : getDateStatus(item.due_date, item.is_completed) === 'today' ? (
                                  <Badge variant="secondary" className="text-[9px] h-4 gap-0.5 px-1 bg-amber-500/20 text-amber-700 border-amber-500/30"><Clock className="w-2.5 h-2.5" />{formatDueDate(item.due_date, language)}</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[9px] h-4 gap-0.5 px-1"><Calendar className="w-2.5 h-2.5" />{formatDueDate(item.due_date, language)}</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* XP Reminder */}
      <div className="px-3 py-2 bg-muted/30 border-t">
        <p className="text-xs text-center text-muted-foreground">
          <Sparkles className="w-3 h-3 inline-block me-1" />
          {language === 'he' ? 'כל משימה = +10 XP' : 'Each task = +10 XP'}
        </p>
      </div>
    </div>
  );
}

export default ChecklistsCard;
