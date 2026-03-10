
-- Career applications table
CREATE TABLE public.career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_path TEXT NOT NULL CHECK (career_path IN ('coach', 'therapist', 'freelancer', 'creator', 'business')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  structured_answers JSONB NOT NULL DEFAULT '{}',
  ai_conversation JSONB NOT NULL DEFAULT '[]',
  ai_summary TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, career_path)
);

-- Enable RLS
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

-- Users can read their own applications
CREATE POLICY "Users can read own applications"
  ON public.career_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert own applications"
  ON public.career_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending applications
CREATE POLICY "Users can update own pending applications"
  ON public.career_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status IN ('pending', 'revision_requested'))
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all applications
CREATE POLICY "Admins can read all applications"
  ON public.career_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all applications (approve/reject)
CREATE POLICY "Admins can update all applications"
  ON public.career_applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_career_applications_updated_at
  BEFORE UPDATE ON public.career_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Notify admin on new application
CREATE OR REPLACE FUNCTION public.notify_career_application()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  PERFORM create_admin_notification(
    'new_user',
    'medium',
    'בקשת קריירה חדשה — ' || NEW.career_path,
    'משתמש הגיש בקשה למסלול ' || NEW.career_path,
    '/admin-hub?tab=admin&sub=career-apps',
    jsonb_build_object('application_id', NEW.id, 'career_path', NEW.career_path, 'user_id', NEW.user_id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_career_application_insert
  AFTER INSERT ON public.career_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_career_application();
