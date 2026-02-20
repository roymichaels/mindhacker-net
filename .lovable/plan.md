
# Presence Coach Engine — Full Implementation Plan

## Context: What Already Exists

The current system has a solid vision-based Presence diagnostic at `/life/presence` with:
- 5-step photo capture (GuidedCapture)
- AI vision extraction via `analyze-presence` edge function (Gemini 2.5 Pro)
- Deterministic scoring engine (5 component scores + Presence Index 0-100)
- Delta tracking between scans
- Direct Mode toggle for blunt feedback
- Privacy consent flow
- Storage in `presence_scans` table

## What This Plan Adds

The existing photo-based scan becomes **one of three assessment modes**. On top of it, we build a comprehensive Presence Coach with questionnaire-based assessment, a lever/intervention library, daily routines, and a richer multi-page structure.

## Route Structure

All routes stay under `/life/presence/*` (consistent with the existing Life system architecture). No `/pillars/` prefix needed.

| Route | Page | Purpose |
|-------|------|---------|
| `/life/presence` | PresenceHome | Hero score, sub-score cards, Next Best Action, CTAs |
| `/life/presence/assess` | PresenceAssess | 3-mode assessment selector + runner |
| `/life/presence/results` | PresenceResults | Full scoreboard + diagnosis + 90-day ladder |
| `/life/presence/routine` | PresenceRoutine | Daily routine generator + completion tracking |
| `/life/presence/history` | PresenceHistory | Reassessment history + trend charts |

## Data Storage Strategy

**No new DB migrations.** All Presence Coach data stored in two places:

1. **`presence_scans` table** (already exists) -- for photo-based AI scans (unchanged)
2. **`life_domains` table** (already exists) -- `domain_config` JSON for the domain where `domain_id = 'presence'` will store:

```text
life_domains.domain_config = {
  // Questionnaire-based assessment
  latest_assessment: {
    mode: 'quick' | 'full' | 'deep',
    scores: { face_structure, posture_frame, body_composition, skin_routine, hair_grooming, style_fit, dental_smile },
    total_score: number,
    confidence: 'low' | 'med' | 'high',
    top_levers: [...],
    diagnosis: { today, this_week, ninety_day_phases },
    assessed_at: ISO string
  },
  history: [ ...previous assessments ],
  // Routine
  active_routine: { intensity: 'minimal' | 'standard' | 'full', levers: [...] },
  routine_logs: [ { date, completed_items: [...], completion_rate } ],
  // Preferences
  preferences: { gender, age_bracket, style_preference, goals },
  // Reassess schedule
  next_reassess: ISO string,
  reassess_cadence: 7 | 14 | 30
}
```

## Assessment Modes

### Mode A: Quick Check (2-3 min, no photos)

Collects via multi-step form:
- Gender, age bracket
- Height + weight (optional)
- Body fat estimate (range selector)
- Activity level / daily steps
- Style preference (minimal/classic/street/athletic/formal)
- Grooming baseline (beard, hair length, skincare routine)
- Posture self-check (neck forward? rounded shoulders? low back pain?)
- Top 2 goals (jawline, skin, hair, leanness, style, posture, grooming)

Scoring: deterministic heuristic engine based on self-reported data. Confidence: "low" (self-reported only).

### Mode B: Full Assessment (8-12 min, photos required)

Everything from Quick Check PLUS:
- Photo capture via existing GuidedCapture (face front, face profile, body front, body side)
- Optional: teeth/smile photo, hairline photo
- AI vision analysis via existing `analyze-presence` edge function
- Scoring: merges questionnaire heuristics + AI vision metrics. Confidence: "med" to "high".

### Mode C: Deep Scan (5-10 min, photos + optional video)

Everything from Full PLUS:
- Extra face photo (relaxed mouth open)
- Optional video uploads (marked as "review pending / future upgrade")
- Confidence: "high"

## Scoring Model (7 Sub-Scores)

The new Presence Coach Score expands the existing 5 component scores into 7 user-facing sub-scores:

| Sub-Score | Source (Quick) | Source (Full/Deep) |
|-----------|---------------|-------------------|
| Face Structure and Definition | Questionnaire heuristic | AI vision (jaw, symmetry, facial thirds) + questionnaire |
| Posture and Frame | Self-check answers | AI vision (forward head, rounded shoulders, pelvic tilt) |
| Body Composition | Self-reported body fat + activity | AI vision (body fat band, shoulder-waist ratio) |
| Skin Routine Consistency | Skincare baseline answers | Same + AI skin clarity band |
| Hair and Grooming | Grooming baseline answers | Same + AI hairline maturity |
| Style and Fit | Style preference + goals | Same |
| Dental / Smile Hygiene | Optional (defaults to neutral) | Teeth photo analysis if provided |

