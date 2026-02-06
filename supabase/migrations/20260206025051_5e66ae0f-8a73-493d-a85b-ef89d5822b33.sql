-- Create table for purpose journeys
CREATE TABLE public.purpose_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB,
  step_2_values JSONB,
  step_3_meaning JSONB,
  step_4_mission JSONB,
  step_5_strengths JSONB,
  step_6_contribution JSONB,
  step_7_legacy JSONB,
  step_8_action_plan JSONB,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.purpose_journeys ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own purpose journey" 
ON public.purpose_journeys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purpose journey" 
ON public.purpose_journeys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purpose journey" 
ON public.purpose_journeys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purpose journey" 
ON public.purpose_journeys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_purpose_journeys_updated_at
BEFORE UPDATE ON public.purpose_journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for user lookups
CREATE INDEX idx_purpose_journeys_user_id ON public.purpose_journeys(user_id);