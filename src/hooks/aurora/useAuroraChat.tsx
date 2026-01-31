import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useChecklistsData } from './useChecklistsData';
import { useDailyHabits } from './useDailyHabits';
import { useAuroraReminders } from './useAuroraReminders';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string;
  is_ai_message: boolean;
  is_read: boolean;
  created_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const useAuroraChat = (conversationId: string | null) => {
  const { user } = useAuth();
  const { language } = useTranslation();
  const queryClient = useQueryClient();
  const { 
    createChecklist, 
    addChecklistItem, 
    completeChecklistItem, 
    rescheduleItem,
    archiveChecklist,
    checklists
  } = useChecklistsData(user);
  const { habits, completeHabit } = useDailyHabits(user);
  const { createReminder } = useAuroraReminders(user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const messageCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch messages:', error);
        return;
      }

      setMessages(data || []);
      messageCountRef.current = data?.length || 0;
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`aurora-messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          messageCountRef.current++;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Create a new daily habit
  const createDailyHabit = useCallback(async (habitName: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // First, find or create a "Daily Habits" checklist
      let habitsChecklist = checklists.find(c => c.title === '🔄 הרגלים יומיים' || c.title === '🔄 Daily Habits');
      
      if (!habitsChecklist) {
        habitsChecklist = await createChecklist('🔄 הרגלים יומיים', 'aurora', 'רשימת הרגלים יומיים שנוצרה ע"י אורורה') as any;
      }

      if (!habitsChecklist) return false;

      // Add the habit as a recurring item
      const { error } = await supabase
        .from('aurora_checklist_items')
        .insert({
          checklist_id: habitsChecklist.id,
          content: habitName,
          is_recurring: true,
          is_completed: false,
          order_index: 0,
        });

      if (error) {
        console.error('Failed to create habit:', error);
        return false;
      }

      queryClient.invalidateQueries({ queryKey: ['daily-habits'] });
      return true;
    } catch (err) {
      console.error('Error creating habit:', err);
      return false;
    }
  }, [user?.id, checklists, createChecklist, queryClient]);

  // Remove a daily habit
  const removeHabit = useCallback(async (habitName: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Find the habit by name
      const matchingHabit = habits.find(h => 
        h.content.toLowerCase().includes(habitName.toLowerCase()) ||
        habitName.toLowerCase().includes(h.content.toLowerCase())
      );

      if (!matchingHabit) return false;

      const { error } = await supabase
        .from('aurora_checklist_items')
        .delete()
        .eq('id', matchingHabit.id);

      if (error) {
        console.error('Failed to remove habit:', error);
        return false;
      }

      queryClient.invalidateQueries({ queryKey: ['daily-habits'] });
      return true;
    } catch (err) {
      console.error('Error removing habit:', err);
      return false;
    }
  }, [user?.id, habits, queryClient]);

  // Update milestone
  const updateMilestone = useCallback(async (
    weekNumber: number,
    field: string,
    value: string
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Find the active life plan
      const { data: plan } = await supabase
        .from('life_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!plan) return false;

      // Update the milestone
      const updateData: Record<string, string> = {};
      updateData[field] = value;

      const { error } = await supabase
        .from('life_plan_milestones')
        .update(updateData)
        .eq('plan_id', plan.id)
        .eq('week_number', weekNumber);

      if (error) {
        console.error('Failed to update milestone:', error);
        return false;
      }

      queryClient.invalidateQueries({ queryKey: ['life-plan'] });
      return true;
    } catch (err) {
      console.error('Error updating milestone:', err);
      return false;
    }
  }, [user?.id, queryClient]);

  // Add identity element
  const addIdentityElement = useCallback(async (
    elementType: string,
    content: string
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('aurora_identity_elements')
        .insert({
          user_id: user.id,
          element_type: elementType,
          content,
        });

      if (error) {
        console.error('Failed to add identity element:', error);
        return false;
      }

      queryClient.invalidateQueries({ queryKey: ['aurora-life-model'] });
      return true;
    } catch (err) {
      console.error('Error adding identity element:', err);
      return false;
    }
  }, [user?.id, queryClient]);

  // Remove identity element
  const removeIdentityElement = useCallback(async (
    elementType: string,
    content: string
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('aurora_identity_elements')
        .delete()
        .eq('user_id', user.id)
        .eq('element_type', elementType)
        .ilike('content', `%${content}%`);

      if (error) {
        console.error('Failed to remove identity element:', error);
        return false;
      }

      queryClient.invalidateQueries({ queryKey: ['aurora-life-model'] });
      return true;
    } catch (err) {
      console.error('Error removing identity element:', err);
      return false;
    }
  }, [user?.id, queryClient]);

  // Set focus plan
  const setFocusPlan = useCallback(async (
    title: string,
    durationDays: number
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Deactivate existing focus plans
      await supabase
        .from('aurora_focus_plans')
        .update({ status: 'completed' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Create new focus plan
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      const { error } = await supabase
        .from('aurora_focus_plans')
        .insert({
          user_id: user.id,
          title,
          duration_days: durationDays,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
        });

      if (error) {
        console.error('Failed to set focus plan:', error);
        return false;
      }

      queryClient.invalidateQueries({ queryKey: ['aurora-life-model'] });
      return true;
    } catch (err) {
      console.error('Error setting focus plan:', err);
      return false;
    }
  }, [user?.id, queryClient]);

  // Process action tags from Aurora's response
  const processActionTags = useCallback(async (content: string) => {
    // Silent action tags (removed from display)
    const actionMatches = [...content.matchAll(/\[action:(\w+)\]/g)];
    for (const match of actionMatches) {
      if (match[1] === 'analyze' && user?.id) {
        // Trigger background analysis
        triggerBackgroundAnalysis();
      }
    }

    // Checklist creation
    const checklistCreateMatches = [...content.matchAll(/\[checklist:create:(.+?)\]/g)];
    for (const match of checklistCreateMatches) {
      const title = match[1].trim();
      if (title) {
        await createChecklist(title, 'aurora');
      }
    }

    // Checklist item addition
    const checklistAddMatches = [...content.matchAll(/\[checklist:add:(.+?):(.+?)\]/g)];
    for (const match of checklistAddMatches) {
      const checklistTitle = match[1].trim();
      const itemContent = match[2].trim();
      if (checklistTitle && itemContent) {
        await addChecklistItem(checklistTitle, itemContent);
      }
    }

    // Checklist item completion (legacy format)
    const checklistCompleteMatches = [...content.matchAll(/\[checklist:complete:(.+?):(.+?)\]/g)];
    for (const match of checklistCompleteMatches) {
      const checklistTitle = match[1].trim();
      const itemContent = match[2].trim();
      if (checklistTitle && itemContent) {
        await completeChecklistItem(checklistTitle, itemContent);
      }
    }

    // Checklist archive
    const checklistArchiveMatches = [...content.matchAll(/\[checklist:archive:(.+?)\]/g)];
    for (const match of checklistArchiveMatches) {
      const checklistTitle = match[1].trim();
      if (checklistTitle) {
        const checklist = checklists.find(c => 
          c.title.toLowerCase().includes(checklistTitle.toLowerCase())
        );
        if (checklist) {
          await archiveChecklist(checklist.id);
        }
      }
    }

    // Task completion (new format)
    const taskCompleteMatches = [...content.matchAll(/\[task:complete:(.+?):(.+?)\]/g)];
    for (const match of taskCompleteMatches) {
      const checklistTitle = match[1].trim();
      const itemContent = match[2].trim();
      if (checklistTitle && itemContent) {
        await completeChecklistItem(checklistTitle, itemContent);
      }
    }

    // Task reschedule
    const taskRescheduleMatches = [...content.matchAll(/\[task:reschedule:(.+?):(.+?):(\d{4}-\d{2}-\d{2})\]/g)];
    for (const match of taskRescheduleMatches) {
      const checklistTitle = match[1].trim();
      const itemContent = match[2].trim();
      const newDate = match[3];
      if (checklistTitle && itemContent && newDate) {
        await rescheduleItem(checklistTitle, itemContent, newDate);
      }
    }

    // Milestone completion
    const milestoneCompleteMatches = [...content.matchAll(/\[milestone:complete:(\d+)\]/g)];
    for (const match of milestoneCompleteMatches) {
      const weekNumber = parseInt(match[1]);
      if (user?.id && weekNumber > 0) {
        await completeMilestoneByWeek(weekNumber);
      }
    }

    // Daily habit completion
    const habitCompleteMatches = [...content.matchAll(/\[habit:complete:(.+?)\]/g)];
    for (const match of habitCompleteMatches) {
      const habitName = match[1].trim();
      if (habitName && habits.length > 0) {
        // Find matching habit by partial content match
        const matchingHabit = habits.find(h => 
          h.content.toLowerCase().includes(habitName.toLowerCase()) ||
          habitName.toLowerCase().includes(h.content.toLowerCase())
        );
        if (matchingHabit) {
          await completeHabit(matchingHabit.id, 'aurora');
        }
      }
    }

    // Habit creation
    const habitCreateMatches = [...content.matchAll(/\[habit:create:(.+?)\]/g)];
    for (const match of habitCreateMatches) {
      const habitName = match[1].trim();
      if (habitName) {
        await createDailyHabit(habitName);
      }
    }

    // Habit removal
    const habitRemoveMatches = [...content.matchAll(/\[habit:remove:(.+?)\]/g)];
    for (const match of habitRemoveMatches) {
      const habitName = match[1].trim();
      if (habitName) {
        await removeHabit(habitName);
      }
    }

    // Plan updates
    const planUpdateMatches = [...content.matchAll(/\[plan:update:(\d+):(.+?):(.+?)\]/g)];
    for (const match of planUpdateMatches) {
      const weekNumber = parseInt(match[1]);
      const field = match[2].trim();
      const value = match[3].trim();
      if (weekNumber > 0 && field && value) {
        await updateMilestone(weekNumber, field, value);
      }
    }

    // Identity additions
    const identityAddMatches = [...content.matchAll(/\[identity:add:(.+?):(.+?)\]/g)];
    for (const match of identityAddMatches) {
      const elementType = match[1].trim();
      const elementContent = match[2].trim();
      if (elementType && elementContent) {
        await addIdentityElement(elementType, elementContent);
      }
    }

    // Identity removals
    const identityRemoveMatches = [...content.matchAll(/\[identity:remove:(.+?):(.+?)\]/g)];
    for (const match of identityRemoveMatches) {
      const elementType = match[1].trim();
      const elementContent = match[2].trim();
      if (elementType && elementContent) {
        await removeIdentityElement(elementType, elementContent);
      }
    }

    // Reminders
    const reminderMatches = [...content.matchAll(/\[reminder:set:(.+?):(\d{4}-\d{2}-\d{2})\]/g)];
    for (const match of reminderMatches) {
      const message = match[1].trim();
      const date = match[2];
      if (message && date) {
        await createReminder(message, date);
      }
    }

    // Focus plan
    const focusMatches = [...content.matchAll(/\[focus:set:(.+?):(\d+)\]/g)];
    for (const match of focusMatches) {
      const title = match[1].trim();
      const days = parseInt(match[2]);
      if (title && days > 0) {
        await setFocusPlan(title, days);
      }
    }

    // Return cleaned content (without silent action tags, but keep CTAs)
    return content
      .replace(/\[action:\w+\]/g, '')
      .replace(/\[checklist:[^\]]+\]/g, '')
      .replace(/\[task:[^\]]+\]/g, '')
      .replace(/\[milestone:[^\]]+\]/g, '')
      .replace(/\[habit:[^\]]+\]/g, '')
      .replace(/\[plan:[^\]]+\]/g, '')
      .replace(/\[identity:[^\]]+\]/g, '')
      .replace(/\[reminder:[^\]]+\]/g, '')
      .replace(/\[focus:[^\]]+\]/g, '')
      .trim();
  }, [
    user?.id, 
    createChecklist, 
    addChecklistItem, 
    completeChecklistItem, 
    rescheduleItem, 
    archiveChecklist,
    checklists,
    habits, 
    completeHabit,
    createDailyHabit,
    removeHabit,
    updateMilestone,
    addIdentityElement,
    removeIdentityElement,
    createReminder,
    setFocusPlan
  ]);

  // Complete milestone by week number
  const completeMilestoneByWeek = useCallback(async (weekNumber: number) => {
    if (!user?.id) return false;

    try {
      // Find the active life plan
      const { data: plan } = await supabase
        .from('life_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!plan) return false;

      // Update the milestone
      const { error } = await supabase
        .from('life_plan_milestones')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('plan_id', plan.id)
        .eq('week_number', weekNumber);

      if (error) {
        console.error('Failed to complete milestone:', error);
        return false;
      }

      // Award XP
      await supabase.rpc('award_unified_xp', {
        p_user_id: user.id,
        p_amount: 50,
        p_source: 'milestone',
        p_reason: `Week ${weekNumber} milestone completed`,
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['life-plan'] });

      return true;
    } catch (err) {
      console.error('Error completing milestone:', err);
      return false;
    }
  }, [user?.id, queryClient]);

  // Trigger background analysis every 4 messages
  const triggerBackgroundAnalysis = useCallback(async () => {
    if (!user?.id || !conversationId) return;

    try {
      const chatMessages: ChatMessage[] = messages.map((m) => ({
        role: m.is_ai_message ? 'assistant' : 'user',
        content: m.content,
      }));

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          userId: user.id,
          messages: chatMessages,
        }),
      });

      // Invalidate Life Model queries
      queryClient.invalidateQueries({ queryKey: ['aurora-life-model'] });
      queryClient.invalidateQueries({ queryKey: ['aurora-dashboard'] });
    } catch (err) {
      console.error('Background analysis failed:', err);
    }
  }, [user?.id, conversationId, messages, queryClient]);

  // Summarize conversation for memory
  const summarizeConversation = useCallback(async () => {
    if (!user?.id || !conversationId || messages.length < 6) return;

    try {
      const chatMessages: ChatMessage[] = messages.slice(-10).map((m) => ({
        role: m.is_ai_message ? 'assistant' : 'user',
        content: m.content,
      }));

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-summarize-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          userId: user.id,
          conversationId,
          messages: chatMessages,
        }),
      });
    } catch (err) {
      console.error('Conversation summarization failed:', err);
    }
  }, [user?.id, conversationId, messages]);

  // Generate title after first exchange
  const generateTitle = useCallback(async (convId: string, msgs: ChatMessage[]) => {
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-generate-title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          conversationId: convId,
          messages: msgs,
          language,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (err) {
      console.error('Title generation failed:', err);
    }
  }, [language, queryClient]);

  // Send message to Aurora
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !conversationId || isStreaming) return;

    setError(null);
    setIsStreaming(true);
    setStreamingContent('');

    // Save user message
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        is_ai_message: false,
      });

    if (insertError) {
      console.error('Failed to save message:', insertError);
      setError('Failed to send message');
      setIsStreaming(false);
      return;
    }

    // Award XP for sending message through unified system
    try {
      await supabase.rpc('award_unified_xp', {
        p_user_id: user.id,
        p_amount: 5,
        p_source: 'aurora',
        p_reason: 'Message sent to Aurora',
      });
    } catch (e) {
      console.warn('Failed to award XP:', e);
    }

    // Build message history for AI
    const chatMessages: ChatMessage[] = [
      ...messages.map((m) => ({
        role: (m.is_ai_message ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content },
    ];

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: chatMessages,
            userId: user.id,
            language,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response from Aurora');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

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
            const contentDelta = parsed.choices?.[0]?.delta?.content;
            if (contentDelta) {
              fullContent += contentDelta;
              setStreamingContent(fullContent);
            }
          } catch {
            // Partial JSON, put back in buffer
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Process action tags and clean content
      const cleanedContent = await processActionTags(fullContent);

      // Save Aurora's response
      if (cleanedContent) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: null,
          content: cleanedContent,
          is_ai_message: true,
        });
      }

      // Generate title after first exchange (2 messages: user + assistant)
      if (messageCountRef.current <= 2) {
        generateTitle(conversationId, [
          ...chatMessages,
          { role: 'assistant', content: cleanedContent },
        ]);
      }

      // Trigger analysis every 4 messages
      if (messageCountRef.current > 0 && messageCountRef.current % 4 === 0) {
        triggerBackgroundAnalysis();
      }

      // Summarize conversation every 8 messages
      if (messageCountRef.current > 0 && messageCountRef.current % 8 === 0) {
        summarizeConversation();
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Aurora chat error:', err);
        setError('Failed to get response from Aurora');
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
      
      // Refresh messages
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }
  }, [user?.id, conversationId, isStreaming, messages, language, processActionTags, generateTitle, triggerBackgroundAnalysis, summarizeConversation, queryClient]);

  // Cancel streaming
  const cancelStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Regenerate last response
  const regenerateLastResponse = useCallback(async () => {
    if (!conversationId || messages.length < 2) return;

    // Find the last user message (iterate backwards)
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].is_ai_message) {
        lastUserMessageIndex = i;
        break;
      }
    }
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    
    // Delete the last AI message if it exists after the user message
    const lastAiMessage = messages[messages.length - 1];
    if (lastAiMessage.is_ai_message) {
      await supabase.from('messages').delete().eq('id', lastAiMessage.id);
      setMessages((prev) => prev.slice(0, -1));
    }

    // Re-send the last user message
    await sendMessage(lastUserMessage.content);
  }, [conversationId, messages, sendMessage]);

  return {
    messages,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    cancelStreaming,
    regenerateLastResponse,
  };
};
