
# Rebuild Presence as Elite Bio-Scan Engine

## What Changes

The current Presence system has two parallel paths: a quiz-based flow (Quick/Full/Deep mode selector + 8-step questionnaire) and a photo-scan flow. This rebuild removes the quiz funnel entirely, making the **photo scan** the primary assessment path with optional manual enrichment inputs.

## Route Changes

| Route | Current | New |
|-------|---------|-----|
| `/life/presence` | PresenceHome (quiz-centric CTAs) | **PresenceHome** redesigned: Scan CTA + Manual Inputs + Last Scan panel |
| `/life/presence/assess` | Mode selector (Quick/Full/Deep) + quiz | **REMOVED** -- redirect to `/life/presence` |
| `/life/presence/scan` | Does not exist | **NEW** -- Guided 4-step camera capture flow |
| `/life/presence/analyzing` | Does not exist | **NEW** -- Animated analysis status sequence |
| `/life/presence/results` | Quiz-based scoreboard + 90-day ladder | **Rebuilt** -- Bio-scan results with findings, fix library, focus selection, completion flag |
| `/life/presence/routine` | Daily routine page | **REMOVED** (no plans until all pillars complete) |
| `/life/presence/history` | Assessment history | Kept but simplified -- shows scan history only |

## Files Deleted / Gutted

| File | Action |
|------|--------|
| `src/pages/presence/PresenceAssess.tsx` | Delete (no more quiz flow) |
| `src/pages/presence/PresenceRoutine.tsx` | Delete (no plans in V1) |
| `src/components/presence/AssessmentSetup.tsx` | Delete (no Quick/Full/Deep selector) |
| `src/components/presence/AssessmentRunner.tsx` | Delete (no quiz questionnaire) |
| `src/components/presence/NinetyDayLadder.tsx` | Delete (no 90-day plan) |
| `src/components/presence/PresenceDiagnosis.tsx` | Delete (replaced by findings + fixes) |
| `src/components/presence/RoutineChecklist.tsx` | Delete (no routine page) |
| `src/lib/presence/routineBuilder.ts` | Delete |

## Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Remove `/assess`, `/routine` routes. Add `/scan`, `/analyzing` routes. Keep `/results`, `/history`. |
| `src/pages/presence/PresenceHome.tsx` | Full rewrite: Scan CTA card + Manual Inputs card + Last Scan panel |
| `src/pages/presence/PresenceResultsPage.tsx` | Full rewrite: Presence Index + Subscores + Findings + Fix Library + Focus Selection + Mark Complete |
| `src/pages/presence/PresenceHistory.tsx` | Minor update: remove references to quiz modes |
| `src/hooks/usePresenceCoach.ts` | Add `saveManualInputs`, `saveFocusItems`, `markComplete`. Remove routine-related methods. |
| `src/lib/presence/types.ts` | Update types: remove routine/diagnosis types, add `Finding`, `FixItem`, `FocusItem`, `ManualInputs`, `completed` flag |
| `src/lib/presence/scoring.ts` | Keep core scoring functions. Remove `buildAssessmentResult` (quiz-driven). Add `generateFindings` and `buildFixLibrary` functions. |
| `src/components/presence/GuidedCapture.tsx` | Simplify to 4 required steps (face front, face profile, body front, body side). Remove optional back step. |

## Files Created

| File | Purpose |
|------|---------|
| `src/pages/presence/PresenceScan.tsx` | Camera capture page wrapping GuidedCapture, navigates to analyzing on complete |
| `src/pages/presence/PresenceAnalyzing.tsx` | Animated analysis screen with status messages, calls edge function, navigates to results |
| `src/components/presence/ManualInputs.tsx` | Minimal enrichment toggles: beard Y/N, hair length, skincare routine |
| `src/components/presence/FindingsList.tsx` | Displays max 6 concise finding bullets from scan |
| `src/components/presence/FixLibrary.tsx` | Selectable fix cards with name, why, difficulty, impact |
| `src/components/presence/TopPriorities.tsx` | Auto-selected top 3 levers with "Add to My Focus" buttons |

