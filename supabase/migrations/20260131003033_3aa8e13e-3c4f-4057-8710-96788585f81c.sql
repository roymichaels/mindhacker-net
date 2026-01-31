-- Update the element_type check constraint to include 'identity_title'
ALTER TABLE aurora_identity_elements 
DROP CONSTRAINT IF EXISTS aurora_identity_elements_element_type_check;

ALTER TABLE aurora_identity_elements
ADD CONSTRAINT aurora_identity_elements_element_type_check 
CHECK (element_type = ANY (ARRAY[
  'value'::text, 
  'principle'::text, 
  'self_concept'::text, 
  'vision_statement'::text, 
  'character_trait'::text, 
  'role_model'::text, 
  'identity_title'::text, 
  'ai_archetype'::text
]));