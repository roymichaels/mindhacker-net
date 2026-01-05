-- Create custom_forms table for form definitions
CREATE TABLE public.custom_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  access_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text) UNIQUE,
  settings JSONB DEFAULT '{"thank_you_message": "תודה על מילוי הטופס!", "show_progress": true}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_fields table for field definitions
CREATE TABLE public.form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.custom_forms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'email', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'rating', 'date', 'number')),
  label TEXT NOT NULL,
  placeholder TEXT,
  is_required BOOLEAN DEFAULT false,
  options JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  validation JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_submissions table for responses
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.custom_forms(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'processed'))
);

-- Enable RLS on all tables
ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_forms
CREATE POLICY "Admins can manage all forms"
  ON public.custom_forms
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published forms by token"
  ON public.custom_forms
  FOR SELECT
  USING (status = 'published');

-- RLS Policies for form_fields
CREATE POLICY "Admins can manage all fields"
  ON public.form_fields
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view fields of published forms"
  ON public.form_fields
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.custom_forms
    WHERE custom_forms.id = form_fields.form_id
    AND custom_forms.status = 'published'
  ));

-- RLS Policies for form_submissions
CREATE POLICY "Admins can manage all submissions"
  ON public.form_submissions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit to published forms"
  ON public.form_submissions
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.custom_forms
    WHERE custom_forms.id = form_submissions.form_id
    AND custom_forms.status = 'published'
  ));

-- Create indexes for performance
CREATE INDEX idx_form_fields_form_id ON public.form_fields(form_id);
CREATE INDEX idx_form_fields_order ON public.form_fields(form_id, order_index);
CREATE INDEX idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX idx_form_submissions_status ON public.form_submissions(status);
CREATE INDEX idx_custom_forms_token ON public.custom_forms(access_token);
CREATE INDEX idx_custom_forms_status ON public.custom_forms(status);

-- Create trigger to update updated_at
CREATE TRIGGER update_custom_forms_updated_at
  BEFORE UPDATE ON public.custom_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_form_fields_updated_at
  BEFORE UPDATE ON public.form_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();