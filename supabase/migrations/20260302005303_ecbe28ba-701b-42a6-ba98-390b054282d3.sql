
-- Coach landing pages table
CREATE TABLE public.coach_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'blank',
  status TEXT NOT NULL DEFAULT 'draft',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  hero_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  UNIQUE(coach_id, slug)
);

-- Enable RLS
ALTER TABLE public.coach_landing_pages ENABLE ROW LEVEL SECURITY;

-- Coaches can manage their own landing pages
CREATE POLICY "Coaches can view own landing pages"
  ON public.coach_landing_pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can create own landing pages"
  ON public.coach_landing_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can update own landing pages"
  ON public.coach_landing_pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can delete own landing pages"
  ON public.coach_landing_pages FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view published pages
CREATE POLICY "Public can view published landing pages"
  ON public.coach_landing_pages FOR SELECT
  USING (status = 'published');

-- Admin can view all
CREATE POLICY "Admins can view all landing pages"
  ON public.coach_landing_pages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_coach_landing_pages_updated_at
  BEFORE UPDATE ON public.coach_landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
