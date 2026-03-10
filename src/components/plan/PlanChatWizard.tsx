/**
 * PlanChatWizard — "Talk to your plan" free-form chat for surgical plan edits.
 * Uses Aurora + command bus to make targeted changes without regenerating.
 * Reuses the same Aurora chat UI components (messages, input, TTS, voice mode).
 * 
 * CONFIRMATION FLOW: Aurora proposes changes → user approves/rejects → changes execute.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Wrench, Check, X, Loader2 } from 'lucide-react';
import { parseAllTags, stripAllTags, describeCommand, type AppCommand } from '@/lib/commandBus';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AuroraChatMessage from '@/components/aurora/AuroraChatMessage';
import AuroraTypingIndicator from '@/components/aurora/AuroraTypingIndicator';
import AuroraChatInput from '@/components/aurora/AuroraChatInput';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

interface PendingChange {
  label: string;
  description: string;
  command: AppCommand | null; // null for practice commands
  rawTag: string;
}

interface PlanChatWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_ACTIONS_HE = [
  'ספר לי מה עשיתי היום',
  'החלף משימה באחרת',
  'הוסף תרגול חדש לתוכנית',
  'סמן משימות כהושלמו',
];
const QUICK_ACTIONS_EN = [
  'Tell you about my day',
  'Swap a task for another',
  'Add a new practice to my plan',
  'Mark tasks as completed',
];

export function PlanChatWizard({ open, onOpenChange }: PlanChatWizardProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [pendingRawText, setPendingRawText] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingChanges]);

  const handleClose = (val: boolean) => {
    if (!val) {
      setMessages([]);
      setAppliedCount(0);
      setPendingChanges([]);
      setPendingRawText('');
    }
    onOpenChange(val);
  };

  const invalidatePlanQueries = useCallback(() => {
    const keys = [
      'life-plan', 'milestones', 'strategy-plans', 'strategy-missions',
      'strategy-milestones', 'strategy-traits', 'strategy-skill-progress',
      'daily-queue', 'trait-gallery', 'user-practices', 'action-items',
      'action-items-completed', 'tactical-schedule',
      'daily-habits', 'current-week-milestone',
    ];
    keys.forEach(k => queryClient.invalidateQueries({ queryKey: [k] }));
  }, [queryClient]);

  const executeCommand = useCallback(async (command: AppCommand): Promise<boolean> => {
    if (!user?.id) return false;

    const getActivePlanId = async (): Promise<string | null> => {
      const { data } = await supabase.from('life_plans').select('id').eq('user_id', user.id).eq('status', 'active').maybeSingle();
      return data?.id || null;
    };

    switch (command.type) {
      case 'editMilestone': {
        const allowedFields = ['title', 'title_en', 'description', 'description_en', 'goal', 'goal_en', 'focus_area', 'focus_area_en'];
        const safeUpdates: Record<string, string> = {};
        for (const [k, v] of Object.entries(command.updates)) {
          if (allowedFields.includes(k)) safeUpdates[k] = v;
        }
        if (Object.keys(safeUpdates).length === 0) return false;
        const { error } = await supabase.from('life_plan_milestones').update(safeUpdates).eq('id', command.milestoneId);
        return !error;
      }

      case 'addMilestoneTask': {
        const planId = await getActivePlanId();
        if (!planId) return false;
        const { data: milestone } = await supabase.from('life_plan_milestones').select('id, tasks').eq('plan_id', planId).eq('week_number', command.weekNumber).single();
        if (!milestone) return false;
        const tasks = Array.isArray(milestone.tasks) ? [...milestone.tasks] : [];
        tasks.push(command.task);
        const { error } = await supabase.from('life_plan_milestones').update({ tasks }).eq('id', milestone.id);
        return !error;
      }

      case 'removeMilestoneTask': {
        const planId = await getActivePlanId();
        if (!planId) return false;
        const { data: milestone } = await supabase.from('life_plan_milestones').select('id, tasks').eq('plan_id', planId).eq('week_number', command.weekNumber).single();
        if (!milestone) return false;
        const tasks = Array.isArray(milestone.tasks) ? [...milestone.tasks] : [];
        if (command.taskIndex < 0 || command.taskIndex >= tasks.length) return false;
        tasks.splice(command.taskIndex, 1);
        const { error } = await supabase.from('life_plan_milestones').update({ tasks }).eq('id', milestone.id);
        return !error;
      }

      case 'replaceMilestoneTask': {
        const planId = await getActivePlanId();
        if (!planId) return false;
        const { data: milestone } = await supabase.from('life_plan_milestones').select('id, tasks').eq('plan_id', planId).eq('week_number', command.weekNumber).single();
        if (!milestone) return false;
        const tasks = Array.isArray(milestone.tasks) ? [...milestone.tasks] : [];
        if (command.taskIndex < 0 || command.taskIndex >= tasks.length) return false;
        tasks[command.taskIndex] = command.newTask;
        const { error } = await supabase.from('life_plan_milestones').update({ tasks }).eq('id', milestone.id);
        return !error;
      }

      case 'updatePlan': {
        const planId = await getActivePlanId();
        if (!planId) return false;
        const updateData: Record<string, string> = { [command.field]: command.value };
        const { error } = await supabase.from('life_plan_milestones').update(updateData).eq('plan_id', planId).eq('week_number', command.weekNumber);
        return !error;
      }

      case 'addMilestone': {
        const planId = await getActivePlanId();
        if (!planId) return false;
        const { error } = await supabase.from('life_plan_milestones').insert({
          plan_id: planId,
          week_number: command.weekNumber,
          month_number: Math.ceil(command.weekNumber / 4),
          title: command.title,
          goal: command.goal || null,
          focus_area: command.focusArea || null,
        });
        return !error;
      }

      case 'removeMilestone': {
        const planId = await getActivePlanId();
        if (!planId) return false;
        const { error } = await supabase.from('life_plan_milestones').delete().eq('plan_id', planId).eq('week_number', command.weekNumber);
        return !error;
      }

      case 'completeMilestone': {
        const planId = await getActivePlanId();
        if (!planId) return false;
        const { error } = await supabase.from('life_plan_milestones')
          .update({ is_completed: true, completed_at: new Date().toISOString() })
          .eq('plan_id', planId).eq('week_number', command.weekNumber);
        return !error;
      }

      case 'bulkReplacePlan': {
        const { data: plans } = await supabase.from('life_plans').select('id').eq('user_id', user.id).eq('status', 'active');
        if (!plans?.length) return false;
        const regex = new RegExp(command.oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        let updated = 0;
        for (const plan of plans) {
          const { data: milestones } = await supabase.from('life_plan_milestones').select('id, title, title_en, description, description_en, tasks').eq('plan_id', plan.id);
          if (milestones) {
            for (const m of milestones) {
              const updates: Record<string, any> = {};
              for (const field of ['title', 'title_en', 'description', 'description_en'] as const) {
                const val = (m as any)[field];
                if (typeof val === 'string' && regex.test(val)) {
                  updates[field] = val.replace(regex, command.newText); regex.lastIndex = 0;
                }
              }
              if (Array.isArray(m.tasks)) {
                const newTasks = (m.tasks as any[]).map(t => {
                  if (typeof t === 'string') { regex.lastIndex = 0; return t.replace(regex, command.newText); }
                  return t;
                });
                regex.lastIndex = 0;
                if (JSON.stringify(newTasks) !== JSON.stringify(m.tasks)) updates.tasks = newTasks;
              }
              if (Object.keys(updates).length > 0) {
                await supabase.from('life_plan_milestones').update(updates).eq('id', m.id);
                updated++;
              }
            }
          }
        }
        return updated > 0;
      }

      case 'createHabit': {
        const { error } = await supabase.from('action_items').insert({
          user_id: user.id, type: 'habit', source: 'aurora', status: 'todo',
          title: command.name, recurrence_rule: 'daily', xp_reward: 10,
        });
        return !error;
      }

      case 'removeHabit': {
        const { data: habit } = await supabase.from('action_items')
          .select('id').eq('user_id', user.id).eq('type', 'habit')
          .ilike('title', `%${command.name}%`).limit(1).maybeSingle();
        if (!habit) return false;
        const { error } = await supabase.from('action_items').delete().eq('id', habit.id);
        return !error;
      }

      case 'createActionItem': {
        const { error } = await supabase.from('action_items').insert({
          user_id: user.id, type: 'task', source: 'aurora', status: 'todo',
          title: command.title, scheduled_date: new Date().toISOString().slice(0, 10),
        });
        return !error;
      }

      case 'createDoneActionItem': {
        const scheduledDate = command.scheduledDate || new Date().toISOString().slice(0, 10);
        const { error } = await supabase.from('action_items').insert({
          user_id: user.id, type: 'task', source: 'aurora', status: 'done',
          title: command.title, scheduled_date: scheduledDate,
          completed_at: new Date().toISOString(),
        });
        return !error;
      }

      case 'completeActionItem': {
        const isUuid = /^[a-f0-9-]{36}$/.test(command.identifier);
        if (isUuid) {
          const { error } = await supabase.from('action_items')
            .update({ status: 'done', completed_at: new Date().toISOString() })
            .eq('id', command.identifier).eq('user_id', user.id);
          return !error;
        }
        const { data: item } = await supabase.from('action_items')
          .select('id').eq('user_id', user.id).in('status', ['todo', 'doing'])
          .ilike('title', `%${command.identifier}%`).limit(1).maybeSingle();
        if (!item) return false;
        const { error } = await supabase.from('action_items')
          .update({ status: 'done', completed_at: new Date().toISOString() })
          .eq('id', item.id);
        return !error;
      }

      case 'completeHabit': {
        const { data: habit } = await supabase.from('action_items')
          .select('id').eq('user_id', user.id).eq('type', 'habit').in('status', ['todo', 'doing'])
          .ilike('title', `%${command.name}%`).limit(1).maybeSingle();
        if (!habit) return false;
        const { error } = await supabase.from('action_items')
          .update({ status: 'done', completed_at: new Date().toISOString() })
          .eq('id', habit.id);
        return !error;
      }

      case 'deleteActionItem': {
        const isUuid = /^[a-f0-9-]{36}$/.test(command.identifier);
        if (isUuid) {
          const { error } = await supabase.from('action_items').delete().eq('id', command.identifier).eq('user_id', user.id);
          return !error;
        }
        const { data: item } = await supabase.from('action_items')
          .select('id').eq('user_id', user.id)
          .ilike('title', `%${command.identifier}%`).limit(1).maybeSingle();
        if (!item) return false;
        const { error } = await supabase.from('action_items').delete().eq('id', item.id);
        return !error;
      }

      default:
        return false;
    }
  }, [user?.id]);

  /** Extract all pending changes from Aurora's response and resolve human-readable titles */
  const extractPendingChanges = useCallback(async (fullText: string): Promise<PendingChange[]> => {
    const changes: PendingChange[] = [];

    // Parse standard commands
    const commands = parseAllTags(fullText);
    
    // Collect UUIDs that need title resolution
    const uuidsToResolve = new Set<string>();
    for (const cmd of commands) {
      if ('identifier' in cmd && typeof cmd.identifier === 'string' && cmd.identifier.length > 8) {
        uuidsToResolve.add(cmd.identifier);
      }
    }

    // Batch-fetch task titles from DB
    const titleMap = new Map<string, string>();
    if (uuidsToResolve.size > 0) {
      const { data: tasks } = await supabase
        .from('action_items')
        .select('id, title')
        .in('id', Array.from(uuidsToResolve));
      if (tasks) {
        for (const t of tasks) titleMap.set(t.id, t.title);
      }
    }

    // Deduplicate commands by type+title/identifier
    const seen = new Set<string>();
    for (const cmd of commands) {
      // Build dedup key
      let dedupKey = cmd.type;
      if ('title' in cmd && typeof cmd.title === 'string') dedupKey += ':' + cmd.title.toLowerCase().trim();
      if ('identifier' in cmd && typeof cmd.identifier === 'string') dedupKey += ':' + cmd.identifier.toLowerCase().trim();
      if ('name' in cmd && typeof cmd.name === 'string') dedupKey += ':' + cmd.name.toLowerCase().trim();
      
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      const desc = describeCommand(cmd, isHe);
      if ('identifier' in cmd && typeof cmd.identifier === 'string') {
        const resolvedTitle = titleMap.get(cmd.identifier);
        if (resolvedTitle) desc.description = resolvedTitle;
      }
      changes.push({
        label: desc.label,
        description: desc.description,
        command: cmd,
        rawTag: '',
      });
    }

    // Parse practice commands
    const practiceAddRegex = /\[practice:add:([a-f0-9-]+):(\d+):(\w+):(true|false)\]/g;
    const practiceRemoveRegex = /\[practice:remove:([a-f0-9-]+)\]/g;
    const practiceUpdateRegex = /\[practice:update:([a-f0-9-]+):(.+?)\]/g;

    let match;
    while ((match = practiceAddRegex.exec(fullText)) !== null) {
      changes.push({
        label: isHe ? 'הוספת תרגול' : 'Add Practice',
        description: `${match[2]}min, ${match[3]}`,
        command: null,
        rawTag: match[0],
      });
    }
    while ((match = practiceRemoveRegex.exec(fullText)) !== null) {
      changes.push({
        label: isHe ? 'הסרת תרגול' : 'Remove Practice',
        description: `ID: ${match[1].slice(0, 8)}…`,
        command: null,
        rawTag: match[0],
      });
    }
    while ((match = practiceUpdateRegex.exec(fullText)) !== null) {
      changes.push({
        label: isHe ? 'עדכון תרגול' : 'Update Practice',
        description: match[2],
        command: null,
        rawTag: match[0],
      });
    }

    return changes;
  }, [isHe]);

  /** Execute all approved changes */
  const executeAllChanges = useCallback(async () => {
    if (!user?.id || pendingChanges.length === 0) return;
    setIsExecuting(true);

    let successCount = 0;

    // Execute practice raw tags
    for (const change of pendingChanges) {
      if (change.rawTag && !change.command) {
        // Practice add
        const addMatch = change.rawTag.match(/\[practice:add:([a-f0-9-]+):(\d+):(\w+):(true|false)\]/);
        if (addMatch) {
          const { error } = await supabase.from('user_practices').insert({
            user_id: user.id, practice_id: addMatch[1],
            duration_minutes: parseInt(addMatch[2]), frequency: addMatch[3],
            is_core: addMatch[4] === 'true',
          });
          if (!error) successCount++;
          continue;
        }
        // Practice remove
        const removeMatch = change.rawTag.match(/\[practice:remove:([a-f0-9-]+)\]/);
        if (removeMatch) {
          const { error } = await supabase.from('user_practices').delete().eq('id', removeMatch[1]);
          if (!error) successCount++;
          continue;
        }
        // Practice update
        const updateMatch = change.rawTag.match(/\[practice:update:([a-f0-9-]+):(.+?)\]/);
        if (updateMatch) {
          const updates: Record<string, any> = {};
          updateMatch[2].split('|').forEach(pair => {
            const [k, ...v] = pair.split('=');
            if (k && v.length) {
              const val = v.join('=').trim();
              updates[k.trim()] = val === 'true' ? true : val === 'false' ? false : isNaN(Number(val)) ? val : Number(val);
            }
          });
          if (Object.keys(updates).length > 0) {
            const { error } = await supabase.from('user_practices').update(updates).eq('id', updateMatch[1]);
            if (!error) successCount++;
          }
          continue;
        }
      }

      // Execute standard commands
      if (change.command) {
        try {
          const success = await executeCommand(change.command);
          if (success) successCount++;
        } catch (err) {
          console.error('Command execution error:', err);
        }
      }
    }

    if (successCount > 0) {
      invalidatePlanQueries();
      setAppliedCount(prev => prev + successCount);
      toast.success(
        isHe
          ? `✅ ${successCount} שינויים הוחלו בהצלחה`
          : `✅ ${successCount} changes applied successfully`
      );
    } else {
      toast.error(isHe ? 'לא הצלחתי להחיל שינויים' : 'Failed to apply changes');
    }

    setPendingChanges([]);
    setPendingRawText('');
    setIsExecuting(false);
  }, [user?.id, pendingChanges, executeCommand, invalidatePlanQueries, isHe]);

  const rejectChanges = useCallback(() => {
    setPendingChanges([]);
    setPendingRawText('');
    // Add a message indicating the user rejected
    setMessages(prev => [
      ...prev,
      { role: 'user', content: isHe ? 'ביטלתי את השינויים' : 'I rejected the changes' },
    ]);
    toast.info(isHe ? 'השינויים בוטלו' : 'Changes cancelled');
  }, [isHe]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user?.id || isStreaming || pendingChanges.length > 0) return;

    const userMsg: ChatMsg = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsStreaming(true);

    let assistantText = '';

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/plan-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast.error(isHe ? 'יותר מדי בקשות, נסה שוב בעוד רגע' : 'Too many requests, try again shortly');
        } else if (resp.status === 402) {
          toast.error(isHe ? 'נדרש תשלום' : 'Payment required');
        }
        throw new Error('Stream failed');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantText += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m);
                }
                return [...prev, { role: 'assistant', content: assistantText }];
              });
            }
          } catch {
            // partial JSON, wait for more
          }
        }
      }

      // After streaming complete, extract commands and show confirmation
      if (assistantText) {
        const changes = await extractPendingChanges(assistantText);
        if (changes.length > 0) {
          setPendingChanges(changes);
          setPendingRawText(assistantText);
        }
      }
    } catch (err) {
      console.error('Plan chat error:', err);
      if (!assistantText) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: isHe ? 'שגיאה בתקשורת. נסה שוב.' : 'Communication error. Please try again.' },
        ]);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const quickActions = isHe ? QUICK_ACTIONS_HE : QUICK_ACTIONS_EN;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent preventClose className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border/50 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="block">{isHe ? 'דבר עם התוכנית' : 'Talk to Your Plan'}</span>
              <span className="block text-[10px] font-normal text-muted-foreground">
                {isHe ? 'שינויים כירורגיים בלבד — בלי ליצור מחדש' : 'Surgical changes only — no regeneration'}
              </span>
            </div>
            {appliedCount > 0 && (
              <span className="ms-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                {appliedCount} {isHe ? 'שינויים' : 'changes'}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Messages — uses Aurora's chat message components */}
        <ScrollArea className="flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    {isHe ? 'מה תרצה לשנות בתוכנית?' : 'What would you like to change?'}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    {isHe
                      ? 'אני יכולה להוסיף ולהסיר תרגולים, לשנות אבני דרך, להחליף משימות ועוד — בלי ליצור תוכנית חדשה'
                      : 'I can add/remove practices, modify milestones, swap tasks and more — without creating a new plan'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center max-w-sm">
                  {quickActions.map((qa, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(qa)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all"
                    >
                      {qa}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <AuroraChatMessage
                    key={i}
                    id={`plan-chat-${i}`}
                    content={msg.role === 'assistant' ? stripAllTags(msg.content) : msg.content}
                    isOwn={msg.role === 'user'}
                    isAI={msg.role === 'assistant'}
                    isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                  />
                ))}

                {/* Typing indicator — same as Aurora's page */}
                {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                  <AuroraTypingIndicator />
                )}

                {/* Confirmation card for pending changes */}
                {pendingChanges.length > 0 && !isStreaming && (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                    <p className="text-sm font-semibold text-foreground">
                      {isHe ? `🔧 ${pendingChanges.length} שינויים מוצעים:` : `🔧 ${pendingChanges.length} proposed changes:`}
                    </p>
                    <ul className="space-y-1.5 text-sm">
                      {pendingChanges.map((change, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">{change.label}</span>
                            {change.description && ` — ${change.description}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={executeAllChanges}
                        disabled={isExecuting}
                        className="gap-1.5"
                      >
                        {isExecuting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {isHe ? 'אשר והחל' : 'Approve & Apply'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={rejectChanges}
                        disabled={isExecuting}
                        className="gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        {isHe ? 'בטל' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input — full Aurora input with TTS, voice recording, voice mode */}
        <AuroraChatInput
          onSend={sendMessage}
          disabled={isStreaming || pendingChanges.length > 0}
          bypassLimits
        />
      </DialogContent>
    </Dialog>
  );
}