Each sub-score: 0-100, confidence badge, key observations, top levers with impact/effort ratings.

**Mewing/jaw posture lever**: included ONLY when user selects jawline/face goals OR reports mouth breathing/forward head posture. Presented as posture/airway habit, not guaranteed bone change.

## Lever Library

New file: `src/lib/presence/levers.ts`

Structured intervention library with 8 categories, each containing multiple interventions:

A) Face Structure / Jawline (tongue posture, nasal breathing, chewing protocol, chin tucks, de-puff protocol, beard strategy, grooming symmetry)
B) Posture and Frame (forward head correction, rounded shoulders, pelvic alignment, presence stance, desk ergonomics)
C) Body Composition (body fat targeting, leaning protocol, muscle building basics, weekly measurement)
D) Skin Protocol (cleanser/moisturizer/SPF, acne routine, sleep/hydration triggers)
E) Hair / Grooming (haircut selector, hairline styling, beard mapping, eyebrow grooming)
F) Style / Clothing (archetype selector, capsule wardrobe, fit checklist, color palette)
G) Dental / Smile (brushing/flossing habits, whitening mention, breath hygiene)
H) Sleep / Recovery (sleep window, morning light, screen reduction, hydration timing)

Each intervention: `{ id, title, category, timeCost, frequency, difficulty, expectedImpactTime, instructions, contraindications }`.

## Daily Routine Builder

New file: `src/lib/presence/routineBuilder.ts`

Takes user's top levers and generates a structured daily routine:
- **Morning block** (3-8 min): posture drill + skincare + style check
- **Daytime micro-cues**: tongue posture reminder, nasal breathing, posture reset
- **Evening block** (5-12 min): mobility + skincare + prep

Three intensity tiers: Minimal (5 min), Standard (12 min), Full (20 min).

Completion tracked in `life_domains.domain_config.routine_logs`.

## New Files

| File | Purpose |
|------|---------|
| `src/pages/presence/PresenceHome.tsx` | Hero score + sub-score cards + Next Best Action + CTAs |
| `src/pages/presence/PresenceAssess.tsx` | 3-mode selector cards + assessment runner |
| `src/pages/presence/PresenceResultsPage.tsx` | Full scoreboard + diagnosis + 90-day ladder |
| `src/pages/presence/PresenceRoutine.tsx` | Daily routine + completion tracking |
| `src/pages/presence/PresenceHistory.tsx` | History + trend visualization |
| `src/components/presence/AssessmentSetup.tsx` | 3 big mode cards (Quick/Full/Deep) |
| `src/components/presence/AssessmentRunner.tsx` | Multi-step questionnaire runner (reuses GuidedCapture for photo modes) |
| `src/components/presence/PresenceDiagnosis.tsx` | Top 3 levers + today/week/90-day actions |
| `src/components/presence/SubScoreCard.tsx` | Individual sub-score card with levers |
| `src/components/presence/RoutineChecklist.tsx` | Morning/Day/Evening checklist UI |
| `src/components/presence/NinetyDayLadder.tsx` | Phase 1/2/3 visual progression |
| `src/lib/presence/types.ts` | All Presence types (assessment, scores, levers, routines) |
| `src/lib/presence/scoring.ts` | Deterministic scoring engine for questionnaire data |
| `src/lib/presence/levers.ts` | Full lever/intervention library data |
| `src/lib/presence/routineBuilder.ts` | Routine generator from top levers |
| `src/hooks/usePresenceCoach.ts` | Read/write presence data from life_domains table |

## Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Replace single `/life/presence` route with 5 sub-routes |
| `src/pages/PresencePage.tsx` | Becomes redirect to `/life/presence` (PresenceHome) or removed |
| `src/components/presence/GuidedCapture.tsx` | Minor: accept optional extra steps for Deep Scan mode |

## Existing Components Kept

All existing presence components (PresenceIndex, ComponentCard, LeveragePoints, DeltaView, DirectModeToggle, PrivacyConsent, GuidedCapture) are preserved and reused within the new results/assessment pages. The AI vision edge function (`analyze-presence`) is unchanged.

## Dashboard Integration

A "Presence: Today" card will be added to the dashboard that:
- Shows current Presence Coach Score + top lever
- If no assessment exists: shows "Start Presence Assessment" CTA
- Pulls from `life_domains` where `domain_id = 'presence'`

## Reassessment Schedule

After each assessment, user is offered cadence selection:
- 7 days: routine adherence + posture check
- 14 days: photos optional
- 30 days: full reassessment

Stored as `next_reassess` date in domain config.

## Disclaimers (Enforced)

Every assessment shows: "This is an estimate. Not medical advice. Lighting and angle affect results."

No hotness language, no shaming, no public ranking. Score reflects personal structural baseline and improvement potential only.
