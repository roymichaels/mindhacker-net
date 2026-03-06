-- Fix scheduled_day for ALL existing mini_milestones: shift from (week*10+offset) to ((week-1)*10+offset)
-- This corrects the off-by-10 error where phase 1 minis were on days 11-15 instead of 1-5
UPDATE mini_milestones mm
SET scheduled_day = mm.scheduled_day - 10
FROM life_plan_milestones lpm
WHERE mm.milestone_id = lpm.id
  AND lpm.week_number = 1
  AND mm.scheduled_day > 10;

UPDATE mini_milestones mm
SET scheduled_day = mm.scheduled_day - 10
FROM life_plan_milestones lpm
WHERE mm.milestone_id = lpm.id
  AND lpm.week_number = 2
  AND mm.scheduled_day > 20;

UPDATE mini_milestones mm
SET scheduled_day = mm.scheduled_day - 10
FROM life_plan_milestones lpm
WHERE mm.milestone_id = lpm.id
  AND lpm.week_number = 3
  AND mm.scheduled_day > 30;

UPDATE mini_milestones mm
SET scheduled_day = mm.scheduled_day - 10
FROM life_plan_milestones lpm
WHERE mm.milestone_id = lpm.id
  AND lpm.week_number = 4
  AND mm.scheduled_day > 40;