import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

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

interface Milestone {
  id: string;
  week_number: number;
  title: string;
  tasks: string[];
  goal: string;
  is_completed: boolean;
}

/**
 * Data-only hook for checklists - no UI dependencies like useAuth or useTranslation.
 * This prevents "Should have a queue" React errors when used inside useAuroraChat.
 * Pass the user object as a parameter instead of calling useAuth.
 */
export const useChecklistsData = (user: User | null) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync current week's tasks from life plan milestones
  const syncWeeklyTasks = useCallback(async (userId: string) => {
    try {
      // Get active life plan
      const { data: lifePlan } = await supabase
        .from('life_plans')
        .select('id, start_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!lifePlan) return;

      // Calculate current week number based on start_date
      const startDate = new Date(lifePlan.start_date);
      const today = new Date();
      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const currentWeek = Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));

      // Get current week's milestone
      const { data: milestone } = await supabase
        .from('life_plan_milestones')
        .select('id, week_number, title, tasks, goal, is_completed')
        .eq('plan_id', lifePlan.id)
        .eq('week_number', currentWeek)
        .single();

      // Early return if no milestone found
      if (!milestone) return;

      // Cast tasks to string array
      const tasks = Array.isArray(milestone.tasks) ? milestone.tasks as string[] : [];
      if (!tasks.length) return;

      // Check if weekly checklist already exists and is up to date
      const weeklyTitle = `📅 שבוע ${currentWeek} - ${milestone.title}`;
      
      const { data: existingChecklist } = await supabase
        .from('aurora_checklists')
        .select('id, title')
        .eq('user_id', userId)
        .eq('status', 'active')
        .like('title', `📅 שבוע ${currentWeek}%`)
        .single();

      // If checklist for current week already exists with same tasks, skip
      if (existingChecklist) {
        const { data: existingItems } = await supabase
          .from('aurora_checklist_items')
          .select('content')
          .eq('checklist_id', existingChecklist.id);

        const existingContents = existingItems?.map(i => i.content) || [];
        const allTasksExist = tasks.every((task: string) => 
          existingContents.some(c => c === task)
        );

        if (allTasksExist) return; // Already synced
      }

      // Archive old weekly checklists (from previous weeks)
      await supabase
        .from('aurora_checklists')
        .update({ status: 'archived' })
        .eq('user_id', userId)
        .like('title', '📅 שבוע %')
        .neq('title', weeklyTitle);

      // Create or update current week's checklist
      if (!existingChecklist) {
        const { data: newChecklist } = await supabase
          .from('aurora_checklists')
          .insert({
            user_id: userId,
            title: weeklyTitle,
            origin: 'aurora',
            context: `שבוע ${currentWeek} מתוך תוכנית 90 הימים | יעד: ${milestone.goal}`,
            status: 'active',
          })
          .select()
          .single();

        if (newChecklist) {
          // Add tasks as items (use the already-cast tasks variable)
          const items = tasks.map((task: string, index: number) => ({
            checklist_id: newChecklist.id,
            content: task,
            order_index: index,
            is_completed: false,
          }));

          await supabase.from('aurora_checklist_items').insert(items);
        }
      }

      console.log(`Synced week ${currentWeek} tasks for user ${userId}`);
    } catch (error) {
      console.error('Error syncing weekly tasks:', error);
    }
  }, []);

  // Fetch checklists
  useEffect(() => {
    if (!user?.id) {
      setChecklists([]);
      setLoading(false);
      return;
    }

    const fetchChecklists = async () => {
      // First sync current week's tasks
      await syncWeeklyTasks(user.id);

      const { data, error } = await supabase
        .from('aurora_checklists')
        .select('*, aurora_checklist_items(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch checklists:', error);
        return;
      }

      setChecklists((data as Checklist[]) || []);
      setLoading(false);
    };

    fetchChecklists();

    // Subscribe to changes
    const checklistChannel = supabase
      .channel('aurora-checklists')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aurora_checklists',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchChecklists()
      )
      .subscribe();

    const itemsChannel = supabase
      .channel('aurora-checklist-items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aurora_checklist_items',
        },
        () => fetchChecklists()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(checklistChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, [user?.id, syncWeeklyTasks]);

  // Create checklist
  const createChecklist = useCallback(async (title: string, origin: 'manual' | 'aurora' = 'manual', context?: string) => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from('aurora_checklists')
      .insert({
        user_id: user.id,
        title,
        origin,
        context: context || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create checklist:', error);
      return null;
    }

    return data as Checklist;
  }, [user?.id]);

  // Add item to checklist (by title or id)
  const addChecklistItem = useCallback(async (checklistTitleOrId: string, content: string) => {
    if (!user?.id) return null;

    // Find checklist by title or id
    let checklist = checklists.find(
      (c) => c.title === checklistTitleOrId || c.id === checklistTitleOrId
    );

    // If not found by title, try to create one
    if (!checklist) {
      checklist = await createChecklist(checklistTitleOrId, 'aurora') as Checklist | null;
      if (!checklist) return null;
    }

    const maxIndex = Math.max(
      0,
      ...(checklist.aurora_checklist_items?.map((i) => i.order_index) || [0])
    );

    const { data, error } = await supabase
      .from('aurora_checklist_items')
      .insert({
        checklist_id: checklist.id,
        content,
        is_completed: false,
        order_index: maxIndex + 1,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add checklist item:', error);
      return null;
    }

    return data as ChecklistItem;
  }, [user?.id, checklists, createChecklist]);

  // Complete checklist item (by title/content)
  const completeChecklistItem = useCallback(async (checklistTitle: string, itemContent: string) => {
    const checklist = checklists.find((c) => c.title === checklistTitle);
    if (!checklist) return false;

    const item = checklist.aurora_checklist_items?.find((i) => 
      i.content.toLowerCase().includes(itemContent.toLowerCase())
    );
    if (!item) return false;

    const { error } = await supabase
      .from('aurora_checklist_items')
      .update({ is_completed: true })
      .eq('id', item.id);

    if (error) {
      console.error('Failed to complete checklist item:', error);
      return false;
    }

    // Award XP
    if (user?.id) {
      await supabase.rpc('aurora_award_xp', {
        p_user_id: user.id,
        p_amount: 10,
        p_reason: 'Checklist item completed',
      });
    }

    return true;
  }, [checklists, user?.id]);

  // Toggle item completion
  const toggleItem = useCallback(async (itemId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('aurora_checklist_items')
      .update({ is_completed: isCompleted })
      .eq('id', itemId);

    if (error) {
      console.error('Failed to toggle item:', error);
      return false;
    }

    if (isCompleted && user?.id) {
      await supabase.rpc('aurora_award_xp', {
        p_user_id: user.id,
        p_amount: 10,
        p_reason: 'Checklist item completed',
      });
    }

    return true;
  }, [user?.id]);

  // Delete checklist
  const deleteChecklist = useCallback(async (checklistId: string) => {
    const { error } = await supabase
      .from('aurora_checklists')
      .delete()
      .eq('id', checklistId);

    if (error) {
      console.error('Failed to delete checklist:', error);
      return false;
    }

    return true;
  }, []);

  // Archive checklist
  const archiveChecklist = useCallback(async (checklistId: string) => {
    const { error } = await supabase
      .from('aurora_checklists')
      .update({ status: 'archived' })
      .eq('id', checklistId);

    if (error) {
      console.error('Failed to archive checklist:', error);
      return false;
    }

    return true;
  }, []);

  // Delete item
  const deleteItem = useCallback(async (itemId: string) => {
    const { error } = await supabase
      .from('aurora_checklist_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Failed to delete item:', error);
      return false;
    }

    return true;
  }, []);

  // Update item content
  const updateItemContent = useCallback(async (itemId: string, content: string) => {
    const { error } = await supabase
      .from('aurora_checklist_items')
      .update({ content })
      .eq('id', itemId);

    if (error) {
      console.error('Failed to update item:', error);
      return false;
    }

    return true;
  }, []);

  // Update checklist title
  const updateChecklistTitle = useCallback(async (checklistId: string, title: string) => {
    const { error } = await supabase
      .from('aurora_checklists')
      .update({ title })
      .eq('id', checklistId);

    if (error) {
      console.error('Failed to update checklist:', error);
      return false;
    }

    return true;
  }, []);

  // Reschedule item due date
  const rescheduleItem = useCallback(async (checklistTitle: string, itemContent: string, newDate: string) => {
    const checklist = checklists.find((c) => c.title === checklistTitle);
    if (!checklist) {
      console.error('Checklist not found:', checklistTitle);
      return false;
    }

    const item = checklist.aurora_checklist_items?.find((i) =>
      i.content.toLowerCase().includes(itemContent.toLowerCase())
    );
    if (!item) {
      console.error('Item not found:', itemContent);
      return false;
    }

    const { error } = await supabase
      .from('aurora_checklist_items')
      .update({ due_date: newDate })
      .eq('id', item.id);

    if (error) {
      console.error('Failed to reschedule item:', error);
      return false;
    }

    return true;
  }, [checklists]);

  // Add item with due date
  const addChecklistItemWithDate = useCallback(async (checklistTitleOrId: string, content: string, dueDate?: string) => {
    if (!user?.id) return null;

    // Find checklist by title or id
    let checklist = checklists.find(
      (c) => c.title === checklistTitleOrId || c.id === checklistTitleOrId
    );

    // If not found by title, try to create one
    if (!checklist) {
      checklist = await createChecklist(checklistTitleOrId, 'aurora') as Checklist | null;
      if (!checklist) return null;
    }

    const maxIndex = Math.max(
      0,
      ...(checklist.aurora_checklist_items?.map((i) => i.order_index) || [0])
    );

    const { data, error } = await supabase
      .from('aurora_checklist_items')
      .insert({
        checklist_id: checklist.id,
        content,
        is_completed: false,
        order_index: maxIndex + 1,
        due_date: dueDate || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add checklist item:', error);
      return null;
    }

    return data as ChecklistItem;
  }, [user?.id, checklists, createChecklist]);

  // Find matching items across all checklists with ambiguity detection
  const findMatchingItems = useCallback((
    query: string,
    options?: { checklistTitle?: string; exactMatch?: boolean }
  ): { items: Array<ChecklistItem & { checklistTitle: string }>; isAmbiguous: boolean } => {
    const normalizedQuery = query.toLowerCase().trim();
    const matches: Array<ChecklistItem & { checklistTitle: string }> = [];

    for (const checklist of checklists) {
      // If checklist title specified, only search in that checklist
      if (options?.checklistTitle) {
        const titleMatch = checklist.title.toLowerCase().includes(options.checklistTitle.toLowerCase());
        if (!titleMatch) continue;
      }

      for (const item of checklist.aurora_checklist_items || []) {
        const itemContent = item.content.toLowerCase();
        
        let isMatch = false;
        if (options?.exactMatch) {
          isMatch = itemContent === normalizedQuery;
        } else {
          // Fuzzy match: either contains or is contained
          isMatch = itemContent.includes(normalizedQuery) || 
                   normalizedQuery.includes(itemContent);
        }

        if (isMatch) {
          matches.push({
            ...item,
            checklistTitle: checklist.title
          });
        }
      }
    }

    return {
      items: matches,
      isAmbiguous: matches.length > 1
    };
  }, [checklists]);

  // Find matching checklists by title with ambiguity detection
  const findMatchingChecklists = useCallback((
    query: string,
    options?: { exactMatch?: boolean }
  ): { checklists: Checklist[]; isAmbiguous: boolean } => {
    const normalizedQuery = query.toLowerCase().trim();
    
    const matches = checklists.filter(c => {
      const title = c.title.toLowerCase();
      if (options?.exactMatch) {
        return title === normalizedQuery;
      }
      return title.includes(normalizedQuery) || normalizedQuery.includes(title);
    });

    return {
      checklists: matches,
      isAmbiguous: matches.length > 1
    };
  }, [checklists]);

  // Get all open tasks with their checklist info (for AI context)
  const getAllOpenTasks = useCallback((): Array<{
    id: string;
    content: string;
    checklistId: string;
    checklistTitle: string;
    dueDate?: string | null;
  }> => {
    const tasks: Array<{
      id: string;
      content: string;
      checklistId: string;
      checklistTitle: string;
      dueDate?: string | null;
    }> = [];

    for (const checklist of checklists) {
      for (const item of checklist.aurora_checklist_items || []) {
        if (!item.is_completed) {
          tasks.push({
            id: item.id,
            content: item.content,
            checklistId: checklist.id,
            checklistTitle: checklist.title,
            dueDate: item.due_date
          });
        }
      }
    }

    return tasks;
  }, [checklists]);

  return {
    checklists,
    loading,
    createChecklist,
    addChecklistItem,
    addChecklistItemWithDate,
    completeChecklistItem,
    toggleItem,
    deleteChecklist,
    archiveChecklist,
    deleteItem,
    updateItemContent,
    updateChecklistTitle,
    rescheduleItem,
    findMatchingItems,
    findMatchingChecklists,
    getAllOpenTasks,
  };
};
