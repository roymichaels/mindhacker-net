
# Presence: Elite Visual Diagnostic Engine

This is a large system spanning DB schema, private storage, an AI vision edge function, a deterministic scoring engine, multi-step capture UI, results dashboard, delta tracking, and plan generation. It will be delivered in sub-phases within this single implementation pass, but scoped to what is buildable now.

## Architecture Overview

```text
User Flow:
/life/presence --> PresenceDashboard
  |
  +--> "Start Scan" --> GuidedCapture (5 steps: face front, face L/R, body front, body side, back optional)
  |                        |
  |                        +--> Upload to private bucket 'presence-scans'
  |                        +--> Call edge function 'analyze-presence'
  |                        +--> AI returns structured metrics JSON
  |                        +--> Deterministic scoring engine computes composite scores
  |                        +--> Save to presence_scans table
  |
  +--> Results Screen --> Presence Index + Component Breakdown + Leverage Points + 90-Day Projection
  |
  +--> Delta Engine --> Compare with previous scan --> Show improvement/regression
  |
  +--> "Direct Mode" toggle --> Sharper clinical language
```

## What Gets Built

### Database (3 tables + 1 bucket)

**Table: `presence_scans`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid NOT NULL | references profiles(id) |
| scan_images | jsonb | paths to images in storage: { face_front, face_left, face_right, body_front, body_side, body_back? } |
| derived_metrics | jsonb | raw AI extraction: facial symmetry, jaw index, body fat band, posture scores, etc. |
| scores | jsonb | deterministic computed scores: structural_integrity, aesthetic_symmetry, composition, posture_alignment, projection_potential, presence_index, confidence_band |
| delta_metrics | jsonb | compared to previous scan: { metric_key: { previous, current, change } } |
| direct_mode_notes | jsonb | blunt language version of feedback |
| scan_number | integer | sequential per user |
| created_at | timestamptz | |

RLS: user can CRUD own rows only.

**Table: `presence_scan_events`** (energy ledger integration)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid NOT NULL | |
| scan_id | uuid | references presence_scans |
| event_type | text | 'full_scan', 'rescan', 'score_refresh' |
| energy_cost | integer | |
| created_at | timestamptz | |

**Table: `presence_training_dataset`** (future model hook, Phase 4 prep)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| derived_metrics | jsonb | anonymized metrics only |
| scores | jsonb | computed scores |
| self_perception_rating | integer | optional 1-10 |
| improvement_outcome | jsonb | delta after 90 days, filled later |
| consented | boolean | explicit opt-in |
| created_at | timestamptz | |

No user_id stored -- anonymized by design.

**Storage Bucket: `presence-scans`**
- Private bucket (public = false)
- Allowed MIME: image/jpeg, image/png, image/webp
- Max file size: 10MB
- RLS: users can only access their own folder (`user_id/`)
- Users can delete their scans at any time

### Edge Function: `analyze-presence`

Calls Lovable AI Gateway with `google/gemini-2.5-pro` (vision-capable model).

**Input:** Base64 images or signed URLs for the uploaded scan images.

**System prompt:** Structured extraction request for facial metrics (symmetry band, jaw definition index, facial thirds balance, cheek fat distribution, eye fatigue probability, skin clarity band, hairline maturity, mandible prominence, zygomatic projection), body metrics (body fat band, shoulder-to-waist ratio, neck thickness, upper/lower balance, abdominal definition, chest projection), and posture metrics (forward head, rounded shoulders, pelvic tilt, thoracic curvature).

**Output:** Structured JSON with all metrics as bands/indices.

**Important:** The AI returns raw metrics only. It does NOT compute composite scores. Scoring is deterministic server-side.

**Deterministic scoring** happens inside the same edge function after AI extraction:
- Structural Integrity Score = weighted(jaw_definition, mandible, zygomatic, shoulder_waist_ratio)
- Aesthetic Symmetry Score = weighted(facial_symmetry, facial_thirds, upper_lower_balance)
- Composition Score = weighted(body_fat_band, abdominal_definition, chest_projection)
- Posture Alignment Score = weighted(forward_head, rounded_shoulders, pelvic_tilt, thoracic_curvature)
- Projection Potential Score = weighted(neck_thickness, chest_projection, mandible, posture_alignment)
- Presence Index = weighted composite of above 5 scores
- Confidence Band = based on image quality and metric extraction confidence

All weights are hardcoded constants, not AI-determined.

**Delta computation:** If previous scan exists, compute per-metric deltas and store in `delta_metrics`.

**Direct Mode notes:** Generate a second pass of blunt clinical language feedback per weak component.

### Frontend Components

