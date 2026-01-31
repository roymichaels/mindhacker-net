-- Create daily_habit_logs table for tracking daily habit completion
CREATE TABLE public.daily_habit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  habit_item_id UUID NOT NULL REFERENCES public.aurora_checklist_items(id) ON DELETE CASCADE,
  track_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by TEXT NOT NULL DEFAULT 'manual' CHECK (completed_by IN ('manual', 'aurora')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint: one log per habit per day per user
  UNIQUE(user_id, habit_item_id, track_date)
);

-- Add is_recurring column to aurora_checklist_items
ALTER TABLE public.aurora_checklist_items 
ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS
ALTER TABLE public.daily_habit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_habit_logs
CREATE POLICY "Users can view their own habit logs"
ON public.daily_habit_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habit logs"
ON public.daily_habit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs"
ON public.daily_habit_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs"
ON public.daily_habit_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_daily_habit_logs_user_date ON public.daily_habit_logs(user_id, track_date);
CREATE INDEX idx_daily_habit_logs_habit_date ON public.daily_habit_logs(habit_item_id, track_date);