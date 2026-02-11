
-- Add title and body columns to aurora_proactive_queue if missing
ALTER TABLE aurora_proactive_queue 
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS body text;

-- Index for efficient polling
CREATE INDEX IF NOT EXISTS idx_proactive_queue_user_scheduled 
  ON aurora_proactive_queue(user_id, scheduled_for) 
  WHERE dismissed_at IS NULL AND sent_at IS NULL;
