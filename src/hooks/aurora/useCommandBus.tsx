import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { useChecklistsData } from './useChecklistsData';
import { useDailyHabits } from './useDailyHabits';
import { useAuroraReminders } from './useAuroraReminders';
import { useActionTrust } from './useActionTrust';
import { debug } from '@/lib/debug';
import { toast } from '@/hooks/use-toast';
import {
  AppCommand,
  classifyRisk,
  describeCommand,
  type CommandType,
} from '@/lib/commandBus';
import { CheckCircle2, Trash2, Plus, Calendar, RefreshCw, Target, Sparkles, Clock, Edit } from 'lucide-react';

// ─── Action Receipt ──────────────────────────────────────────────────────────

export interface ActionReceipt {
  type: 'task' | 'habit' | 'checklist' | 'reminder' | 'focus' | 'identity' | 'milestone' | 'plan';
  action: 'create' | 'complete' | 'delete' | 'rename' | 'reschedule' | 'archive' | 'update' | 'remove';
  success: boolean;
  target: string;
  details?: string;
  timestamp: string;
}

// ─── Pending Command ─────────────────────────────────────────────────────────

export interface PendingCommand {
  id: string;
  command: AppCommand;
  label: string;
  description: string;
  actionType: string;
}

// ─── Toast Config ────────────────────────────────────────────────────────────

const TOAST_CONFIGS: Record<string, { titleHe: string; titleEn: string }> = {
  'task:create': { titleHe: '➕ משימה נוספה', titleEn: '➕ Task added' },
  'task:complete': { titleHe: '✅ משימה הושלמה!', titleEn: '✅ Task completed!' },
  'task:delete': { titleHe: '🗑️ משימה נמחקה', titleEn: '🗑️ Task deleted' },
  'task:reschedule': { titleHe: '📅 משימה נדחתה', titleEn: '📅 Task rescheduled' },
  'checklist:create': { titleHe: '📋 רשימה נוצרה', titleEn: '📋 Checklist created' },
  'checklist:archive': { titleHe: '📦 רשימה הועברה לארכיון', titleEn: '📦 Checklist archived' },
  'checklist:rename': { titleHe: '✏️ שם הרשימה שונה', titleEn: '✏️ Checklist renamed' },
  'habit:create': { titleHe: '🔄 הרגל חדש נוצר', titleEn: '🔄 New habit created' },
  'habit:complete': { titleHe: '💪 הרגל הושלם!', titleEn: '💪 Habit completed!' },
  'habit:remove': { titleHe: '🗑️ הרגל הוסר', titleEn: '🗑️ Habit removed' },
  'reminder:create': { titleHe: '⏰ תזכורת נוצרה', titleEn: '⏰ Reminder set' },
  'focus:create': { titleHe: '🎯 פוקוס הוגדר', titleEn: '🎯 Focus set' },
  'milestone:complete': { titleHe: '🏆 שבוע הושלם!', titleEn: '🏆 Week completed!' },
  'identity:update': { titleHe: '✨ זהות עודכנה', titleEn: '✨ Identity updated' },
  'plan:update': { titleHe: '📝 תוכנית עודכנה', titleEn: '📝 Plan updated' },
  'plan:bulk_replace': { titleHe: '🔄 החלפה גורפת בתוכנית', titleEn: '🔄 Bulk plan replace' },
  'milestone:create': { titleHe: '📌 אבן דרך נוספה', titleEn: '📌 Milestone added' },
  'milestone:delete': { titleHe: '🗑️ אבן דרך הוסרה', titleEn: '🗑️ Milestone removed' },
};

