
-- ═══════════════════════════════════════════════════════════
-- MapleStory Mode: user_builds, loot_catalog, user_inventory, loot_events
-- ═══════════════════════════════════════════════════════════

-- 1) user_builds — weekly adaptive builds
CREATE TABLE public.user_builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  build_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Only one active build per user at a time
CREATE UNIQUE INDEX uq_user_builds_active ON public.user_builds (user_id) WHERE is_active = true;

ALTER TABLE public.user_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own builds" ON public.user_builds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own builds" ON public.user_builds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own builds" ON public.user_builds FOR UPDATE USING (auth.uid() = user_id);

-- 2) loot_catalog — global item definitions (public read)
CREATE TABLE public.loot_catalog (
  loot_id text PRIMARY KEY,
  name text NOT NULL,
  rarity text NOT NULL,
  type text NOT NULL,
  effects jsonb NOT NULL DEFAULT '{}'::jsonb,
  icon_url text,
  created_at timestamptz DEFAULT now()
);

-- Use validation trigger instead of CHECK constraints
CREATE OR REPLACE FUNCTION public.validate_loot_catalog()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.rarity NOT IN ('common','rare','epic','legendary') THEN
    RAISE EXCEPTION 'Invalid rarity: %', NEW.rarity;
  END IF;
  IF NEW.type NOT IN ('cosmetic','utility') THEN
    RAISE EXCEPTION 'Invalid type: %', NEW.type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_loot_catalog
BEFORE INSERT OR UPDATE ON public.loot_catalog
FOR EACH ROW EXECUTE FUNCTION public.validate_loot_catalog();

ALTER TABLE public.loot_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Loot catalog is public read" ON public.loot_catalog FOR SELECT USING (true);

-- 3) user_inventory
CREATE TABLE public.user_inventory (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  loot_id text NOT NULL REFERENCES public.loot_catalog(loot_id),
  qty int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, loot_id)
);

ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own inventory" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own inventory" ON public.user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON public.user_inventory FOR UPDATE USING (auth.uid() = user_id);

-- 4) loot_events — immutable drop log
CREATE TABLE public.loot_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_item_id uuid REFERENCES public.action_items(id) ON DELETE SET NULL,
  loot_id text NOT NULL REFERENCES public.loot_catalog(loot_id),
  rarity text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Idempotency: one loot drop per action_item
CREATE UNIQUE INDEX uq_loot_events_action_item ON public.loot_events (action_item_id) WHERE action_item_id IS NOT NULL;

ALTER TABLE public.loot_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own loot events" ON public.loot_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loot events" ON public.loot_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- Loot drop trigger on action_items completion for maple quests
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_maple_loot_drop()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_loot_table text;
  v_is_boss boolean;
  v_roll float;
  v_rarity text;
  v_loot_id text;
  v_already_dropped boolean;
BEGIN
  -- Only trigger on status change to 'done' for maple quests
  IF NEW.status != 'done' OR OLD.status = 'done' THEN RETURN NEW; END IF;
  IF NEW.source != 'maple' THEN RETURN NEW; END IF;

  -- Check idempotency
  SELECT EXISTS(SELECT 1 FROM loot_events WHERE action_item_id = NEW.id) INTO v_already_dropped;
  IF v_already_dropped THEN RETURN NEW; END IF;

  v_loot_table := COALESCE(NEW.metadata->>'loot_table', 'daily_basic');
  v_is_boss := COALESCE((NEW.metadata->>'is_boss')::boolean, false);
  v_roll := random();

  -- Determine rarity based on loot table
  IF v_is_boss OR v_loot_table = 'boss' THEN
    v_rarity := CASE
      WHEN v_roll < 0.02 THEN 'legendary'
      WHEN v_roll < 0.15 THEN 'epic'
      WHEN v_roll < 0.60 THEN 'rare'
      ELSE 'common'
    END;
  ELSE
    v_rarity := CASE
      WHEN v_roll < 0.02 THEN 'epic'
      WHEN v_roll < 0.20 THEN 'rare'
      ELSE 'common'
    END;
  END IF;

  -- Pick a random loot item matching rarity
  SELECT lc.loot_id INTO v_loot_id
  FROM loot_catalog lc
  WHERE lc.rarity = v_rarity
  ORDER BY random()
  LIMIT 1;

  IF v_loot_id IS NULL THEN RETURN NEW; END IF;

  -- Insert loot event
  INSERT INTO loot_events (user_id, action_item_id, loot_id, rarity, reason)
  VALUES (NEW.user_id, NEW.id, v_loot_id, v_rarity,
    CASE WHEN v_is_boss THEN 'boss_complete' ELSE 'quest_complete' END
  ) ON CONFLICT DO NOTHING;

  -- Upsert inventory
  INSERT INTO user_inventory (user_id, loot_id, qty, updated_at)
  VALUES (NEW.user_id, v_loot_id, 1, now())
  ON CONFLICT (user_id, loot_id)
  DO UPDATE SET qty = user_inventory.qty + 1, updated_at = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_maple_loot_drop
