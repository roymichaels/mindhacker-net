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

/**
 * Data-only hook for checklists - no UI dependencies like useAuth or useTranslation.
 * This prevents "Should have a queue" React errors when used inside useAuroraChat.
 * Pass the user object as a parameter instead of calling useAuth.
 */
export const useChecklistsData = (user: User | null) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch checklists
  useEffect(() => {
    if (!user?.id) {
      setChecklists([]);
      setLoading(false);
      return;
    }

    const fetchChecklists = async () => {
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
  }, [user?.id]);

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

  return {
    checklists,
    loading,
    createChecklist,
    addChecklistItem,
    completeChecklistItem,
    toggleItem,
    deleteChecklist,
    archiveChecklist,
    deleteItem,
    updateItemContent,
    updateChecklistTitle,
  };
};