function showReceiptToast(receipt: ActionReceipt, isHebrew: boolean) {
  const key = `${receipt.type}:${receipt.action}`;
  const cfg = TOAST_CONFIGS[key] || { titleHe: '✓ פעולה בוצעה', titleEn: '✓ Action completed' };
  toast({
    title: isHebrew ? cfg.titleHe : cfg.titleEn,
    description: receipt.target + (receipt.details ? ` - ${receipt.details}` : ''),
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useCommandBus = () => {
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHebrew = language === 'he';
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const queryClient = useQueryClient();
  const { openHypnosis, openSettings, openProfile, openUpgrade } = useAuroraActions();

  const {
    createChecklist,
    addChecklistItem,
    completeChecklistItem,
    rescheduleItem,
    archiveChecklist,
    deleteItem,
    updateChecklistTitle,
    findMatchingItems,
    findMatchingChecklists,
    checklists,
  } = useChecklistsData(user ?? null);

  const { habits, completeHabit } = useDailyHabits(user ?? null);
  const { createReminder } = useAuroraReminders(user ?? null);
  const {
    shouldAutoExecute,
    getTrustLevel,
    setTrustLevel,
    recordExecution,
    loadPreferences,
  } = useActionTrust();

  const [pendingCommands, setPendingCommands] = useState<PendingCommand[]>([]);
  const [lastReceipts, setLastReceipts] = useState<ActionReceipt[]>([]);

  // Load trust preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // ─── Executors ───────────────────────────────────────────────────────────

  const executeCommand = useCallback(async (command: AppCommand): Promise<ActionReceipt | null> => {
    if (!user?.id && command.type !== 'openTab' && command.type !== 'setTheme' && command.type !== 'toggleTheme') {
      return null;
    }

    const makeReceipt = (
      type: ActionReceipt['type'],
      action: ActionReceipt['action'],
      success: boolean,
      target: string,
      details?: string
    ): ActionReceipt => ({
      type, action, success, target, details,
      timestamp: new Date().toISOString(),
    });

    switch (command.type) {
      // ── Navigation ──
      case 'openTab': {
        const routes: Record<string, string> = { today: '/today', plan: '/plan', aurora: '/aurora', me: '/me' };
        navigate(routes[command.tabId] || '/today');
        return null; // no receipt for nav
      }
      case 'openModal': {
        const openers: Record<string, () => void> = {
          hypnosis: openHypnosis,
          settings: openSettings,
          profile: openProfile,
          upgrade: openUpgrade,
        };
        openers[command.modalId]?.();
        return null;
      }

      // ── Theme ──
      case 'setTheme':
        setTheme(command.value);
        return null;
      case 'toggleTheme':
        setTheme(theme === 'dark' ? 'light' : 'dark');
        return null;

      // ── Checklist CRUD ──
      case 'createChecklist': {
        const matchResult = findMatchingChecklists(command.title);
        if (matchResult.isAmbiguous) { debug.log(`Ambiguous checklist: "${command.title}"`); return null; }
        const result = await createChecklist(command.title, 'aurora');
        return makeReceipt('checklist', 'create', !!result, command.title);
      }
      case 'archiveChecklist': {
        const matchResult = findMatchingChecklists(command.title);
        if (matchResult.isAmbiguous) return null;
        const cl = matchResult.checklists[0];
        if (!cl) return null;
        const ok = await archiveChecklist(cl.id);
        return makeReceipt('checklist', 'archive', ok, cl.title);
      }
      case 'renameChecklist': {
        const matchResult = findMatchingChecklists(command.oldTitle);
        if (matchResult.isAmbiguous) return null;
        const cl = matchResult.checklists[0];
        if (!cl) return null;
        const ok = await updateChecklistTitle(cl.id, command.newTitle);
        return makeReceipt('checklist', 'rename', ok, command.newTitle, `${command.oldTitle} → ${command.newTitle}`);
      }

      // ── Action Items ──
      case 'createActionItem': {
        const result = await addChecklistItem(command.checklistTitle || 'Tasks', command.title);
        return makeReceipt('task', 'create', !!result, command.title, command.checklistTitle);
      }
      case 'completeActionItem': {
        const matchResult = findMatchingItems(command.identifier, { checklistTitle: command.checklistTitle });
        if (matchResult.isAmbiguous) { debug.log(`Ambiguous task: "${command.identifier}"`); return null; }
        const ok = await completeChecklistItem(command.checklistTitle || '', command.identifier);
        return makeReceipt('task', 'complete', ok, command.identifier, command.checklistTitle);
      }
      case 'deleteActionItem': {
        const matchResult = findMatchingItems(command.identifier, { checklistTitle: command.checklistTitle });
        if (matchResult.isAmbiguous) return null;
        const item = matchResult.items[0];
        if (!item) return null;
        const ok = await deleteItem(item.id);
        return makeReceipt('task', 'delete', ok, command.identifier, command.checklistTitle);
      }
      case 'rescheduleActionItem': {
        const matchResult = findMatchingItems(command.identifier, { checklistTitle: command.checklistTitle });
        if (matchResult.isAmbiguous) return null;
        const ok = await rescheduleItem(command.checklistTitle || '', command.identifier, command.newDate);
        return makeReceipt('task', 'reschedule', ok, command.identifier, `→ ${command.newDate}`);
      }

      // ── Habits ──
      case 'createHabit': {
        if (!user?.id) return null;
        let habitsChecklist = checklists.find(c => c.title === '🔄 הרגלים יומיים' || c.title === '🔄 Daily Habits');
        if (!habitsChecklist) {
          habitsChecklist = await createChecklist('🔄 הרגלים יומיים', 'aurora') as any;
        }
        if (!habitsChecklist) return makeReceipt('habit', 'create', false, command.name);
        const { error } = await supabase.from('aurora_checklist_items').insert({
          checklist_id: habitsChecklist.id,
          content: command.name,
          is_recurring: true,
          is_completed: false,
          order_index: 0,
        });
        queryClient.invalidateQueries({ queryKey: ['daily-habits'] });
        return makeReceipt('habit', 'create', !error, command.name);
      }
      case 'completeHabit': {
        const matching = habits.filter(h =>
          h.content.toLowerCase().includes(command.name.toLowerCase()) ||
          command.name.toLowerCase().includes(h.content.toLowerCase())
        );
        if (matching.length > 1) { debug.log(`Ambiguous habit: "${command.name}"`); return null; }
        const habit = matching[0];
        if (!habit) return null;
        const ok = await completeHabit(habit.id, 'aurora');
        return makeReceipt('habit', 'complete', ok, habit.content);
      }
      case 'removeHabit': {
        const matching = habits.find(h =>
          h.content.toLowerCase().includes(command.name.toLowerCase()) ||
          command.name.toLowerCase().includes(h.content.toLowerCase())
        );
        if (!matching) return null;
        const { error } = await supabase.from('aurora_checklist_items').delete().eq('id', matching.id);
        queryClient.invalidateQueries({ queryKey: ['daily-habits'] });
        return makeReceipt('habit', 'remove', !error, matching.content);
      }

      // ── Milestone ──
      case 'completeMilestone': {
        if (!user?.id) return null;
        const { data: plan } = await supabase.from('life_plans').select('id').eq('user_id', user.id).eq('status', 'active').single();
        if (!plan) return null;
        const { error } = await supabase.from('life_plan_milestones')
          .update({ is_completed: true, completed_at: new Date().toISOString() })
          .eq('plan_id', plan.id).eq('week_number', command.weekNumber);
        if (!error) {
          await supabase.rpc('award_unified_xp', { p_user_id: user.id, p_amount: 50, p_source: 'milestone', p_reason: `Week ${command.weekNumber} completed` });
          queryClient.invalidateQueries({ queryKey: ['life-plan'] });
        }
        return makeReceipt('milestone', 'complete', !error, isHebrew ? `שבוע ${command.weekNumber}` : `Week ${command.weekNumber}`);
      }

      // ── Plan Update ──
      case 'updatePlan': {
        if (!user?.id) return null;
        const { data: plan } = await supabase.from('life_plans').select('id').eq('user_id', user.id).eq('status', 'active').single();
        if (!plan) return null;
        const updateData: Record<string, string> = { [command.field]: command.value };
        const { error } = await supabase.from('life_plan_milestones').update(updateData).eq('plan_id', plan.id).eq('week_number', command.weekNumber);
        queryClient.invalidateQueries({ queryKey: ['life-plan'] });
        return makeReceipt('plan', 'update', !error, `Week ${command.weekNumber}`, `${command.field}: ${command.value}`);
      }

      // ── Edit Milestone by ID ──
      case 'editMilestone': {
        if (!user?.id) return null;
        const allowedFields = ['title', 'title_en', 'description', 'description_en', 'goal', 'goal_en', 'focus_area', 'focus_area_en', 'challenge', 'hypnosis_recommendation'];
        const safeUpdates: Record<string, string> = {};
        for (const [k, v] of Object.entries(command.updates)) {
          if (allowedFields.includes(k)) safeUpdates[k] = v;
        }
        if (Object.keys(safeUpdates).length === 0) return null;
        const { error } = await supabase.from('life_plan_milestones').update(safeUpdates).eq('id', command.milestoneId);
        queryClient.invalidateQueries({ queryKey: ['life-plan'] });
        return makeReceipt('plan', 'update', !error, command.milestoneId, Object.keys(safeUpdates).join(', '));
      }

      // ── Add Task to Milestone ──
      case 'addMilestoneTask': {
        if (!user?.id) return null;
        const { data: plan } = await supabase.from('life_plans').select('id').eq('user_id', user.id).eq('status', 'active').single();
        if (!plan) return null;
        const { data: milestone } = await supabase.from('life_plan_milestones').select('id, tasks').eq('plan_id', plan.id).eq('week_number', command.weekNumber).single();
        if (!milestone) return null;
        const tasks = Array.isArray(milestone.tasks) ? [...milestone.tasks] : [];
        tasks.push(command.task);
        const { error } = await supabase.from('life_plan_milestones').update({ tasks }).eq('id', milestone.id);
        queryClient.invalidateQueries({ queryKey: ['life-plan'] });
        return makeReceipt('plan', 'update', !error, `Week ${command.weekNumber}`, `+${command.task}`);
      }

      // ── Remove Task from Milestone ──
      case 'removeMilestoneTask': {
        if (!user?.id) return null;
        const { data: plan } = await supabase.from('life_plans').select('id').eq('user_id', user.id).eq('status', 'active').single();
        if (!plan) return null;
        const { data: milestone } = await supabase.from('life_plan_milestones').select('id, tasks').eq('plan_id', plan.id).eq('week_number', command.weekNumber).single();
        if (!milestone) return null;
        const tasks = Array.isArray(milestone.tasks) ? [...milestone.tasks] : [];
        if (command.taskIndex < 0 || command.taskIndex >= tasks.length) return null;
        const removed = tasks.splice(command.taskIndex, 1);
        const { error } = await supabase.from('life_plan_milestones').update({ tasks }).eq('id', milestone.id);
        queryClient.invalidateQueries({ queryKey: ['life-plan'] });
        return makeReceipt('plan', 'update', !error, `Week ${command.weekNumber}`, `-${removed[0]}`);
      }

      // ── Replace Task in Milestone ──
      case 'replaceMilestoneTask': {
        if (!user?.id) return null;
        const { data: plan } = await supabase.from('life_plans').select('id').eq('user_id', user.id).eq('status', 'active').single();
        if (!plan) return null;
        const { data: milestone } = await supabase.from('life_plan_milestones').select('id, tasks').eq('plan_id', plan.id).eq('week_number', command.weekNumber).single();
        if (!milestone) return null;
        const tasks = Array.isArray(milestone.tasks) ? [...milestone.tasks] : [];
        if (command.taskIndex < 0 || command.taskIndex >= tasks.length) return null;
        const old = tasks[command.taskIndex];
        tasks[command.taskIndex] = command.newTask;
        const { error } = await supabase.from('life_plan_milestones').update({ tasks }).eq('id', milestone.id);
        queryClient.invalidateQueries({ queryKey: ['life-plan'] });
        return makeReceipt('plan', 'update', !error, `Week ${command.weekNumber}`, `${old} → ${command.newTask}`);
      }

      // ── Add Milestone ──
      case 'addMilestone': {
        if (!user?.id) return null;
        const { data: plan } = await supabase.from('life_plans').select('id').eq('user_id', user.id).eq('status', 'active').single();
        if (!plan) return null;
        const { error } = await supabase.from('life_plan_milestones').insert({
          plan_id: plan.id,
          week_number: command.weekNumber,
          month_number: Math.ceil(command.weekNumber / 4),
          title: command.title,
          goal: command.goal || null,
          focus_area: command.focusArea || null,
        });
        queryClient.invalidateQueries({ queryKey: ['life-plan'] });
        return makeReceipt('milestone', 'create', !error, command.title, `Week ${command.weekNumber}`);
      }

      // ── Remove Milestone ──
      case 'removeMilestone': {
        if (!user?.id) return null;
        const { data: plan } = await supabase.from('life_plans').select('id').eq('user_id', user.id).eq('status', 'active').single();
        if (!plan) return null;
        const { error } = await supabase.from('life_plan_milestones').delete().eq('plan_id', plan.id).eq('week_number', command.weekNumber);
        queryClient.invalidateQueries({ queryKey: ['life-plan'] });
        return makeReceipt('milestone', 'delete', !error, isHebrew ? `שבוע ${command.weekNumber}` : `Week ${command.weekNumber}`);
      }

      // ── Bulk Replace across all milestones ──
      case 'bulkReplacePlan': {
        if (!user?.id) return null;
        const { data: plan } = await supabase.from('life_plans').select('id').eq('user_id', user.id).eq('status', 'active').single();
        if (!plan) return null;
        const { data: milestones } = await supabase.from('life_plan_milestones').select('id, title, title_en, goal, goal_en, description, description_en, focus_area, focus_area_en, tasks, tasks_en').eq('plan_id', plan.id);
        if (!milestones) return null;
        const regex = new RegExp(command.oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        let updatedCount = 0;
        for (const m of milestones) {
          const updates: Record<string, any> = {};
          for (const field of ['title', 'title_en', 'goal', 'goal_en', 'description', 'description_en', 'focus_area', 'focus_area_en'] as const) {
            const val = (m as any)[field];
            if (typeof val === 'string' && regex.test(val)) {
              updates[field] = val.replace(regex, command.newText);
              regex.lastIndex = 0;
            }
          }
          // Handle tasks arrays
          for (const taskField of ['tasks', 'tasks_en'] as const) {
            const tasks = (m as any)[taskField];
            if (Array.isArray(tasks)) {
              const newTasks = tasks.map((t: any) => {
                if (typeof t === 'string') return t.replace(regex, command.newText);
                if (t && typeof t === 'object' && typeof t.title === 'string') {
                  regex.lastIndex = 0;
                  return { ...t, title: t.title.replace(regex, command.newText) };
                }
                return t;
              });
              regex.lastIndex = 0;
              if (JSON.stringify(newTasks) !== JSON.stringify(tasks)) {
                updates[taskField] = newTasks;
              }
            }
          }
          if (Object.keys(updates).length > 0) {
            await supabase.from('life_plan_milestones').update(updates).eq('id', m.id);
            updatedCount++;
          }
        }
        queryClient.invalidateQueries({ queryKey: ['life-plan'] });
        return makeReceipt('plan', 'update', updatedCount > 0, `${command.oldText} → ${command.newText}`, `${updatedCount} ${isHebrew ? 'אבני דרך עודכנו' : 'milestones updated'}`);
      }

      // ── Identity ──
      case 'addIdentity': {
        if (!user?.id) return null;
        const { error } = await supabase.from('aurora_identity_elements').insert({ user_id: user.id, element_type: command.elementType, content: command.content });
        queryClient.invalidateQueries({ queryKey: ['aurora-life-model'] });
        return makeReceipt('identity', 'update', !error, command.content, command.elementType);
      }
      case 'removeIdentity': {
        if (!user?.id) return null;
        const { error } = await supabase.from('aurora_identity_elements').delete().eq('user_id', user.id).eq('element_type', command.elementType).ilike('content', `%${command.content}%`);
        queryClient.invalidateQueries({ queryKey: ['aurora-life-model'] });
        return makeReceipt('identity', 'remove', !error, command.content, command.elementType);
      }

      // ── Reminder / Focus ──
      case 'setReminder': {
        // Build full datetime if time is provided
        const reminderDate = command.time ? `${command.date}T${command.time}:00` : command.date;
        const ok = await createReminder(command.message, reminderDate);
        return makeReceipt('reminder', 'create', ok, command.message, command.time ? `${command.date} ${command.time}` : command.date);
      }
      case 'setFocus': {
        if (!user?.id) return null;
        await supabase.from('aurora_focus_plans').update({ status: 'completed' }).eq('user_id', user.id).eq('status', 'active');
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + command.days);
        const { error } = await supabase.from('aurora_focus_plans').insert({
          user_id: user.id, title: command.title, duration_days: command.days,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
        });
        queryClient.invalidateQueries({ queryKey: ['aurora-life-model'] });
        return makeReceipt('focus', 'create', !error, command.title, `${command.days} ${isHebrew ? 'ימים' : 'days'}`);
      }

      // ── Analysis ──
      case 'triggerAnalysis':
        // Handled externally by useAuroraChat
        return null;

      default:
        return null;
    }
  }, [
    user, navigate, setTheme, theme, queryClient, isHebrew,
    openHypnosis, openSettings, openProfile, openUpgrade,
    createChecklist, addChecklistItem, completeChecklistItem, rescheduleItem,
    archiveChecklist, deleteItem, updateChecklistTitle,
    findMatchingItems, findMatchingChecklists, checklists,
    habits, completeHabit, createReminder,
  ]);

  // ─── Dispatch with trust checks ──────────────────────────────────────────

  const dispatchCommands = useCallback(async (commands: AppCommand[]): Promise<ActionReceipt[]> => {
    const receipts: ActionReceipt[] = [];
    const pending: PendingCommand[] = [];

    for (const command of commands) {
      const risk = classifyRisk(command);

      if (risk === 'safe') {
        // Always auto-execute safe commands
        const receipt = await executeCommand(command);
        if (receipt?.success) {
          showReceiptToast(receipt, isHebrew);
          receipts.push(receipt);
          recordExecution(command.type);
        }
      } else if (risk === 'moderate' || risk === 'destructive') {
        const trustLevel = getTrustLevel(command.type);
        const autoExec = shouldAutoExecute(command.type);

        // Moderate defaults to auto for most users; destructive requires explicit trust
        const shouldAuto = autoExec || (risk === 'moderate' && trustLevel !== 'always_ask');

        if (shouldAuto) {
          const receipt = await executeCommand(command);
          if (receipt?.success) {
            showReceiptToast(receipt, isHebrew);
            receipts.push(receipt);
            recordExecution(command.type);
          }
        } else {
          // Queue for confirmation
          const desc = describeCommand(command, isHebrew);
          pending.push({
            id: `${command.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            command,
            label: desc.label,
            description: desc.description,
            actionType: desc.actionType,
          });
        }
      }
    }

    if (pending.length > 0) {
      setPendingCommands(prev => [...prev, ...pending]);
    }

    setLastReceipts(receipts);
    return receipts;
  }, [executeCommand, isHebrew, shouldAutoExecute, getTrustLevel, recordExecution]);

  // ─── Confirm / Reject ────────────────────────────────────────────────────

  const confirmCommand = useCallback(async (pendingId: string, alwaysAllow = false) => {
    const pending = pendingCommands.find(p => p.id === pendingId);
    if (!pending) return;

    if (alwaysAllow) {
      await setTrustLevel(pending.command.type, 'auto_execute');
    }

    const receipt = await executeCommand(pending.command);
    if (receipt?.success) {
      showReceiptToast(receipt, isHebrew);
      recordExecution(pending.command.type);
    }

    setPendingCommands(prev => prev.filter(p => p.id !== pendingId));
  }, [pendingCommands, executeCommand, isHebrew, setTrustLevel, recordExecution]);

  const rejectCommand = useCallback((pendingId: string) => {
    setPendingCommands(prev => prev.filter(p => p.id !== pendingId));
  }, []);

  return {
    dispatchCommands,
    pendingCommands,
    confirmCommand,
    rejectCommand,
    lastReceipts,
  };
};
