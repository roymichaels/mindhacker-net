
-- Drop the overly restrictive index that prevents multiple default AI convos
DROP INDEX IF EXISTS unique_ai_conversation_context;

-- Only enforce uniqueness on pillar conversations (context IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS unique_ai_pillar_conversation 
  ON public.conversations (participant_1, context) 
  WHERE type = 'ai' AND context IS NOT NULL;
