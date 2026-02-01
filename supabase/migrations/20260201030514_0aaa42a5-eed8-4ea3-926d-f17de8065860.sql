-- Add DELETE policy for conversations (only owner can delete their AI conversations)
CREATE POLICY "Users can delete own conversations"
ON public.conversations
FOR DELETE
USING (
  participant_1 = auth.uid() AND type = 'ai'
);

-- Add DELETE policy for messages (users can delete messages in their own conversations)
CREATE POLICY "Users can delete messages in own conversations"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND c.participant_1 = auth.uid()
    AND c.type = 'ai'
  )
);