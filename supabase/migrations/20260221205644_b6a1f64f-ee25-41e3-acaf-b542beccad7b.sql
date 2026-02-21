
-- Drop the restrictive check constraint that prevents participant_2 on AI conversations
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS ai_conversations_no_participant_2;

-- Drop the old unique constraint
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS unique_direct_conversation;

-- Recreate with context column so pillar conversations can coexist
-- Use a unique index instead to allow partial uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS unique_direct_conversation 
  ON public.conversations (participant_1, participant_2) 
  NULLS NOT DISTINCT 
  WHERE type = 'direct';

-- For AI conversations, unique on (participant_1, context) to allow multiple pillar convos
CREATE UNIQUE INDEX IF NOT EXISTS unique_ai_conversation_context 
  ON public.conversations (participant_1, context) 
  NULLS NOT DISTINCT 
  WHERE type = 'ai';

-- Update the function to NOT set participant_2 (cleaner for AI convos)
CREATE OR REPLACE FUNCTION public.get_or_create_pillar_conversation(p_user_id uuid, p_pillar text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_conversation_id uuid;
BEGIN
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant_1 = p_user_id
    AND context = 'pillar:' || p_pillar
    AND type = 'ai'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1, type, context)
    VALUES (p_user_id, 'ai', 'pillar:' || p_pillar)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$function$;

-- Also fix get_or_create_ai_conversation to not set participant_2
CREATE OR REPLACE FUNCTION public.get_or_create_ai_conversation(user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  conv_id UUID;
BEGIN
  SELECT id INTO conv_id
  FROM public.conversations
  WHERE participant_1 = user_id AND type = 'ai' AND context IS NULL;
  
  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (participant_1, type)
    VALUES (user_id, 'ai')
    RETURNING id INTO conv_id;
  END IF;
  
  RETURN conv_id;
END;
$function$;

-- Fix create_ai_conversation too
CREATE OR REPLACE FUNCTION public.create_ai_conversation(p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  conv_id uuid;
BEGIN
  INSERT INTO public.conversations (participant_1, type)
  VALUES (p_user_id, 'ai')
  RETURNING id INTO conv_id;

  RETURN conv_id;
END;
$function$;
