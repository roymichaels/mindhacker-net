
# Phase 1: Life Tab -- Navigation, DB, Domain Grid, Domain Page

## What This Phase Delivers

The Life tab as a new primary navigation item with 8 fixed outcome-based domains. Each domain stores its configuration as structured JSON. Old pillar routes redirect to Life. No Aurora conversation engine yet (Phase 2), no daily execution engine (Phase 3), no content curator (Phase 4).

## Architecture

```text
/life                    --> LifeHub (domain grid)
/life/:domainId          --> LifeDomainPage (config viewer + actions)
/health, /consciousness, --> Redirect to /life
  /relationships, etc.
```

## Database

### New Table: `life_domains`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| user_id | uuid NOT NULL | references profiles(id) |
| domain_id | text NOT NULL | e.g. 'presence', 'power' |
| domain_config | jsonb | structured intake data (current_level, available_time_per_day, tools_available, goal_description, intensity_preference, constraints, sub_focus_areas) |
| status | text | 'unconfigured' / 'configured' / 'active' |
| configured_at | timestamptz | null until Aurora intake complete |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |
| UNIQUE(user_id, domain_id) | | one row per user per domain |

RLS: Users can only read/write their own rows. Admins can read all.

No changes to existing tables. The `action_items` table already supports `pillar` (text) which will hold the domain_id for domain-generated tasks in future phases.

## Navigation Changes

### `src/navigation/osNav.ts`
- Add Life tab to `OS_TABS` array (between Dashboard and Projects)
- Icon: `Flame` from lucide-react
- Path: `/life`
- Labels: 'Life' / 'חיים'
- Remove `comingSoon` from Business tab (or keep -- not changing that)

### `src/navigation/lifeDomains.ts` (NEW)
Single source of truth for the 8 fixed domains:

```typescript
export const LIFE_DOMAINS = [
  { id: 'presence',  labelEn: 'Presence',  labelHe: 'נוכחות',  icon: Eye,       color: 'rose',    description: 'Face, body aesthetics, grooming, posture, style' },
  { id: 'power',     labelEn: 'Power',     labelHe: 'עוצמה',   icon: Dumbbell,  color: 'red',     description: 'Strength, calisthenics, skill progressions' },
  { id: 'vitality',  labelEn: 'Vitality',  labelHe: 'חיוניות', icon: Sun,       color: 'amber',   description: 'Sleep, nutrition, recovery, hormones' },
  { id: 'focus',     labelEn: 'Focus',     labelHe: 'מיקוד',   icon: Crosshair, color: 'violet',  description: 'Dopamine control, deep work, meditation' },
  { id: 'wealth',    labelEn: 'Wealth',    labelHe: 'עושר',    icon: TrendingUp,color: 'emerald', description: 'Income, business, career, monetization' },
  { id: 'edge',      labelEn: 'Edge',      labelHe: 'קצה',     icon: Sword,     color: 'slate',   description: 'Combat, self-protection, stress response' },
  { id: 'expansion', labelEn: 'Expansion', labelHe: 'התרחבות', icon: Brain,     color: 'indigo',  description: 'Learning, creativity, languages, philosophy' },
  { id: 'influence', labelEn: 'Influence', labelHe: 'השפעה',   icon: Crown,     color: 'orange',  description: 'Communication, leadership, relationships, charisma' },
];
```

## New Files

### 1. `src/navigation/lifeDomains.ts`
Domain manifest (8 entries with id, labels, icon, color, description).

### 2. `src/pages/LifeHub.tsx`
- Grid of 8 domain cards
- Each card shows: icon, name, status badge (unconfigured/configured/active)
- Click navigates to `/life/:domainId`
- Gated behind onboarding completion (redirects to `/onboarding` if not complete)
- Uses `DashboardLayout` wrapper (consistent with other hub pages)

### 3. `src/pages/LifeDomainPage.tsx`
- Shows domain header (icon, name, description)
- If unconfigured: prominent "Start Configuration" button (placeholder -- will open Aurora in Phase 2)
- If configured: shows domain_config data in a clean read-only card (current level, time, goals, etc.)
- Action buttons: "Reconfigure Domain" (costs Energy, placeholder), "View Roadmap" (placeholder), "View Today's Execution" (placeholder)
- Uses `DashboardLayout` wrapper

### 4. `src/hooks/useLifeDomains.ts`
- Fetches all `life_domains` rows for the current user
- Returns domain status map and individual domain getter
- Insert mutation for initial domain creation (upsert on first visit)

### 5. `src/lib/guards.ts`
- Add `/life` and `/life/` prefix to `KNOWN_ROUTES` in `safeNavigate`

## Modified Files

### `src/navigation/osNav.ts`
- Import `Flame` icon
- Add Life tab to `OS_TABS` at index 1 (after Dashboard)

### `src/App.tsx`
- Import `LifeHub` and `LifeDomainPage` (lazy)
- Add routes: `/life` and `/life/:domainId` (ProtectedRoute)
- Replace old pillar routes (`/health`, `/consciousness`, `/relationships`, `/finances`, `/learning`, `/purpose`, `/hobbies` and their `/journey` sub-routes) with `Navigate to="/life" replace`

### `src/lib/energyCosts.ts`
- Add `DOMAIN_RECONFIGURE: 15` to `ENERGY_COSTS`

## Old Pillar Cleanup

All old pillar routes become redirects to `/life`:
- `/health`, `/health/journey`, `/health/journey/:id`, `/health/plan`
- `/consciousness`
- `/relationships`, `/relationships/journey`, `/relationships/journey/:id`
- `/finances`, `/finances/journey`, `/finances/journey/:id`
- `/learning`, `/learning/journey`, `/learning/journey/:id`
- `/purpose`, `/purpose/journey`, `/purpose/journey/:id`
- `/hobbies`, `/hobbies/journey`, `/hobbies/journey/:id`

Old page files and components are NOT deleted in this phase (they become dead code). Cleanup is a follow-up task.

## What Is NOT in Phase 1

- Aurora domain conversation engine (Phase 2)
- 90-day plan generation from domain config (Phase 2)
- Daily execution engine / midnight task generation (Phase 3)
- External content curator / YouTube embed (Phase 4)
- Energy spend integration for reconfiguration (Phase 5)
- Old pillar file deletion (cleanup sprint)

## Technical Details

### Migration SQL
```sql
CREATE TABLE public.life_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL,
  domain_config JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'unconfigured',
  configured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain_id)
);

ALTER TABLE public.life_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own domains"
  ON public.life_domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own domains"
  ON public.life_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own domains"
  ON public.life_domains FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_life_domains_updated_at
  BEFORE UPDATE ON public.life_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Risk Assessment
- LOW for navigation changes (additive)
- LOW for DB table (new table, no existing data affected)
- MEDIUM for pillar redirects (users with bookmarked pillar URLs will land on /life instead)
