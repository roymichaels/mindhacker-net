-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('scroll', 'navigate')),
  action_value TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible menu items
CREATE POLICY "Anyone can view visible menu items"
ON public.menu_items
FOR SELECT
USING (is_visible = true);

-- Admins can manage all menu items
CREATE POLICY "Admins can manage menu items"
ON public.menu_items
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default menu items
INSERT INTO public.menu_items (label, action_type, action_value, order_index, is_visible) VALUES
('מה זה?', 'scroll', 'what', 1, true),
('איך זה עובד?', 'scroll', 'how', 2, true),
('עלי', 'scroll', 'about', 3, true),
('עדויות', 'scroll', 'testimonials', 4, true),
('שאלות נפוצות', 'scroll', 'faq', 5, true),
('מחירים', 'scroll', 'booking', 6, true);