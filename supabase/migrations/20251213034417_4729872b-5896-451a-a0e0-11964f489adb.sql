-- Create leads table for capturing consultation requests
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  source text NOT NULL DEFAULT 'general',
  preferred_time text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  contacted_at timestamp with time zone,
  contacted_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit lead"
ON public.leads FOR INSERT
WITH CHECK (true);

-- Create trigger for admin notification on new lead
CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_admin_notification(
    'new_user'::notification_type,
    'high'::notification_priority,
    '📱 ליד חדש!',
    NEW.name || ' השאיר/ה פרטים (' || NEW.source || ')',
    '/admin/leads',
    jsonb_build_object('lead_id', NEW.id, 'phone', NEW.phone, 'source', NEW.source)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_lead
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_lead();