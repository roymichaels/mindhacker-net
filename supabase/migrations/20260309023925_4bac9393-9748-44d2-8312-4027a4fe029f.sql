
-- User locations for AI Match feature
CREATE TABLE public.user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  city TEXT,
  country TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view nearby locations" ON public.user_locations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own location" ON public.user_locations
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI Match connections
CREATE TABLE public.ai_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score NUMERIC(5,2) DEFAULT 0,
  match_reason TEXT,
  shared_pillars TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(user_id, matched_user_id)
);

ALTER TABLE public.ai_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches" ON public.ai_matches
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can update own matches" ON public.ai_matches
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "System can insert matches" ON public.ai_matches
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
