-- Create a security-definer function to create a brand-new AI conversation and return its id
CREATE OR REPLACE FUNCTION public.create_ai_conversation(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conv_id uuid;
BEGIN
  INSERT INTO public.conversations (participant_1, participant_2, type)
  VALUES (p_user_id, NULL, 'ai')
  RETURNING id INTO conv_id;

  RETURN conv_id;
END;
$$;