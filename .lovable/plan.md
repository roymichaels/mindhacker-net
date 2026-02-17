
# Become a Coach -- Full Platform Journey + Marketplace

## Overview
Build a complete "Become a Coach" system: a 10-step guided journey (modeled after the Business Journey), a dedicated Coaches Hub page, Stripe subscription at $99/month, client acquisition from the Coaches directory, and AI-powered custom plan generation for coachees based on each coach's unique methodology.

## What Gets Built

### 1. Coaching Journey (10-step guided flow)
A new journey modeled exactly on the Business Journey pattern, with coaching-specific steps:

| Step | Title (HE/EN) | What It Collects |
|------|---------------|-----------------|
| 1 | Vision & Why / חזון ולמה | Why become a coach, personal motivation, coaching dream |
| 2 | Coaching Niche / נישת אימון | Niche selection (fitness, business, mental, martial arts, spiritual, life, other), specialization |
| 3 | Methodology / מתודולוגיה | Coaching approach, beliefs, frameworks, unique method |
| 4 | Ideal Client / הלקוח האידיאלי | Target coachee profile, demographics, pain points |
| 5 | Value Proposition / הצעת ערך | What makes them unique, transformation they deliver |
| 6 | Experience & Credentials / ניסיון והסמכות | Certifications, experience, testimonials, background |
| 7 | Services & Pricing / שירותים ותמחור | Session types, packages, pricing strategy |
| 8 | Marketing / שיווק | How they'll attract clients, content strategy, platforms |
| 9 | Operations / תפעול | Scheduling, tools, session delivery, follow-ups |
| 10 | Action Plan & Launch / תוכנית פעולה | First actions, 30/90 day goals, commitment, launch the coaching profile |

**On completion**: The journey data auto-creates a `practitioners` entry (or updates existing), making the coach visible on the Coaches directory page.

### 2. Database Changes

**New table: `coaching_journeys`**
- Mirrors `business_journeys` structure: `id`, `user_id`, `current_step`, `journey_complete`, `step_1_vision` through `step_10_action_plan` (all JSONB), `coaching_niche`, `ai_summary`, timestamps
- RLS: users can only read/update their own journeys

**New table: `coach_client_plans`**
- `id`, `coach_id` (references practitioners), `client_id` (references practitioner_client_profiles), `plan_data` (JSONB -- AI-generated plan), `methodology` (JSONB -- coach's method snapshot), `status`, `created_at`, `updated_at`
- RLS: coach can read/write their own plans, clients can read plans assigned to them

**New Stripe product**: "Coach Pro" at $99/month via Stripe tools

### 3. Coaches Hub Page (like Business Hub)
A new hub page at the existing `/practitioners` route (or enhanced), visible to users who completed the coaching journey:
- "My Coaching Practice" section showing active clients, upcoming sessions
- Coaching Tools grid (similar to Business Tools): Client Plans, Methodology, Marketing, Calendar, Analytics
- Status card showing subscription status, client count, rating
- CTA to start the Coaching Journey for new users

### 4. Client Acquisition from Coaches Directory
- On completing the journey, the user gets a `practitioners` record with `status: 'active'`
- Their profile appears on the `/practitioners` (Coaches) page
- Journey data (niche, bio, methodology, services) populates their coach profile automatically
- Clients can book sessions and become `practitioner_client_profiles`

### 5. AI-Powered Custom Plans for Coachees
**New edge function: `generate-coach-plan`**
- Takes: coach's methodology (from journey data), client profile data, coaching niche
- Uses Lovable AI (google/gemini-3-flash-preview) to generate a personalized coaching plan
- The plan adapts to the coach's specific method, beliefs, and niche
- Output stored in `coach_client_plans` table
- Coach can view/edit/share the plan with their client

### 6. Stripe Integration
- Create a new Stripe product "Coach Pro" at $99/month
- New edge function `create-coach-checkout` for the coaching subscription
- Gate coaching features behind active subscription check
- Integrate with existing `check-subscription` to detect Coach Pro tier

### 7. Coach Panel Integration
- Add new sidebar items: "Client Plans" and "AI Plan Builder"
- Client Plans page shows all generated plans for the coach's clients
- AI Plan Builder lets the coach select a client and generate/customize a plan

## Technical Details

### New Files
- `src/pages/CoachingJourney.tsx` -- page wrapper
- `src/components/coaching-journey/CoachingJourneyFlow.tsx` -- main flow (mirrors BusinessJourneyFlow)
- `src/components/coaching-journey/steps/` -- 10 step components
- `src/hooks/useCoachingJourneyProgress.ts` -- journey state management
- `src/hooks/useCoachingJourneys.ts` -- list coaching journeys
- `src/components/coaching-hub/` -- hub components (tools grid, status card)
- `src/components/coach-plans/CoachPlanBuilder.tsx` -- AI plan builder UI
- `src/components/coach-plans/CoachPlanView.tsx` -- plan viewer
- `supabase/functions/generate-coach-plan/index.ts` -- AI plan generation
- `supabase/functions/create-coach-checkout/index.ts` -- Stripe checkout

### Modified Files
- `src/App.tsx` -- add coaching journey route, coach plan routes
- `src/components/panel/CoachSidebar.tsx` -- add Client Plans and AI Plan Builder nav items
- `src/pages/Practitioners.tsx` -- add "Become a Coach" CTA for non-coaches
- `src/components/journey-shared/themes.ts` -- add 'coaching' theme (orange/warm gradient)
- `src/components/hub-shared/pillarColors.ts` -- add 'coaching' color scheme
- Translation files -- add all coaching-related strings

### Database Migration
```text
-- coaching_journeys table (mirrors business_journeys)
-- coach_client_plans table (AI-generated plans)
-- RLS policies for both tables
-- Auto-create practitioner on journey completion (trigger)
```

### Edge Functions
1. `generate-coach-plan`: Takes coach methodology + client data, calls Lovable AI, returns structured plan
2. `create-coach-checkout`: Creates Stripe checkout session for $99/mo Coach Pro

### Color Theme
- Coaching theme: Orange/warm tone (distinct from business amber)
- Gradient: `from-orange-600 to-amber-500`
- Accent: orange-500

## Implementation Order
1. DB migration (coaching_journeys, coach_client_plans tables + RLS)
2. Stripe product creation ($99/mo Coach Pro)
3. Coaching Journey flow (10 steps + hook + page + routing)
4. Journey completion -> auto-create practitioner profile
5. Coaches Hub enhancements (CTA for non-coaches, status for coaches)
6. Coach checkout edge function + subscription gate
7. AI Plan Builder edge function + UI
8. Coach Panel sidebar updates (Client Plans, AI Plan Builder)
9. Translations (EN + HE)

## Estimated Scope
- 2 new DB tables + RLS + 1 trigger
- 1 new Stripe product
- ~15 new frontend files (journey steps, hub, plan builder)
- 2 new edge functions
- ~8 modified files (routing, sidebar, translations, themes)
