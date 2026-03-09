
-- Migrate orphaned messages from old null-context AI conversations to pillar:all conversations
-- For each user that has both a null-context and pillar:all conversation, move messages over
UPDATE messages 
SET conversation_id = target.pillar_all_id
FROM (
  SELECT 
    old_conv.id as old_id,
    new_conv.id as pillar_all_id
  FROM conversations old_conv
  JOIN conversations new_conv 
    ON old_conv.participant_1 = new_conv.participant_1
    AND new_conv.type = 'ai' 
    AND new_conv.context = 'pillar:all'
  WHERE old_conv.type = 'ai' 
    AND old_conv.context IS NULL
) target
WHERE messages.conversation_id = target.old_id;
