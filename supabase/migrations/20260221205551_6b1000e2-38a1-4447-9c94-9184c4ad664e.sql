
CREATE OR REPLACE FUNCTION public.get_or_create_pillar_conversation(p_user_id uuid, p_pillar text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_conversation_id uuid;
BEGIN
  -- Try to find existing pillar conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant_1 = p_user_id
    AND context = 'pillar:' || p_pillar
    AND type = 'ai'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Create if not found, WITHOUT participant_2 to satisfy the check constraint
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1, type, context)
    VALUES (p_user_id, 'ai', 'pillar:' || p_pillar)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$function$;
