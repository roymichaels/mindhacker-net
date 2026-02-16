
# Strategic Refocus: "90-Day Transformation OS" as the Spine

## The Problem
The app currently presents 6+ loosely connected products (AI coach, 8 life pillars, hypnosis, gamification, community, marketplace, admin panels) sharing one login. Every feature competes for attention and nothing has a clear "daily loop" that drives retention and revenue.

## The Strategy
Restructure the entire UX around ONE question: **"Does this help the user complete today's next action in their 90-day plan?"**

Everything stays in the codebase but gets repositioned:
- The **90-Day Plan** becomes the spine (always visible, always directing)
- **AI Coaching** becomes the guide that helps you execute your plan
- **Hypnosis** becomes a "power-up session" inside the plan
- **Gamification** becomes reinforcement (XP for plan actions, not a product)
- **Life Pillars** become the scoring dimensions of your plan, not standalone destinations
- **Community/Marketplace** become future upsells (deprioritized in nav)

---

## Part 1: Landing Page -- Sell the 90-Day Transformation

**File: `src/components/home/GameHeroSection.tsx`**

Rewrite the hero to sell the transformation loop, not the feature list:
- **Headline**: "Transform Your Life in 90 Days" / "שנה את חייך ב-90 ימים"
- **Subtitle**: "Get a personalized AI coach, a daily action plan, and weekly hypnosis power-ups -- all working together to transform 8 areas of your life."
- **Trust Badges**: Replace current generic badges with outcome-driven ones: "12-Week Plan", "Daily AI Coaching", "Measurable Progress"
- **Primary CTA**: "Start Your 90-Day Transformation (Free)" instead of "Start Free Journey"
- **Visual**: Keep the orb but add a subtle 90-day progress arc around it (3 segments for Month 1/2/3)

**File: `src/pages/Index.tsx`**

Reorder sections to tell the transformation story:
1. Hero (90-Day Transformation pitch)
2. TransformationJourneySection (the 3-phase timeline -- already exists, promote to #2)
3. AuroraCoachSection (AI as your daily guide)
4. WhyChooseUsSection (value props reframed around outcomes)
5. TransformationProofSection (social proof)
6. FinalCTASection

Remove or merge: SystemArchitectureSection (too technical), LifePillarsSection (merge into journey), HandsFreeSection (minor feature), FearOfMissingOutSection (feels pushy), FreeJourneyBannerSection (redundant with hero CTA).

## Part 2: Dashboard -- Plan-Centric Command Center

**File: `src/components/dashboard/UnifiedDashboardView.tsx`**

Restructure the dashboard zones to make the 90-day plan the center of gravity:

```
Zone 0: DashboardBannerSlider (keep)
Zone 1: NextActionBanner (keep -- already priority-based)
Zone 2: NEW "Plan Progress Hero" -- Large card showing:
  - Current week (e.g., "Week 4 of 12")
  - Overall progress bar
  - This week's milestone title
  - "View Full Plan" button
Zone 3: StatsGrid (keep -- Level, Streak, Weekly XP, Tokens)
Zone 4: Two columns:
  - Left: TodaysHabitsCard (daily actions FROM the plan)
  - Right: ChecklistsCard (tasks FROM the plan)
Zone 5: Two columns:
  - Left: GoalsCard (monthly milestones FROM the plan)
  - Right: "Power-Up" card (daily hypnosis prompt, positioned as plan accelerator)
Zone 6: LifeAnalysisChart (keep but relabel as "Your 8 Dimensions")
```

Create a new **PlanProgressHero** component in `src/components/dashboard/v2/PlanProgressHero.tsx` that fetches the active life plan and displays the current week prominently.

## Part 3: Sidebar -- Simplify Navigation

**File: `src/components/dashboard/DashboardSidebar.tsx`**

Reduce the sidebar from 10 items to 5 focused items:

```
1. Dashboard (home base)
2. My Plan (90-day plan -- /life-plan, promoted to #2)
3. Aurora Coach (/aurora -- your AI guide)
4. Projects (/projects -- active work)
5. Progress (/consciousness -- life analysis, renamed)
```

The 7 individual pillar pages (Business, Health, Relationships, etc.) move to a "Life Areas" submenu or become accessible only from the Life Analysis chart on the dashboard. They are NOT removed from the router -- just deprioritized in navigation.

## Part 4: Header Icons -- Reframe as Plan Tools

**File: `src/components/dashboard/DashboardLayout.tsx`**

Reframe the 5 header action icons as plan-serving tools:
1. **Tasks** (green) -- "Today's Plan Tasks" 
2. **Goals** (blue) -- "Monthly Milestones"
3. **Power-Up** (violet) -- Hypnosis, rebranded as plan accelerator
4. **Coach** (pink) -- Quick access to Aurora
5. **Alerts** (amber) -- Notifications/nudges about plan progress

## Part 5: Hypnosis Rebranding

**File: `src/components/dashboard/DashboardLayout.tsx`** and **`src/components/dashboard/v2/NextActionBanner.tsx`**

Rename "Hypnosis" to "Power-Up Session" or "Mind Power-Up" across the UI:
- Header icon tooltip: "Power-Up" instead of "Hypnosis"
- NextActionBanner: "Your daily power-up awaits" instead of "Your daily hypnosis awaits"
- The HypnosisModal itself stays the same internally

## Part 6: NextActionBanner Priority Realignment

**File: `src/components/dashboard/v2/NextActionBanner.tsx`**

Adjust priorities to be plan-centric:
1. No active plan? -> "Create Your 90-Day Plan" (start launchpad)
2. Proactive coaching nudge (plan-related)
3. Overdue plan tasks
4. Incomplete daily habits (from plan)
5. Weekly milestone review due
6. Daily power-up (hypnosis) not done
7. Chat with Aurora about your plan

---

## Technical Details

### New Component
- `src/components/dashboard/v2/PlanProgressHero.tsx` -- Fetches active `life_plans` + current week milestone, displays progress arc

### Files to Modify
1. `src/components/home/GameHeroSection.tsx` -- Transformation-focused messaging
2. `src/pages/Index.tsx` -- Reorder/trim landing page sections
3. `src/components/dashboard/UnifiedDashboardView.tsx` -- Add PlanProgressHero, restructure zones
4. `src/components/dashboard/DashboardSidebar.tsx` -- Reduce to 5 nav items
5. `src/components/dashboard/DashboardLayout.tsx` -- Reframe header icon labels
6. `src/components/dashboard/v2/NextActionBanner.tsx` -- Adjust priority hierarchy

### No Database Changes Needed
All data structures (life_plans, life_plan_milestones, checklists, habits) already exist and support this refocus.

### No Routes Removed
All pillar pages remain accessible via direct URL. They are only deprioritized in navigation.

### Estimated Scope
- 1 new component (PlanProgressHero)
- 6 files modified
- 0 database migrations
- 0 edge function changes
