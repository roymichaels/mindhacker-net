CREATE TABLE public.life_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL,
  domain_config JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'unconfigured',
  configured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain_id)
);

ALTER TABLE public.life_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own domains"
  ON public.life_domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own domains"
  ON public.life_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own domains"
  ON public.life_domains FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_life_domains_updated_at
  BEFORE UPDATE ON public.life_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();