-- Replace function to always create a distinct AI conversation (avoids unique constraint on (participant_1, participant_2) when participant_2 is NULL)
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
  VALUES (p_user_id, gen_random_uuid(), 'ai')
  RETURNING id INTO conv_id;

  RETURN conv_id;
END;
$$;