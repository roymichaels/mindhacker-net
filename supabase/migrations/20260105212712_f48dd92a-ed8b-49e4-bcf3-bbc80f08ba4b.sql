-- Add English columns for FAQ translations
ALTER TABLE public.faqs 
ADD COLUMN question_en TEXT,
ADD COLUMN answer_en TEXT;