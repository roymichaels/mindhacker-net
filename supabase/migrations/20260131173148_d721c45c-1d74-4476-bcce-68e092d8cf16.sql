-- 1. Conversation Memory Table
CREATE TABLE public.aurora_conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_topics TEXT[] DEFAULT '{}',
  action_items TEXT[] DEFAULT '{}',
  emotional_state TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Reminders Table
CREATE TABLE public.aurora_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  context TEXT,
  source TEXT DEFAULT 'aurora',
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.aurora_conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_reminders ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Conversation Memory
CREATE POLICY "Users can view own conversation memories" 
ON public.aurora_conversation_memory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversation memories" 
ON public.aurora_conversation_memory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversation memories" 
ON public.aurora_conversation_memory 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. RLS Policies for Reminders
CREATE POLICY "Users can view own reminders" 
ON public.aurora_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" 
ON public.aurora_reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" 
ON public.aurora_reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" 
ON public.aurora_reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Indexes for Performance
CREATE INDEX idx_conversation_memory_user ON public.aurora_conversation_memory(user_id, created_at DESC);
CREATE INDEX idx_reminders_user_date ON public.aurora_reminders(user_id, reminder_date) WHERE NOT is_delivered;
CREATE INDEX idx_reminders_pending ON public.aurora_reminders(user_id, is_delivered, reminder_date);