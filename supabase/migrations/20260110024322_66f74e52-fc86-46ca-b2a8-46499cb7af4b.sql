-- Create chat assistant settings table
CREATE TABLE public.chat_assistant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create knowledge base table
CREATE TABLE public.chat_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_assistant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_assistant_settings (admin only)
CREATE POLICY "Admins can view chat settings"
  ON public.chat_assistant_settings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert chat settings"
  ON public.chat_assistant_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update chat settings"
  ON public.chat_assistant_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete chat settings"
  ON public.chat_assistant_settings FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- RLS Policies for chat_knowledge_base (admin only)
CREATE POLICY "Admins can view knowledge base"
  ON public.chat_knowledge_base FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert knowledge base"
  ON public.chat_knowledge_base FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update knowledge base"
  ON public.chat_knowledge_base FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete knowledge base"
  ON public.chat_knowledge_base FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Insert default settings
INSERT INTO public.chat_assistant_settings (setting_key, setting_value) VALUES
  ('enabled', 'true'),
  ('model', 'google/gemini-2.5-flash'),
  ('greeting_he', 'היי! אני העוזר האישי של דין. במה אוכל לעזור לך היום?'),
  ('greeting_en', 'Hi! I am Dean''s personal assistant. How can I help you today?'),
  ('max_messages', '20'),
  ('max_content_length', '2000'),
  ('system_prompt', 'אתה עוזר אישי של דין אושר אזולאי, מייסד מיינד-האקר.

## תפקידך
- לעזור למבקרים להבין את השירותים והתכנים
- להכווין אותם לתוכן המתאים להם
- לענות על שאלות נפוצות
- להיות חם, אכפתי ולא מכירתי

## השירותים העיקריים
1. מסע התבוננות פנימית - שאלון חינמי להכרות עצמית
2. סרטון היפנוזה אישי - ₪297 - הקלטה מותאמת אישית
3. קפיצה לתודעה חדשה - ₪1,997 - תהליך טרנספורמציה מעמיק

## הנחיות התנהגות
- דבר בעברית בברירת מחדל, אלא אם המבקר פונה באנגלית
- היה תמציתי וממוקד
- הפנה לשיחת ייעוץ חינמית כשמתאים
- אל תלחץ למכירה - הצע ערך');

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_chat_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_chat_assistant_settings_updated_at
  BEFORE UPDATE ON public.chat_assistant_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_settings_updated_at();

CREATE TRIGGER update_chat_knowledge_base_updated_at
  BEFORE UPDATE ON public.chat_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_settings_updated_at();