## New Presence Home Layout

```text
+------------------------------------------+
|  [Back]  Presence                        |
+------------------------------------------+
|                                          |
|  +------------------------------------+  |
|  |  PRESENCE SCAN                     |  |
|  |  AI visual assessment of face      |  |
|  |  structure, posture, grooming,     |  |
|  |  body composition signals          |  |
|  |                                    |  |
|  |  [ Begin Scan ]                    |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |  MANUAL INPUTS (optional)          |  |
|  |  Beard: [Yes] [No]                 |  |
|  |  Hair:  [Buzz][Short][Med][Long]   |  |
|  |  Skin:  [None][Basic][Full]        |  |
|  |  [ Save Manual Inputs ]            |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |  YOUR LAST SCAN                    |  |
|  |  Score: 62  |  Med confidence      |  |
|  |  Jan 15, 2026                      |  |
|  |  [ Re-scan ]  [ View Results ]     |  |
|  +------------------------------------+  |
|                                          |
|  Note: Plans generated after all         |
|  pillars are assessed.                   |
+------------------------------------------+
```

## Scan Flow (4 Steps)

1. **Face Front** -- neutral expression, good lighting
2. **Face Profile** -- left or right side
3. **Body Front** -- clothed, neutral stance
4. **Body Side** -- clothed, neutral stance

Each step: silhouette overlay, capture/upload button, retake option, next button.

After step 4, navigate to `/life/presence/analyzing`.

## Analyzing Screen

Animated status sequence (not a stalling percentage):
- "Mapping facial structure signals..."
- "Estimating symmetry and definition..."
- "Detecting posture alignment patterns..."
- "Inferring grooming baseline..."
- "Generating recommendations..."

Calls the existing `analyze-presence` edge function with uploaded images. On success, navigates to `/life/presence/results`.

## Results Page Structure

**A) Presence Index (0-100)** -- large display with confidence level

**B) Subscores (0-100):**
- Facial Definition
- Posture Alignment
- Body Composition Signal
- Grooming Baseline
- Style Signal
- Structural Potential (Low/Med/High)

**C) Findings** -- max 6 concise bullets:
- "Forward-head posture detected (moderate)"
- "Jawline definition limited by body composition signal"
- etc.

**D) Fix Library** -- selectable cards, each with:
- Name, why it matters, difficulty (Easy/Med/Hard), impact (Low/Med/High)
- Includes: tongue posture, nasal breathing, chin tucks, posture reset, body fat lever, skincare, grooming, sleep/de-puff, hydration, resistance training, walking/NEAT

**E) Top 3 Priorities** -- auto-selected based on results, each with "Add to My Focus" button

**F) "Mark Presence Assessment Complete"** -- sets `completed: true`, does NOT generate any plan

## Data Storage (No New Migrations)

All data stored in `life_domains.domain_config` where `domain_id = 'presence'`:

```text
{
  latest_scan: { scores, findings, subscores, assessed_at, confidence, scan_images },
  scan_history: [...previous scans],
  manual_inputs: { has_beard, hair_length, skincare_routine },
  focus_items_selected: ['tongue_posture', 'forward_head_correction', ...],
  completed: false,
  completed_at: null
}
```

Photo-based scans continue to use the existing `presence_scans` table and `presence-scans` storage bucket (unchanged). The "Delete photos after analysis" toggle defaults ON.

## What Is Explicitly NOT Built

- No 7-day plan
- No 90-day plan
- No roadmap generation
- No routine page
- No quiz/questionnaire flow
- Plans are only generated after ALL pillar assessments are complete (handled by a future cross-pillar orchestrator)

## Edge Function

The existing `analyze-presence` edge function is unchanged. It already extracts structured metrics via Gemini 2.5 Pro and computes deterministic scores. The results page maps its output into the new UI format (findings, fix library, subscores).

## Tone / Copy

- Clinical, direct, no hype
- "Presence Scan" not "Assessment Quiz"
- "Findings" not "What's wrong with you"
- "Structural Potential" not "Hotness Score"
- All results include: "This is an estimate. Not medical advice."
