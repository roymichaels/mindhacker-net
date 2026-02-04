
# Plan: Replace Weekly Activity Bar Chart with Life Analysis Pie Chart

## Overview
Replace the current stacked bar chart (which shows hypnosis/habits/tasks per day) with a pie chart that visualizes the user's **life focus distribution** based on their launchpad questionnaire data and activity across the 7 life pillars.

## Current State
- **WeeklyActivityChart.tsx** shows a stacked bar chart with 3 categories: Hypnosis, Habits, Tasks
- Data comes from `useWeeklyActivity` hook which counts activity by day

## Proposed Design

### Visual Concept
A beautiful, animated pie chart showing the distribution of the user's life focus across the **7 Life OS pillars**:

| Pillar | Color | Hebrew | English |
|--------|-------|--------|---------|
| Personality | Blue | אישיות | Personality |
| Business | Amber | עסקים | Business |
| Health | Red | בריאות | Health |
| Relationships | Pink | קשרים | Relationships |
| Finances | Emerald | פיננסים | Finances |
| Learning | Indigo | למידה | Learning |
| Purpose | Purple | מטרה | Purpose |

### Data Sources
The pie chart will aggregate data from:
1. **Focus Areas** selected in launchpad (`step_5_focus_areas_selected`)
2. **Welcome Quiz** main areas selected (`main_area` from step 1)
3. **Journey Completion** status across pillars (business_journeys, health_journeys, etc.)
4. **Activity counts** in each pillar (habits, tasks, hypnosis sessions by category)

### Implementation Plan

#### 1. Create New Data Hook: `useLifeAnalysis.ts`
```typescript
// src/hooks/useLifeAnalysis.ts
export interface LifeAnalysisSlice {
  id: string;
  name: string;
  nameHe: string;
  value: number;      // Percentage or score
  color: string;
  icon: string;
}

export function useLifeAnalysis() {
  // Fetch data from:
  // - launchpad_progress (focus_areas, welcome_quiz)
  // - business_journeys, health_journeys, etc. (completion status)
  // - Activity from various tables
  
  // Calculate weighted scores per pillar
  // Return array of slices for pie chart
}
```

#### 2. Replace WeeklyActivityChart Component
```tsx
// src/components/dashboard/v2/LifeAnalysisChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function LifeAnalysisChart() {
  const { data, isLoading } = useLifeAnalysis();
  
  // Animated pie chart with:
  // - Custom colors per pillar
  // - Center label showing overall "Life Balance" score
  // - Interactive segments (hover shows details)
  // - Elegant legend with icons
}
```

#### 3. Scoring Logic
Each pillar gets a score (0-100) based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| Focus Selection | 30% | If selected in launchpad focus areas |
| Journey Complete | 25% | If completed the pillar's journey |
| Weekly Activity | 25% | Habits/tasks completed this week in that pillar |
| Data Depth | 20% | How much detail the user provided in questionnaires |

If a pillar has 0 activity/data, it shows a small default slice to indicate it exists.

### Visual Features
- **Gradient fills** for each slice (matching pillar theme colors)
- **Animated entry** - slices grow from center outward
- **Center stat** - Shows overall "Life Balance Index" (0-100)
- **Interactive hover** - Highlights segment, shows tooltip with details
- **Responsive legend** - Below chart on mobile, side on desktop
- **Empty state** - Shows placeholder when user hasn't completed launchpad

### Files to Create/Modify

**New Files:**
1. `src/hooks/useLifeAnalysis.ts` - Data aggregation hook
2. `src/components/dashboard/v2/LifeAnalysisChart.tsx` - New pie chart component

**Modified Files:**
1. `src/components/dashboard/v2/index.ts` - Export new component
2. Dashboard views that use WeeklyActivityChart - Replace with LifeAnalysisChart

### Code Example (Pie Chart)

```tsx
const PILLAR_COLORS = {
  personality: 'hsl(221 83% 53%)',    // Blue
  business: 'hsl(38 92% 50%)',        // Amber
  health: 'hsl(0 84% 60%)',           // Red
  relationships: 'hsl(330 80% 60%)',  // Pink
  finances: 'hsl(152 69% 45%)',       // Emerald
  learning: 'hsl(239 84% 67%)',       // Indigo
  purpose: 'hsl(270 76% 60%)',        // Purple
};

<ResponsiveContainer>
  <PieChart>
    <Pie
      data={chartData}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      innerRadius={60}
      outerRadius={80}
      paddingAngle={2}
    >
      {chartData.map((entry) => (
        <Cell 
          key={entry.id} 
          fill={PILLAR_COLORS[entry.id]}
          stroke="none"
        />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

### Fallback Behavior
- If user hasn't completed launchpad: Show equal distribution with "Complete your journey to unlock insights" message
- If some pillars have 0: Show them as thin slices (minimum 5% visual representation)
- Keep the card structure consistent with current design

This transforms the dashboard from showing "what you did this week" to "who you are and what you're building" - much more aligned with the Life OS concept.
