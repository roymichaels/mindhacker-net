
-- Add unique constraint on fm_data_consent for upsert
ALTER TABLE public.fm_data_consent ADD CONSTRAINT fm_data_consent_user_category_unique UNIQUE (user_id, category);
