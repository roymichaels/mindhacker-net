-- Create health_journeys table for storing health journey progress
CREATE TABLE public.health_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_data JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  plan_id UUID REFERENCES public.life_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_journeys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own health journeys"
ON public.health_journeys
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health journeys"
ON public.health_journeys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health journeys"
ON public.health_journeys
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health journeys"
ON public.health_journeys
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_health_journeys_updated_at
BEFORE UPDATE ON public.health_journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_health_journeys_user_id ON public.health_journeys(user_id);
CREATE INDEX idx_health_journeys_is_completed ON public.health_journeys(is_completed);