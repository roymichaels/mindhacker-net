import { useState } from 'react';
import { ListChecks, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChecklistsData } from '@/hooks/aurora/useChecklistsData';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

export function TasksPopover() {
  const { user } = useAuth();
  const { checklists, loading, toggleItem } = useChecklistsData(user);
  const { language, isRTL } = useTranslation();
  const [open, setOpen] = useState(false);
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
      toast.success(language === 'he' ? 'משימה הושלמה! +10 XP' : 'Task completed! +10 XP', { icon: '🎉' });
    }
  };

  const allItems = checklists.flatMap(c => c.aurora_checklist_items || []);
  const completedItems = allItems.filter(i => i.is_completed);
  const overallProgress = allItems.length > 0
    ? Math.round((completedItems.length / allItems.length) * 100)
    : 0;

  const getIcon = (title: string): string => {
    if (title.includes('להפסיק') || title.includes('🚫')) return '🚫';
    if (title.includes('לבנות') || title.includes('🏗️')) return '🏗️';
    if (title.includes('קריירה') || title.includes('💼')) return '💼';
    if (title.includes('אתגר') || title.includes('⚡')) return '⚡';
    return '📋';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500"
          title={language === 'he' ? 'משימות' : 'Tasks'}
        >
          <ListChecks className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 bg-popover border shadow-lg z-[100]"
        align={isRTL ? 'start' : 'end'}
        sideOffset={8}
      >
        <div dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="p-3 border-b bg-gradient-to-r from-emerald-500/10 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-sm">
                  {language === 'he' ? '📋 המשימות שלי' : '📋 My Tasks'}
                </span>
              </div>
              {allItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {completedItems.length}/{allItems.length}
                  </span>
                  <div className="w-12">
                    <Progress value={overallProgress} className="h-1.5" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-4 text-center">
              <div className="h-4 bg-muted rounded animate-pulse" />
            </div>
          ) : checklists.length === 0 ? (
            <div className="p-6 text-center">
              <ListChecks className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {language === 'he' ? 'אין משימות עדיין' : 'No tasks yet'}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[350px]">
              <div className="divide-y">
                {checklists.map((checklist) => {
                  const items = checklist.aurora_checklist_items || [];
                  const completed = items.filter(i => i.is_completed).length;
                  const isExpanded = expandedChecklists.has(checklist.id);
                  const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

                  return (
                    <div key={checklist.id}>
                      <button
                        onClick={() => toggleExpand(checklist.id)}
                        className="w-full p-3 flex items-center gap-2 hover:bg-muted/50 transition-colors text-start"
                      >
                        <span className="text-base">{getIcon(checklist.title)}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium block break-words whitespace-normal">
                            {checklist.title.replace(/^[🚫🏗️💼⚡📋]\s*/, '')}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Progress value={progress} className="h-1 flex-1" />
                            <span className="text-[10px] text-muted-foreground">
                              {completed}/{items.length}
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden bg-muted/30"
                          >
                            <div className="px-3 py-2 space-y-1">
                              {items
                                .sort((a, b) => a.order_index - b.order_index)
                                .map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => handleToggleItem(item.id, item.is_completed)}
                                    className={cn(
                                      'w-full flex items-center gap-2 p-2 rounded-md text-start transition-colors',
                                      'hover:bg-background/80',
                                      item.is_completed && 'opacity-60'
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                                        item.is_completed ? 'bg-primary border-primary' : 'border-muted-foreground/50'
                                      )}
                                    >
                                      {item.is_completed && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                                    </div>
                                    <span className={cn(
                                      'text-xs flex-1 break-words whitespace-normal leading-relaxed',
                                      item.is_completed && 'line-through text-muted-foreground'
                                    )}>
                                      {item.content}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {/* Footer */}
          {allItems.length > 0 && (
            <div className="p-2 border-t bg-muted/20">
              <p className="text-[10px] text-center text-muted-foreground">
                <Sparkles className="w-3 h-3 inline-block me-1" />
                {language === 'he' ? 'לחץ על משימה לסימון' : 'Click task to mark complete'}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
