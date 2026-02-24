

# Add Required Assessment Metrics for ALL 14 Pillars

## Problem
Currently only 4 pillars (combat, power, vitality, focus) have `DOMAIN_REQUIRED_METRICS` defined in the assessment quality contract. The remaining 10 pillars (consciousness, presence, expansion, wealth, influence, relationships, business, projects, play, order) have NO required metrics -- meaning they pass the quality gate with just basic subscores and willingness, even though the AI needs real data (income numbers, relationship patterns, etc.) to generate a meaningful plan.

This is why pillars like "Projects" and "Play" generate plans with generic content -- no hard data was required or captured.

## Solution

### 1. Define required metrics for ALL 14 pillars in `assessment-quality.ts`

Each pillar will get a `DOMAIN_REQUIRED_METRICS` entry with specific fields and questions the user MUST answer before plan generation:

| Pillar | Required Metrics | Key Questions |
|--------|-----------------|---------------|
| **consciousness** | `consciousness_metrics` | Daily self-reflection practice? Journaling frequency? Awareness of emotional triggers? |
| **presence** | `presence_metrics` | Current skincare routine? Last intentional style purchase? Posture awareness level? |
| **power** | `power_metrics` | (already defined -- training type, frequency, max pullups/pushups, bodyweight) |
| **vitality** | `vitality_metrics` | (already defined -- sleep hours/times, diet type, caffeine) |
| **focus** | `focus_metrics` | (already defined -- deep work hours, screen time, meditation) |
| **combat** | `combat_metrics` | (already defined -- disciplines, frequencies, round capacity, maxes) |
| **expansion** | `expansion_metrics` | Books read per month? Languages spoken? Current learning project? Creative output frequency? |
| **wealth** | `wealth_metrics` | Monthly income range? Savings rate? Active income streams? Debt status? |
| **influence** | `influence_metrics` | Team/people managed? Public speaking frequency? Content creation? Network size estimate? |
| **relationships** | `relationships_metrics` | Close friends count? Relationship status? Conflict frequency? Support network quality? |
| **business** | `business_metrics` | Business exists (yes/no)? Monthly revenue? Team size? Years in operation? |
| **projects** | `projects_metrics` | Active projects count? Completion rate? Average project duration? Biggest blocker? |
| **play** | `play_metrics` | Weekly play hours? Types of play activities? Last vacation? Rest guilt level? |
| **order** | `order_metrics` | Cleaning frequency? Unread emails count? Digital organization level? Minimalism score? |

### 2. Update each pillar's system prompt in `domain-assess/index.ts`

For every pillar that currently lacks a `MANDATORY HARD METRICS` block (all except combat), add one -- same pattern as combat's existing block. This instructs the AI to collect those specific numbers/facts before calling `extract_domain_profile`.

### 3. Update `domain_metrics` description in the extraction tool

The `domain_metrics` field description in `buildExtractTool()` currently only lists combat/power/vitality/focus examples. Expand it to cover all 14 pillars so the model knows what to extract for each domain.

### 4. Frontend preflight already works

The existing flow in `useStrategyPlans.ts` and `DailyMilestones.tsx` already catches `MISSING_ASSESSMENT_DATA` errors and opens the `DomainAssessModal`. Once the backend validator has proper required metrics for all pillars, this existing gate will automatically trigger for any pillar missing data.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/_shared/assessment-quality.ts` | Add `DOMAIN_REQUIRED_METRICS` entries for all 10 missing pillars (consciousness, presence, expansion, wealth, influence, relationships, business, projects, play, order) |
| `supabase/functions/domain-assess/index.ts` | Add `MANDATORY HARD METRICS` blocks to system prompts for all 10 pillars that don't have them; expand `domain_metrics` description in `buildExtractTool()` to list all 14 pillar metric fields |

## Technical Details

### assessment-quality.ts additions (example for wealth)

```typescript
wealth: {
  fields: ['wealth_metrics'],
  questions: [
    { field: 'wealth_metrics.monthly_income_range', question_he: 'מה טווח ההכנסה החודשית שלך?', question_en: 'What is your monthly income range?' },
    { field: 'wealth_metrics.income_streams', question_he: 'כמה מקורות הכנסה יש לך?', question_en: 'How many income streams do you have?' },
    { field: 'wealth_metrics.savings_rate', question_he: 'כמה אחוז מההכנסה אתה חוסך?', question_en: 'What percentage of income do you save?' },
    { field: 'wealth_metrics.debt_status', question_he: 'יש לך חובות? באיזה היקף?', question_en: 'Do you have debt? How much?' },
    { field: 'wealth_metrics.financial_goal', question_he: 'מה היעד הפיננסי שלך ל-12 חודשים?', question_en: 'What is your financial goal for 12 months?' },
  ],
},
```

### domain-assess/index.ts prompt addition (example for wealth)

```text
MANDATORY HARD METRICS (YOU MUST COLLECT ALL BEFORE CALLING extract_domain_profile):
1. "What is your monthly income range?" -> monthly_income_range
2. "How many income streams?" -> income_streams (number)
3. "What % do you save?" -> savings_rate
4. "Any debt?" -> debt_status
5. "12-month financial goal?" -> financial_goal
```

Same pattern applied to all remaining pillars.

## Impact
- Every pillar now has a defined "data contract" -- no plan generation until real data is captured
- Existing preflight gate (DomainAssessModal popup) automatically triggers for any pillar with missing metrics
- Assessment conversations become more structured and produce actionable planning data
- Users who already completed assessments without these metrics will be prompted to supplement their data before next plan generation
