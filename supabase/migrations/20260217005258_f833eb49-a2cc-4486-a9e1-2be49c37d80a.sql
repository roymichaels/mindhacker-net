
-- Composite index for notification queries (user + unread filter + ordered)
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread 
ON public.user_notifications (user_id, is_read, created_at DESC);

-- Messages: conversation + chronological order (composite for common query pattern)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_ordered 
ON public.messages (conversation_id, created_at ASC);
