
-- Backfill: create skills from existing plan_missions that don't have corresponding skill records
INSERT INTO public.skills (name, name_he, description, category, icon, is_active, mission_id, user_id)
SELECT 
  COALESCE(pm.title_en, pm.title, 'Skill'),
  pm.title,
  COALESCE(pm.description_en, pm.title_en),
  CASE pm.pillar
    WHEN 'consciousness' THEN 'spirit'
    WHEN 'presence' THEN 'social'
    WHEN 'power' THEN 'body'
    WHEN 'vitality' THEN 'body'
    WHEN 'focus' THEN 'mind'
    WHEN 'combat' THEN 'body'
    WHEN 'expansion' THEN 'mind'
    WHEN 'wealth' THEN 'wealth'
    WHEN 'influence' THEN 'social'
    WHEN 'relationships' THEN 'social'
    WHEN 'business' THEN 'wealth'
    WHEN 'projects' THEN 'wealth'
    WHEN 'play' THEN 'spirit'
    WHEN 'order' THEN 'mind'
    ELSE 'mind'
  END,
  CASE pm.pillar
    WHEN 'consciousness' THEN '🧠'
    WHEN 'presence' THEN '👁️'
    WHEN 'power' THEN '💪'
    WHEN 'vitality' THEN '🌿'
    WHEN 'focus' THEN '🎯'
    WHEN 'combat' THEN '🥊'
    WHEN 'expansion' THEN '🚀'
    WHEN 'wealth' THEN '💰'
    WHEN 'influence' THEN '🌐'
    WHEN 'relationships' THEN '❤️'
    WHEN 'business' THEN '📈'
    WHEN 'projects' THEN '🏗️'
    WHEN 'play' THEN '🎮'
    WHEN 'order' THEN '📋'
    ELSE '⭐'
  END,
  true,
  pm.id,
  lp.user_id
FROM public.plan_missions pm
JOIN public.life_plans lp ON lp.id = pm.plan_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.skills s WHERE s.mission_id = pm.id
);

-- Backfill: create user_skill_progress for newly created skills
INSERT INTO public.user_skill_progress (user_id, skill_id, xp_total, level, updated_at)
SELECT s.user_id, s.id, 0, 1, now()
FROM public.skills s
WHERE s.user_id IS NOT NULL
  AND s.mission_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_skill_progress usp WHERE usp.skill_id = s.id AND usp.user_id = s.user_id
  );