AFTER UPDATE ON public.action_items
FOR EACH ROW EXECUTE FUNCTION public.handle_maple_loot_drop();

-- ═══════════════════════════════════════════════════════════
-- Seed loot_catalog with 20 items
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.loot_catalog (loot_id, name, rarity, type, effects, icon_url) VALUES
-- Common cosmetics (8)
('orb_skin_ember', 'Ember Orb Skin', 'common', 'cosmetic', '{"skin":"ember"}', null),
('orb_skin_frost', 'Frost Orb Skin', 'common', 'cosmetic', '{"skin":"frost"}', null),
('orb_skin_neon', 'Neon Orb Skin', 'common', 'cosmetic', '{"skin":"neon"}', null),
('orb_skin_shadow', 'Shadow Orb Skin', 'common', 'cosmetic', '{"skin":"shadow"}', null),
('orb_skin_nature', 'Nature Orb Skin', 'common', 'cosmetic', '{"skin":"nature"}', null),
('badge_first_quest', 'First Quest Badge', 'common', 'cosmetic', '{"badge":"first_quest"}', null),
('badge_explorer', 'Explorer Badge', 'common', 'cosmetic', '{"badge":"explorer"}', null),
('title_rookie', 'Rookie Title', 'common', 'cosmetic', '{"title":"rookie"}', null),
-- Rare items (6)
('streak_shield', 'Streak Shield', 'rare', 'utility', '{"effect":"streak_shield","uses":1}', null),
('quest_reroll_token', 'Quest Reroll Token', 'rare', 'utility', '{"effect":"quest_reroll","uses":1}', null),
('orb_skin_crystal', 'Crystal Orb Skin', 'rare', 'cosmetic', '{"skin":"crystal"}', null),
('orb_skin_void', 'Void Orb Skin', 'rare', 'cosmetic', '{"skin":"void"}', null),
('badge_warrior', 'Warrior Badge', 'rare', 'cosmetic', '{"badge":"warrior"}', null),
('title_seeker', 'Seeker Title', 'rare', 'cosmetic', '{"title":"seeker"}', null),
-- Epic items (4)
('focus_potion', 'Focus Potion', 'epic', 'utility', '{"effect":"focus_reduction","minutes":10,"uses":1}', null),
('xp_boost_scroll', 'XP Boost Scroll', 'epic', 'utility', '{"effect":"xp_boost","multiplier":1.5,"duration_hours":1,"uses":1}', null),
('orb_skin_aurora', 'Aurora Orb Skin', 'epic', 'cosmetic', '{"skin":"aurora"}', null),
('badge_legend', 'Legend Badge', 'epic', 'cosmetic', '{"badge":"legend"}', null),
-- Legendary items (2)
('orb_skin_divine', 'Divine Orb Skin', 'legendary', 'cosmetic', '{"skin":"divine","animated":true}', null),
('master_reroll', 'Master Reroll', 'legendary', 'utility', '{"effect":"quest_reroll","uses":3}', null);
