-- Create business_journeys table for storing business journey data
CREATE TABLE public.business_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_business_model JSONB DEFAULT '{}'::jsonb,
  step_3_target_audience JSONB DEFAULT '{}'::jsonb,
  step_4_value_proposition JSONB DEFAULT '{}'::jsonb,
  step_5_challenges JSONB DEFAULT '{}'::jsonb,
  step_6_resources JSONB DEFAULT '{}'::jsonb,
  step_7_financial JSONB DEFAULT '{}'::jsonb,
  step_8_marketing JSONB DEFAULT '{}'::jsonb,
  step_9_operations JSONB DEFAULT '{}'::jsonb,
  step_10_action_plan JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_journeys ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own business journeys" 
ON public.business_journeys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business journeys" 
ON public.business_journeys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business journeys" 
ON public.business_journeys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business journeys" 
ON public.business_journeys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_business_journeys_updated_at
BEFORE UPDATE ON public.business_journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster user lookups
CREATE INDEX idx_business_journeys_user_id ON public.business_journeys(user_id);
CREATE INDEX idx_business_journeys_complete ON public.business_journeys(user_id, journey_complete);