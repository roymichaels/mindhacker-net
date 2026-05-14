/**
 * Messaging service — Phase 2 Batch 3.
 * Reads conversations + messages. Sending is preview-only here; the actual
 * insert happens in safeMutationExecutor after confirmation.
 */
import { supabase } from '@/integrations/supabase/client';

export async function searchMessages(userId: string, query?: string, limit = 5): Promise<{
  text: string;
  messages: any[];
  total: number;
}> {
  if (!userId) return { text: 'אין משתמש.', messages: [], total: 0 };
  // Find conversations the user participates in.
  const { data: convos } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .limit(50);
  const ids = (convos ?? []).map((c: any) => c.id);
  if (!ids.length) return { text: 'אין שיחות.', messages: [], total: 0 };

  let q = supabase
    .from('messages')
    .select('id, conversation_id, sender_id, content, created_at, is_read', { count: 'exact' })
    .in('conversation_id', ids)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (query?.trim()) q = q.ilike('content', `%${query.trim().slice(0, 60)}%`);
  const { data, count } = await q;
  const messages = data ?? [];
  const text = messages.length
    ? `${count ?? messages.length} הודעות${query ? ` עבור "${query.slice(0, 30)}"` : ''}`
    : query
      ? `לא נמצאו הודעות עבור "${query.slice(0, 30)}".`
      : 'אין הודעות אחרונות.';
  return { text, messages, total: count ?? messages.length };
}

export async function previewSend(conversationId: string | null, body: string): Promise<{
  text: string;
  conversationId: string | null;
  body: string;
}> {
  return {
    text: conversationId
      ? `הודעה מוכנה לשליחה (${body.length} תווים).`
      : 'נדרש לבחור שיחה לפני שליחה.',
    conversationId,
    body,
  };
}