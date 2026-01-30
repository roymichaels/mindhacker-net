-- Add role_model to element_type constraint
ALTER TABLE public.aurora_identity_elements
DROP CONSTRAINT aurora_identity_elements_element_type_check;

ALTER TABLE public.aurora_identity_elements
ADD CONSTRAINT aurora_identity_elements_element_type_check
CHECK (element_type = ANY (ARRAY['value'::text, 'principle'::text, 'self_concept'::text, 'vision_statement'::text, 'character_trait'::text, 'role_model'::text]));