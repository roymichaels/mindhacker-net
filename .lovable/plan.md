

# Tab-Specific Setup Journeys: Admin, Coaches & Projects

## Vision
Each tab (Admin, Coaches, Projects) gets its own guided setup journey — mirroring the proven 8-10 step pattern from the Dashboard's Launchpad and the existing Business/Health/Coaching journeys. These journeys act as "first-time setup wizards" that teach the user how to master each area, collect configuration data, and feed outcomes into the unified 90-day plan.

The key insight from the Dashboard screenshot: **you always know the next step**. Each tab should replicate this — when you land on Coaches for the first time, a journey guides you. Same for Admin and Projects.

---

## Architecture Overview

Each journey follows the exact same proven pattern:
1. A DB table (`admin_journeys`, `projects_journeys`) to persist progress
2. A progress hook (`useAdminJourneyProgress`, `useProjectsJourneyProgress`)
3. Step definitions (STEPS + PHASES constants)
4. A `*JourneyFlow` component using the shared `JourneyHeader`, `JourneyResetDialog`, `JourneyLoadingState`
5. Individual step components (8 steps each)
6. A page component at a dedicated route
7. Integration into the tab's landing page (show journey CTA if not complete)

The Coaching Journey already exists and just needs to be surfaced more prominently in the Coaches tab.

---

## 1. Admin Journey (8 steps)

### Steps & Phases

**Phase 1: Platform Basics (Steps 1-3)**
1. Platform Vision -- What is the platform's purpose and audience?
2. Team & Roles -- Set up admin roles and permissions
3. Branding & Theme -- Configure colors, logo, site identity

**Phase 2: Content & Products (Steps 4-6)**
4. Product Catalog -- Set up initial products/services
5. Content Strategy -- Plan content types (videos, articles, courses)
6. Landing Pages -- Configure key landing pages and homepage

**Phase 3: Growth & Operations (Steps 7-8)**
7. Marketing Setup -- Campaigns, newsletter, affiliates
8. Operations Checklist -- Notifications, analytics, system settings

### Database
- New table: `admin_journeys` (same structure as `coaching_journeys`)
- 8 step_data columns + current_step + journey_complete
- RLS: user_id = auth.uid()

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useAdminJourneyProgress.ts` | Progress hook + ADMIN_JOURNEY_STEPS/PHASES |
| `src/components/admin-journey/AdminJourneyFlow.tsx` | Flow container (same pattern as BusinessJourneyFlow) |
| `src/components/admin-journey/steps/PlatformVisionStep.tsx` | Step 1 |
| `src/components/admin-journey/steps/TeamRolesStep.tsx` | Step 2 |
| `src/components/admin-journey/steps/BrandingStep.tsx` | Step 3 |
| `src/components/admin-journey/steps/ProductCatalogStep.tsx` | Step 4 |
| `src/components/admin-journey/steps/ContentStrategyStep.tsx` | Step 5 |
| `src/components/admin-journey/steps/LandingPagesStep.tsx` | Step 6 |
| `src/components/admin-journey/steps/MarketingSetupStep.tsx` | Step 7 |
| `src/components/admin-journey/steps/OperationsStep.tsx` | Step 8 |
| `src/pages/AdminJourney.tsx` | Route page |

### Integration
- Add route `/admin-journey/:journeyId?` in App.tsx
- In `PanelDashboard.tsx` (admin dashboard): show a "Start Admin Setup Journey" banner if journey not complete, similar to how the Dashboard shows the Launchpad CTA
- Journey theme: emerald/teal (matching admin color scheme)
- Add `'admin'` to the `JourneyTheme` type

---

## 2. Projects Journey (8 steps)

### Steps & Phases

**Phase 1: Foundation (Steps 1-3)**
1. Project Management Vision -- How do you want to organize your projects?
2. First Project Setup -- Create or review your first project
3. Goals Alignment -- Map projects to life pillars and 90-day goals

**Phase 2: Execution (Steps 4-6)**
4. Task Breakdown -- Learn to decompose projects into actionable tasks
5. Milestones & Timeline -- Set key milestones and deadlines
6. Collaboration -- Define stakeholders and resources

**Phase 3: Mastery (Steps 7-8)**
7. Progress Tracking -- Set up review cadence and metrics
8. Aurora Integration -- Configure AI coaching for project accountability

### Database
- New table: `projects_journeys` (same structure)
- 8 step_data columns + current_step + journey_complete
- RLS: user_id = auth.uid()

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useProjectsJourneyProgress.ts` | Progress hook + PROJECTS_JOURNEY_STEPS/PHASES |
| `src/components/projects-journey/ProjectsJourneyFlow.tsx` | Flow container |
| `src/components/projects-journey/steps/` (8 files) | Individual step components |
| `src/pages/ProjectsJourney.tsx` | Route page |

### Integration
- Add route `/projects-journey/:journeyId?` in App.tsx
- In `Projects.tsx`: show "Start Projects Setup" banner when no journey completed
- Journey theme: amber/gold (matching projects color scheme)
- Add `'projects'` to the `JourneyTheme` type

---

## 3. Coaches Journey (already exists -- surface it)

The Coaching Journey (`CoachingJourneyFlow`) already exists with 10 steps. It just needs better integration:

### Changes
- In `Coaches.tsx` landing page: add a prominent "Start Coaching Journey" CTA for non-practitioners
- In `CoachHub.tsx` (for practitioners): show journey progress banner if coaching journey not complete
- Ensure the coaching journey completion triggers unlock of Coach Pro features

---

## 4. Shared Infrastructure Updates

### JourneyTheme type
Add `'admin'` and `'projects'` to the existing type in `src/components/journey-shared/types.ts`

### Theme config
Add admin (emerald) and projects (amber) theme configs in `src/components/journey-shared/themes.ts`

### JourneyResetDialog
Add `'admin'` and `'projects'` to the `journeyType` union

---

## 5. 90-Day Plan Integration

Each journey's completion data feeds into the unified Life Analysis:
- Update `useLifeAnalysis.ts` to also check `admin_journeys` and `projects_journeys` completion status
- Journey action plans (final step of each) generate tasks/goals that appear in the Dashboard's Daily Roadmap
- Aurora context builder gets access to journey completion data for proactive coaching

---

## Implementation Order

1. DB migrations (2 new tables: `admin_journeys`, `projects_journeys`)
2. Shared infrastructure updates (theme types, colors)
3. Admin Journey (hook + flow + 8 steps + page + route)
4. Projects Journey (hook + flow + 8 steps + page + route)
5. Surface Coaching Journey in Coaches tab
6. Integration points (Life Analysis, Dashboard banners)
7. Smoke test all 3 journeys

---

## What Does NOT Change
- Existing Dashboard / Launchpad journey
- Existing Business / Health / other pillar journeys
- UI layout of any tab
- Database schema for existing tables
- Navigation structure

