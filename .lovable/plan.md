
# Plan: Business Orb & Full Business Dashboard System

## Overview
Transform the business experience into a complete parallel ecosystem to the Personality hub. Each business will have its own unique visual orb identity, and clicking on a business will open a full-featured dashboard with 90-day plans, AI analysis, branding tools, marketing strategy, and all the capabilities currently available in the Personality hub.

## Phase 1: Business Orb System

### 1.1 Business Orb Profile Generation
Create a visual DNA system for businesses that generates unique orbs based on business data:

**New file: `src/lib/businessOrbSystem.ts`**
- Map business journey data (industry, model, vision) to color palettes
- Industry-based color mapping:
  - Tech/Software: Cyan-Purple (tech palette)
  - Creative/Design: Magenta-Cyan (creative palette)  
  - Health/Wellness: Teal-Magenta (healing palette)
  - Finance/Consulting: Gold-Cyan (explorer palette)
  - Retail/E-commerce: Orange-Purple (action palette)
  - Education/Coaching: Purple-Cyan (mystic palette)
- Business model affects morphology (service = flowing, product = angular, hybrid = balanced)
- Business maturity/progress affects intensity and complexity

### 1.2 Business Orb Component
**New file: `src/components/orb/BusinessOrb.tsx`**
- Similar to PersonalizedOrb but fetches business-specific profile
- Props: `businessId`, `size`, `state`
- Uses business_journeys data to generate visual parameters
- Gold/amber accent to match business hub theme

### 1.3 Database: Business Orb Profiles
**New table: `business_orb_profiles`**
```sql
CREATE TABLE business_orb_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES business_journeys(id) ON DELETE CASCADE,
  primary_color TEXT NOT NULL,
  secondary_colors TEXT[] DEFAULT '{}',
  accent_color TEXT NOT NULL,
  morph_intensity NUMERIC DEFAULT 0.15,
  geometry_detail INTEGER DEFAULT 4,
  computed_from JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id)
);
```

## Phase 2: Unified Orb Visualization

### 2.1 Multi-Orb Merge Component
**New file: `src/components/orb/UnifiedOrb.tsx`**
- Visual representation showing personality + business orbs merging
- Animated blend effect showing orbs combining into unified identity
- Used in main dashboard to show "complete self" visualization
- Particle streams connecting the orbs

### 2.2 Dashboard Integration
Update `CharacterHUD` and `PersonalizedOrb` usage to optionally show merged visualization when user has businesses.

## Phase 3: Full Business Dashboard

### 3.1 Business Dashboard Page
**New file: `src/pages/BusinessDashboard.tsx`**
Route: `/business/:businessId`

Main sections:
1. **Business HUD** - Similar to CharacterHUD but for business
   - Business Orb (small)
   - Business name
   - Progress/health indicators
   - Key metrics

2. **Quick Stats Grid**
   - Revenue goals
   - Customer count targets
   - Marketing reach
   - Action completion rate

3. **Tool Cards Grid** (mirrors Personality tools):
   - AI Business Analysis
   - 90-Day Business Plan
   - Branding & Identity
   - Marketing Strategy
   - Operations Hub
   - Financial Dashboard
   - Audience Insights
   - Challenges & Growth

### 3.2 Business Dashboard Modals
**New file: `src/components/business/BusinessDashboardModals.tsx`**

Modals for each tool:
- `BusinessAIAnalysisModal` - AI analysis of business data
- `Business90DayPlanModal` - Business-specific milestones
- `BrandingModal` - Logo, colors, voice, values
- `MarketingStrategyModal` - Marketing plan details
- `OperationsModal` - Operations data from journey
- `FinancialModal` - Financial planning data
- `AudienceModal` - Target audience insights
- `BusinessChallengesModal` - Current challenges & solutions

### 3.3 Business-Specific 90-Day Plan
**New table: `business_plans`**
```sql
CREATE TABLE business_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES business_journeys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  plan_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE business_plan_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tasks TEXT[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  xp_reward INTEGER DEFAULT 50,
  tokens_reward INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.4 Branding System
**New table: `business_branding`**
```sql
CREATE TABLE business_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES business_journeys(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  font_family TEXT,
  brand_voice TEXT,
  tagline TEXT,
  mission_statement TEXT,
  vision_statement TEXT,
  core_values TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id)
);
```

## Phase 4: Business Card & Navigation Updates

### 4.1 Enhanced BusinessCard
Update `src/components/business/BusinessCard.tsx`:
- Add small BusinessOrb preview
- Click navigates to `/business/:businessId` (full dashboard)
- Show key metrics preview

### 4.2 Route Configuration
Update `src/App.tsx`:
```typescript
<Route path="/business/:businessId" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
```

## Phase 5: AI-Powered Business Generation

### 5.1 Business Plan Generation Edge Function
**New function: `supabase/functions/generate-business-plan/index.ts`**
- Takes business journey data
- Generates personalized 90-day business plan with weekly milestones
- Creates actionable tasks for each week
- Returns structured plan data

### 5.2 Branding Suggestions
**New function: `supabase/functions/generate-branding-suggestions/index.ts`**
- Analyzes business vision, audience, value proposition
- Suggests color palettes, voice tone, taglines
- Returns branding recommendations

## Implementation Order

1. **Database First**
   - Create business_orb_profiles table
   - Create business_plans and business_plan_milestones tables
   - Create business_branding table
   - Add RLS policies

2. **Orb System**
   - Create businessOrbSystem.ts
   - Create BusinessOrb.tsx component
   - Create useBusinessOrbProfile hook

3. **Business Dashboard**
   - Create BusinessDashboard.tsx page
   - Create BusinessDashboardModals.tsx
   - Add route configuration

4. **Business Card Update**
   - Add orb preview to BusinessCard
   - Update navigation to new dashboard

5. **AI Features**
   - Create edge functions for plan/branding generation
   - Integrate with dashboard

6. **Unified Orb**
   - Create UnifiedOrb component
   - Integrate into main dashboard

## File Summary

### New Files:
- `src/lib/businessOrbSystem.ts`
- `src/components/orb/BusinessOrb.tsx`
- `src/components/orb/UnifiedOrb.tsx`
- `src/hooks/useBusinessOrbProfile.ts`
- `src/pages/BusinessDashboard.tsx`
- `src/components/business/BusinessDashboardModals.tsx`
- `src/components/business/BusinessHUD.tsx`
- `src/hooks/useBusinessPlan.ts`
- `src/hooks/useBusinessBranding.ts`
- `supabase/functions/generate-business-plan/index.ts`
- `supabase/functions/generate-branding-suggestions/index.ts`

### Modified Files:
- `src/components/business/BusinessCard.tsx`
- `src/App.tsx`
- `src/pages/Business.tsx`

### New Database Tables:
- `business_orb_profiles`
- `business_plans`
- `business_plan_milestones`
- `business_branding`

## Technical Considerations

### Performance
- Lazy load business dashboard and modals
- Cache orb profiles with React Query
- Debounce autosave for branding/plan edits

### Data Flow
- Business journey data feeds into orb generation
- AI functions use journey data for personalized plans
- Branding colors can optionally sync to business orb

### Consistency
- Reuse existing modal patterns from DashboardModals
- Match Personality hub card layout and styling
- Use gold/amber theme consistently for business features
