
-- ══════════════════════════════════════════════════
-- PRACTICES LIBRARY + USER PREFERENCES + ENERGY PHASE
-- ══════════════════════════════════════════════════

-- 1. Practice Library (structured catalog)
CREATE TABLE public.practices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_he TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  pillar TEXT,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  default_duration INTEGER NOT NULL DEFAULT 15,
  tags TEXT[] DEFAULT '{}',
  energy_type TEXT NOT NULL DEFAULT 'day',
  instructions TEXT,
  instructions_he TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;

-- Practices are readable by all authenticated users (global catalog)
CREATE POLICY "Authenticated users can read practices"
  ON public.practices FOR SELECT
  TO authenticated
  USING (true);

-- 2. User Practice Preferences
CREATE TABLE public.user_practices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_id UUID REFERENCES public.practices(id) ON DELETE CASCADE NOT NULL,
  skill_level INTEGER NOT NULL DEFAULT 1,
  preferred_duration INTEGER NOT NULL DEFAULT 15,
  frequency_per_week INTEGER NOT NULL DEFAULT 3,
  is_core_practice BOOLEAN NOT NULL DEFAULT false,
  energy_phase TEXT NOT NULL DEFAULT 'day',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, practice_id)
);

-- Enable RLS
ALTER TABLE public.user_practices ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own practice preferences
CREATE POLICY "Users manage own practice preferences"
  ON public.user_practices FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Mission Templates (structured, reusable)
CREATE TABLE public.mission_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'practice',
  pillar TEXT,
  energy_phase TEXT NOT NULL DEFAULT 'day',
  base_practice_id UUID REFERENCES public.practices(id),
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  estimated_time INTEGER NOT NULL DEFAULT 15,
  instructions TEXT,
  instructions_he TEXT,
  title TEXT NOT NULL,
  title_he TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mission_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mission templates"
  ON public.mission_templates FOR SELECT
  TO authenticated
  USING (true);

-- 4. Add energy_phase to action_items
ALTER TABLE public.action_items 
  ADD COLUMN IF NOT EXISTS energy_phase TEXT DEFAULT 'day';

-- 5. Triggers for updated_at
CREATE TRIGGER update_practices_updated_at
  BEFORE UPDATE ON public.practices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_practices_updated_at
  BEFORE UPDATE ON public.user_practices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
