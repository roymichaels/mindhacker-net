-- Create trigger to auto-create practitioner_settings when a practitioner is created
CREATE OR REPLACE FUNCTION public.create_practitioner_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.practitioner_settings (practitioner_id, subdomain)
  VALUES (NEW.id, NEW.slug)
  ON CONFLICT (practitioner_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS on_practitioner_created ON public.practitioners;
CREATE TRIGGER on_practitioner_created
  AFTER INSERT ON public.practitioners
  FOR EACH ROW
  EXECUTE FUNCTION public.create_practitioner_settings();