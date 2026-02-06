-- Create hobbies_journeys table for the 8th life pillar
CREATE TABLE public.hobbies_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_discovery JSONB DEFAULT NULL,
  step_2_passion JSONB DEFAULT NULL,
  step_3_time JSONB DEFAULT NULL,
  step_4_creativity JSONB DEFAULT NULL,
  step_5_social JSONB DEFAULT NULL,
  step_6_growth JSONB DEFAULT NULL,
  step_7_balance JSONB DEFAULT NULL,
  step_8_action_plan JSONB DEFAULT NULL,
  ai_summary TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on user_id (one journey per user)
CREATE UNIQUE INDEX hobbies_journeys_user_id_idx ON public.hobbies_journeys(user_id);

-- Enable Row Level Security
ALTER TABLE public.hobbies_journeys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access
CREATE POLICY "Users can view their own hobbies journey"
ON public.hobbies_journeys
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hobbies journey"
ON public.hobbies_journeys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hobbies journey"
ON public.hobbies_journeys
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hobbies journey"
ON public.hobbies_journeys
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hobbies_journeys_updated_at
BEFORE UPDATE ON public.hobbies_journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();