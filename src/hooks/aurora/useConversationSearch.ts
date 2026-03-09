/**
 * useConversationSearch — search across all Aurora conversations
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SearchResult {
  messageId: string;
  conversationId: string;
  content: string;
  role: string;
  createdAt: string;
  context: string | null;
}

export function useConversationSearch() {
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');

  const search = useCallback(async (searchQuery: string) => {
    if (!user?.id || !searchQuery.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    setQuery(searchQuery);
    try {
      // Get user's conversation IDs
      const { data: convos } = await supabase
        .from('conversations')
        .select('id, context')
        .eq('participant_1', user.id)
        .eq('type', 'ai');

      if (!convos?.length) { setResults([]); return; }

      const convoIds = convos.map(c => c.id);
      const convoContextMap = Object.fromEntries(convos.map(c => [c.id, c.context]));

      // Search messages across all conversations
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, conversation_id, content, sender_id, created_at')
        .in('conversation_id', convoIds)
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      setResults((msgs || []).map(m => ({
        messageId: m.id,
        conversationId: m.conversation_id,
        content: m.content,
        role: m.sender_id === user.id ? 'user' : 'assistant',
        createdAt: m.created_at,
        context: convoContextMap[m.conversation_id] || null,
      })));
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [user?.id]);

  const clearSearch = useCallback(() => {
    setResults([]);
    setQuery('');
  }, []);

  return { results, isSearching, query, search, clearSearch };
}