**1. `src/pages/PresencePage.tsx`**
Replaces generic LifeDomainPage for the `presence` route. Three states:
- No scan: shows "Start Your First Scan" with privacy consent
- Scan in progress: shows GuidedCapture
- Has scan: shows Results Dashboard

**2. `src/components/presence/PrivacyConsent.tsx`**
- Explains what images are used for
- Private, encrypted, deletable anytime
- No public comparison or ranking
- Checkbox consent required before proceeding

**3. `src/components/presence/GuidedCapture.tsx`**
5-step capture flow:
1. Face Front (neutral expression)
2. Face Profile (left + right in one step, or two separate uploads)
3. Body Front
4. Body Side
5. Back (optional, skip button)

Each step shows:
- Silhouette overlay guide (SVG outline for positioning)
- Upload button (camera/file input)
- Retake option
- Step progress indicator

**4. `src/components/presence/PresenceResults.tsx`**
Results dashboard with 5 sections:
- Section 1: Presence Index (large circular display, 0-100, confidence band)
- Section 2: Component Breakdown (5 cards: Structural Integrity, Aesthetic Symmetry, Composition, Posture Alignment, Projection Potential -- each with score, explanation, improvement lever)
- Section 3: Top 3 Leverage Points (auto-generated from lowest component scores)
- Section 4: 90-Day Projection (estimated improvement range based on addressable components)
- Section 5: Generate Plan CTA (triggers domain plan generation)

**5. `src/components/presence/DeltaView.tsx`**
Shows improvement/regression vs previous scan:
- Per-metric comparison bars
- Overall delta indicator
- Clinical language: "Improvement detected" or "Regression detected -- protocol adherence adjustment needed"

**6. `src/components/presence/DirectModeToggle.tsx`**
Toggle switch. When enabled, language becomes more blunt throughout results.
Stored in localStorage (user preference, not DB).

### Routing

`/life/presence` renders `PresencePage` instead of the generic `LifeDomainPage`.

### Energy Costs

| Action | Cost |
|--------|------|
| Full scan (first or new) | 10 |
| Re-scan (new photos) | 15 |
| Score refresh (no new photos) | 5 |

Added to `ENERGY_COSTS` in `src/lib/energyCosts.ts`.

### Files Created

| File | Purpose |
|------|---------|
| `src/pages/PresencePage.tsx` | Main presence page with state machine |
| `src/components/presence/PrivacyConsent.tsx` | Consent screen |
| `src/components/presence/GuidedCapture.tsx` | 5-step image capture |
| `src/components/presence/PresenceResults.tsx` | Results dashboard |
| `src/components/presence/ComponentCard.tsx` | Individual score card |
| `src/components/presence/PresenceIndex.tsx` | Large circular score display |
| `src/components/presence/LeveragePoints.tsx` | Top 3 weak areas |
| `src/components/presence/DeltaView.tsx` | Improvement delta |
| `src/components/presence/DirectModeToggle.tsx` | Blunt language toggle |
| `src/hooks/usePresenceScans.ts` | Query/mutation hook for scans |
| `supabase/functions/analyze-presence/index.ts` | AI vision + scoring engine |

### Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/life/presence` route pointing to PresencePage |
| `src/lib/energyCosts.ts` | Add PRESENCE_SCAN, PRESENCE_RESCAN, PRESENCE_REFRESH |
| `supabase/config.toml` | Add `[functions.analyze-presence]` |

### Migration SQL

Creates `presence_scans`, `presence_scan_events`, `presence_training_dataset` tables with RLS, plus the `presence-scans` private storage bucket with user-folder-scoped policies.

## What Is NOT in This Phase

- Actual plan generation from weak components (uses existing domain plan system from Phase 3)
- Automatic track activation (cervical protocol, recomp track, etc.) -- future sprint
- Hypnosis reinforcement integration -- future sprint
- Weekly recalibration engine -- future sprint
- Custom model training pipeline -- table structure only, no training logic

## Tone Guidelines (Enforced in AI Prompt + UI Copy)

- Clinical, direct, no hype
- "Private Structural Assessment" not "Hotness Score"
- "Regression detected" not "You look worse"
- "Protocol adherence adjustment needed" not "You failed"
- No population percentile, no comparison to others
- Score reflects internal structural coherence only
- Users compete with their previous self

## Risk Assessment

- **MEDIUM**: AI vision extraction quality depends on image quality and model capability. Confidence band addresses this.
- **LOW**: Deterministic scoring is fully controlled server-side.
- **LOW**: Privacy -- images in private bucket, user-deletable, training dataset anonymized and opt-in only.
- **MEDIUM**: File upload UX on mobile may need iteration for camera integration.
