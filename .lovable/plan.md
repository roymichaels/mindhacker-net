
# MindOS Planning Engine — Layered Architecture (v2)

> Updated: 2026-03-10

## Pipeline (Identity-Driven, 100-Day Life OS)

```
Layer 1: Identity Context Builder (_shared/contextBuilder.ts)
  └─ Reads: identity_elements, life_direction, visions, skills, preferences, assessments
  └─ Output: Full user context for all AI generation

Layer 2: 100-Day Strategy Engine (generate-100day-strategy)
  └─ Input: Identity context + pillar assessments
  └─ Output: life_plans, plan_missions, life_plan_milestones
  └─ 10 phases × 10 days = 100 day transformation

Layer 3: Weekly Tactical Planner (useWeeklyTacticalPlan)
  └─ Input: Current phase milestones + tactical_schedules
  └─ Output: DayPlan[] with themed TacticalBlock[] per day
  └─ AI-generated schedule or fallback distribution

Layer 4: Daily Queue (useTodayExecution)
  └─ Input: Today's DayPlan from Layer 3
  └─ Output: NowQueueItem[] — the SSOT for "what to do today"
  └─ Movement Score, completion tracking, min-day mode

Layer 5: Now Execution Engine (useNowEngine)
  └─ Input: Single NowQueueItem from Layer 4
  └─ Output: Step-by-step focus mode guidance
  └─ Manages: timer, pause, step navigation, completion
```

## Key Rules

1. **One source of truth**: Daily Queue (Layer 4) is the SSOT for today's actions
2. **Planning ≠ Execution**: Layers 2-4 decide WHAT. Layer 5 decides HOW.
3. **No duplicate generation**: Only one path from strategy to daily actions
4. **Types live in `src/types/planning.ts`**: Shared across all layers
5. **Practices library**: `practices` table = structured catalog, `user_practices` = user preferences
6. **Energy phases**: `morning`, `day`, `evening` on action_items

## Navigation Architecture

### Bottom Tab Bar (5 items)
| Position | Tab | Route | Icon |
|----------|-----|-------|------|
| 1 | FM | `/fm/earn` | Store |
| 2 | Aurora | `/aurora` | Custom Orb (injected) |
| 3 | **Play** | `/play` | Flame (oversized, center) |
| 4 | Community | `/community` | Users |
| 5 | Study | `/learn` | GraduationCap |

### Key Route Changes (2026-03-10)
- `/plan` → `/play` (renamed across entire codebase)
- `PlanHub` → `PlayHub`, `PlanLayoutWrapper` → `PlayLayoutWrapper`
- All legacy routes (`/today`, `/dashboard`, `/me`, `/now`, `/tactics`, `/arena`, `/projects`) → `/play`

### Header HUD
- `AppNameDropdown`: Centered vertical layout with PersonalizedOrb (80px), user name, archetype
- Amber/gold FM theme: amber borders, gradient backgrounds, golden XP progress bar
- Level badge in amber tones

## Aurora Interface (`/aurora`)

### Tab System (sticky, blurred backdrop)
1. **Chat** — AI conversation with `AuroraChatBubbles` + `StandaloneMorphOrb`
2. **Dreams** — Dream journal entries
3. **Reflection** — Daily reflection prompts
4. **Gratitude** — Gratitude practice

### Chat Input
- Fixed at bottom with transparent background (no message occlusion)
- Voice recording, image attach, voice mode trigger
- `pb-20` padding on chat content for scroll clearance

### Voice Mode
- Full-screen overlay with animated orb
- Auto-loop: listening → processing → speaking → listening
- ElevenLabs STT + TTS integration

## Database Tables

| Table | Purpose |
|-------|---------|
| `practices` | Global practice catalog (Tai Chi, Meditation, etc.) |
| `user_practices` | User's chosen practices + preferences |
| `mission_templates` | Reusable structured mission templates |
| `action_items.energy_phase` | Morning/day/evening awareness |
| `tactical_schedules` | AI-generated weekly plans |
| `life_plans` | 100-day strategy plans |
| `life_plan_milestones` | Phase milestones (quests) |
| `mini_milestones` | Weekly tactical objectives |
| `journal_entries` | Dream, reflection, gratitude entries |
| `conversations` | Aurora chat conversations |
| `aurora_messages` | Chat message history |
| `aurora_memory_graph` | Long-term context memory nodes |

## Deleted Pages (2026-03-10)
- `FormView`, `PersonalHypnosisLanding/Success/Pending`
- `ConsciousnessLeapLanding/Apply`, `DynamicLandingPage`
- Routes replaced with redirects to `/` or `/play`
