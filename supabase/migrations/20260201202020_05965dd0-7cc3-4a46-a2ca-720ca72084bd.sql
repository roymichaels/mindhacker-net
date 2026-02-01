-- Create practitioner_clients table for coach-client relationships
CREATE TABLE public.practitioner_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(practitioner_id, client_user_id)
);

-- Enable RLS
ALTER TABLE public.practitioner_clients ENABLE ROW LEVEL SECURITY;

-- Create function to get practitioner_id for current user
CREATE OR REPLACE FUNCTION public.get_practitioner_id_for_user(user_uuid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.practitioners WHERE user_id = user_uuid LIMIT 1;
$$;

-- RLS: Coaches can view their own clients
CREATE POLICY "Coaches can view their own clients"
ON public.practitioner_clients
FOR SELECT
TO authenticated
USING (
  practitioner_id = public.get_practitioner_id_for_user(auth.uid())
);

-- RLS: Coaches can insert their own clients
CREATE POLICY "Coaches can insert their own clients"
ON public.practitioner_clients
FOR INSERT
TO authenticated
WITH CHECK (
  practitioner_id = public.get_practitioner_id_for_user(auth.uid())
);

-- RLS: Coaches can update their own clients
CREATE POLICY "Coaches can update their own clients"
ON public.practitioner_clients
FOR UPDATE
TO authenticated
USING (
  practitioner_id = public.get_practitioner_id_for_user(auth.uid())
);

-- RLS: Coaches can delete their own clients
CREATE POLICY "Coaches can delete their own clients"
ON public.practitioner_clients
FOR DELETE
TO authenticated
USING (
  practitioner_id = public.get_practitioner_id_for_user(auth.uid())
);

-- RLS: Clients can view their relationship with coaches
CREATE POLICY "Clients can view their coach relationships"
ON public.practitioner_clients
FOR SELECT
TO authenticated
USING (
  client_user_id = auth.uid()
);

-- Create trigger for updated_at
CREATE TRIGGER update_practitioner_clients_updated_at
BEFORE UPDATE ON public.practitioner_clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS policies for content_products to ensure coaches only see their own
CREATE POLICY "Coaches can view their own products"
ON public.content_products
FOR SELECT
TO authenticated
USING (
  practitioner_id IS NULL 
  OR practitioner_id = public.get_practitioner_id_for_user(auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Add RLS policies for practitioner_reviews
CREATE POLICY "Coaches can view reviews for their profile"
ON public.practitioner_reviews
FOR SELECT
TO authenticated
USING (
  practitioner_id = public.get_practitioner_id_for_user(auth.uid())
  OR user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);