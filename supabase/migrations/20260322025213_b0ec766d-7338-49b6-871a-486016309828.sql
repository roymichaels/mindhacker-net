
CREATE TABLE public.avatar_customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  customization_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.avatar_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own avatar"
  ON public.avatar_customizations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own avatar"
  ON public.avatar_customizations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own avatar"
  ON public.avatar_customizations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_avatar_customizations_updated_at
  BEFORE UPDATE ON public.avatar_customizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
