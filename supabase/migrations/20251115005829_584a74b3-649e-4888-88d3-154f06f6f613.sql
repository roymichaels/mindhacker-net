-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at timestamp DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create site_settings table
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'text',
  description text,
  updated_at timestamp DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_settings
CREATE POLICY "Anyone can view settings"
ON public.site_settings
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create FAQs table
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on faqs
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- RLS policies for faqs
CREATE POLICY "Anyone can view active FAQs"
ON public.faqs
FOR SELECT
TO authenticated, anon
USING (is_active = true);

CREATE POLICY "Admins can manage FAQs"
ON public.faqs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create testimonials table
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  quote text NOT NULL,
  avatar_url text,
  initials text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS policies for testimonials
CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials
FOR SELECT
TO authenticated, anon
USING (is_active = true);

CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed initial site_settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
('calendly_link', 'https://calendly.com/nexus_ai/meet-with-me', 'link', 'Calendly booking link'),
('instagram_url', 'https://instagram.com', 'link', 'Instagram profile URL'),
('telegram_url', 'https://t.me', 'link', 'Telegram contact URL'),
('email', 'contact@consciousness-hacker.com', 'text', 'Contact email'),
('single_session_price', '250', 'number', 'Price for single session in ILS'),
('package_session_price', '800', 'number', 'Price for 4-session package in ILS'),
('single_session_description', 'מפגש אחד של 90 דקות', 'text', 'Single session description'),
('package_session_description', '4 מפגשים של 90 דקות כל אחד', 'text', 'Package session description');

-- Seed initial FAQs (from current site)
INSERT INTO public.faqs (question, answer, order_index) VALUES
('מה ההבדל בין אימון תודעתי לטיפול?', 'טיפול מתמקד בעבר ובריפוי פצעים. אימון תודעתי מתמקד בהווה ובעתיד — שכתוב תבניות, תכנות מחדש של התת-מודע, ושחרור מהגבלות. זה לא ניתוח, זה עדכון מערכת הפעלה.', 1),
('האם אני בשליטה בזמן ההיפנוזה?', 'לחלוטין. היפנוזה מודעת היא מצב של מיקוד עמוק ורצוני. אתה מודע לכל רגע, יכול לעצור בכל שלב, ורק מקבל הצעות שמתאימות לך. זה לא שליטה חיצונית — זה שליטה פנימית משוחררת.', 2),
('כמה מפגשים נדרשים?', 'שינוי משמעותי מורגש כבר מהמפגש הראשון. תהליך מלא נע בין 3-6 מפגשים, תלוי במטרה ובעומק השינוי הרצוי. כל מפגש בונה על הקודם ומעמיק את התכנות.', 3);

-- Seed initial testimonials (from current site)
INSERT INTO public.testimonials (name, role, quote, initials, order_index) VALUES
('דני כהן', 'יזם טכנולוגי', 'המפגש עם אור שינה לי את המשחק לגמרי. הצלחתי לפרוץ מגבלות שליוו אותי שנים והתוצאות בעסק שלי מדברות בעד עצמן.', 'ד.כ', 1),
('מיכל לוי', 'מעצבת גרפית', 'לא האמנתי שאפשר לעשות שינוי כל כך עמוק במפגש אחד. היפנוזה תודעתית זה לא מה שחשבתי - זה הרבה יותר עוצמתי.', 'מ.ל', 2),
('רון אבידן', 'מנכ"ל סטארטאפ', 'הגישה של אור ייחודית לחלוטין. זה לא קוצ''ינג רגיל, זה באמת תכנות מחדש של הראש. ממליץ בחום!', 'ר.א', 3);