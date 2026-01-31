-- Add new columns to launchpad_progress for Step 3 (Lifestyle) and Step 10 (Final Notes)
ALTER TABLE launchpad_progress 
ADD COLUMN IF NOT EXISTS step_3_lifestyle_data jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS step_3_lifestyle_completed_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS step_10_final_notes text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS step_10_completed_at timestamptz DEFAULT NULL;