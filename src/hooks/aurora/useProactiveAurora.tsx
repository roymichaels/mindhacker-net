import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProactiveItem {
  id: string;
  title: string;
  body: string;
  action?: string;
  priority: number;
  scheduled_for: string;
}

interface UseProactiveAuroraOptions {
  enabled?: boolean;
  pollInterval?: number; // milliseconds
}

export const useProactiveAurora = (options: UseProactiveAuroraOptions = {}) => {
  const { enabled = true, pollInterval = 5 * 60 * 1000 } = options; // Default: 5 minutes
  const { user } = useAuth();
  
  const [pendingItems, setPendingItems] = useState<ProactiveItem[]>([]);
  const [currentItem, setCurrentItem] = useState<ProactiveItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pending proactive items
  const fetchPendingItems = useCallback(async () => {
    if (!user?.id || !enabled) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-proactive`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'get_pending',
            user_id: user.id,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingItems(data.items || []);
        
        // Set highest priority item as current
        if (data.items?.length > 0) {
          const sorted = [...data.items].sort((a: ProactiveItem, b: ProactiveItem) => b.priority - a.priority);
          setCurrentItem(sorted[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching proactive items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, enabled]);

  // Trigger analysis and queue new items
  const triggerAnalysis = useCallback(async () => {
    if (!user?.id) return;

    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-proactive`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'analyze',
            user_id: user.id,
          }),
        }
      );

      // Refresh pending items after analysis
      await fetchPendingItems();
    } catch (error) {
      console.error('Error triggering proactive analysis:', error);
    }
  }, [user?.id, fetchPendingItems]);

  // Dismiss an item
  const dismissItem = useCallback(async (itemId: string) => {
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-proactive`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'dismiss',
            item_id: itemId,
          }),
        }
      );

      // Update local state
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
      
      if (currentItem?.id === itemId) {
        const remaining = pendingItems.filter(item => item.id !== itemId);
        setCurrentItem(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (error) {
      console.error('Error dismissing proactive item:', error);
    }
  }, [currentItem, pendingItems]);

  // Mark item as clicked/actioned
  const markItemClicked = useCallback(async (itemId: string) => {
    try {
      await supabase
        .from('aurora_proactive_queue')
        .update({ clicked_at: new Date().toISOString() })
        .eq('id', itemId);
    } catch (error) {
      console.error('Error marking item clicked:', error);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    if (!user?.id || !enabled) return;

    // Initial fetch
    fetchPendingItems();

    // Trigger analysis on first load
    triggerAnalysis();

    // Set up polling
    const interval = setInterval(fetchPendingItems, pollInterval);

    return () => clearInterval(interval);
  }, [user?.id, enabled, pollInterval, fetchPendingItems, triggerAnalysis]);

  // Convert proactive item to Aurora message format
  const getProactiveGreeting = useCallback((): string | null => {
    if (!currentItem) return null;

    return currentItem.body;
  }, [currentItem]);

  return {
    pendingItems,
    currentItem,
    isLoading,
    fetchPendingItems,
    triggerAnalysis,
    dismissItem,
    markItemClicked,
    getProactiveGreeting,
    hasPendingItems: pendingItems.length > 0,
  };
};
