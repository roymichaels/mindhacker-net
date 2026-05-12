/**
 * ChatHistorySheet — pull-up bottom sheet showing recent AION conversation.
 *
 * Phase 6 of Interactive AION (see `.lovable/plan.md`).
 *
 * Binds to OverlayKind 'aion' via the shared BottomSheet so it respects the
 * "one overlay at a time" rule. Reads messages directly from the `messages`
 * table for the active conversation and subscribes to inserts.
 */
import { useEffect, useState } from 'react';
import { BottomSheet } from '@/shell/overlay/BottomSheet';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Msg {
  id: string;
  content: string;
  is_ai_message: boolean;
  created_at: string;
}

const PAGE_SIZE = 50;

export default function ChatHistorySheet() {
  const { activeConversationId } = useAuroraChatContext();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, is_ai_message, created_at')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);
      if (!cancelled) {
        if (!error && data) setMessages([...data].reverse());
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel(`aion-history:${activeConversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversationId}` },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => [...prev, { id: m.id, content: m.content, is_ai_message: m.is_ai_message, created_at: m.created_at }].slice(-PAGE_SIZE));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [activeConversationId]);

  return (
    <BottomSheet kind="aion" title="שיחה אחרונה" maxHeightVh={70}>
      <div className="px-4 py-2 space-y-2">
        {loading && messages.length === 0 && (
          <div className="text-sm text-foreground/50 text-center py-6">טוען...</div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-sm text-foreground/50 text-center py-6">
            השיחה ריקה. דבר עם AION כדי להתחיל.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'rounded-2xl px-3 py-2 text-sm leading-relaxed',
              m.is_ai_message
                ? 'bg-primary/10 text-foreground/90 me-8'
                : 'bg-card/60 text-foreground/95 ms-8',
            )}
          >
            {m.content}
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}