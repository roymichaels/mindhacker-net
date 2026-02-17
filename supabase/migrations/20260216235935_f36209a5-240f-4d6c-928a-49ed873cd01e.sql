
-- Create ai_response_logs table for tracing Aurora responses
CREATE TABLE public.ai_response_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID,
  prompt_version TEXT NOT NULL,
  context_hash TEXT NOT NULL,
  model TEXT NOT NULL,
  mode TEXT NOT NULL,
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_response_logs ENABLE ROW LEVEL SECURITY;

-- Only allow users to read their own logs
CREATE POLICY "Users can view their own ai_response_logs"
  ON public.ai_response_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role inserts (edge functions use service role key)
CREATE POLICY "Service role can insert ai_response_logs"
  ON public.ai_response_logs FOR INSERT
  WITH CHECK (true);

-- Index for lookups
CREATE INDEX idx_ai_response_logs_user_id ON public.ai_response_logs (user_id);
CREATE INDEX idx_ai_response_logs_context_hash ON public.ai_response_logs (context_hash);
CREATE INDEX idx_ai_response_logs_created_at ON public.ai_response_logs (created_at DESC);
