
# Translation Standardization Plan

## Summary
The codebase has **128 files** with hardcoded inline translations using `isHebrew ? '...' : '...'` or `language === 'he' ? '...' : '...'` patterns instead of the centralized `t()` translation function. This violates the established translation standardization policy and makes maintenance difficult.

## Current State Analysis

The project already has a robust translation infrastructure:
- **Translation files**: `src/i18n/translations/he.ts` (3,085 lines) and `en.ts` (3,029 lines)
- **Translation hook**: `useTranslation()` providing `t()` function
- **Language context**: `LanguageContext` for language state management

However, many components bypass this system with inline conditionals.

## Files Requiring Translation Updates

### High Priority - Business Hub (6 modals)
1. `src/components/business-hub/modals/FinancialsModal.tsx`
2. `src/components/business-hub/modals/MarketingModal.tsx`
3. `src/components/business-hub/modals/OperationsModal.tsx`
4. `src/components/business-hub/modals/StrategyModal.tsx`
5. `src/components/business-hub/modals/BrandingModal.tsx`
6. `src/components/business-hub/modals/GrowthModal.tsx`
7. `src/components/business-hub/BusinessToolsGrid.tsx`
8. `src/components/business-hub/BusinessStatusCard.tsx`

### High Priority - Health Hub (6 modals)
1. `src/components/health-hub/modals/PhysicalHealthModal.tsx`
2. `src/components/health-hub/modals/MentalHealthModal.tsx`
3. `src/components/health-hub/modals/EnergeticHealthModal.tsx`
4. `src/components/health-hub/modals/SubconsciousHealthModal.tsx`
5. `src/components/health-hub/modals/SleepModal.tsx`
6. `src/components/health-hub/modals/MeditationModal.tsx`
7. `src/components/health-hub/HealthToolsGrid.tsx`

### Medium Priority - Journey Components
- Learning Journey steps (8 files)
- Finance Journey steps (8 files)
- Relationships Journey steps (8 files)
- Business Journey steps (existing files)
- Health Journey steps (8 files)

### Other Components (100+ files)
- Dashboard components
- Panel pages
- Unified components
- Sidebar and navigation

## Implementation Approach

### Step 1: Add Translation Keys to he.ts and en.ts

Add new translation sections for:

```text
businessHub:
  modals:
    financials:
      title: Financials / פיננסים
      financialHealth: Financial Health / בריאות פיננסית
      revenue: Revenue / הכנסות
      expenses: Expenses / הוצאות
      profit: Profit / רווח
      savings: Savings / חיסכון
      comingSoon: Coming soon / בקרוב
      comingSoonNotice: Full financial tracking coming soon...
    marketing:
      title: Marketing / שיווק
      marketingPerformance: Marketing Performance / ביצועי שיווק
      reach: Reach / חשיפה
      engagement: Engagement / מעורבות
      leads: Leads / לידים
      conversion: Conversion / המרה
    operations:
      title: Operations / תפעול
      operationalEfficiency: Operational Efficiency / יעילות תפעולית
      efficiency: Efficiency / יעילות
      productivity: Productivity / פרודוקטיביות
      tasks: Tasks / משימות
      processes: Processes / תהליכים
    strategy:
      title: Strategy / אסטרטגיה
      strategicClarity: Strategic Clarity / בהירות אסטרטגית
      vision: Vision / חזון
      goals: Goals / יעדים
      roadmap: Roadmap / מפת דרכים
      innovation: Innovation / חדשנות
    branding:
      title: Branding / מיתוג
      brandStrength: Brand Strength / חוזק מותג
      identity: Identity / זהות
      visuals: Visuals / ויזואל
      typography: Typography / טיפוגרפיה
      colors: Colors / צבעים
    growth:
      title: Growth / צמיחה
      growthRate: Growth Rate / קצב צמיחה
      revenueGrowth: Revenue Growth / צמיחת הכנסות
      customerGrowth: Customer Growth / צמיחת לקוחות
      momentum: Momentum / מומנטום
      goalAchievement: Goal Achievement / השגת יעדים
  tools:
    financials: Financials / פיננסים
    marketing: Marketing / שיווק
    operations: Operations / תפעול
    strategy: Strategy / אסטרטגיה
    branding: Branding / מיתוג
    growth: Growth / צמיחה
    hypnosis: Business Hypnosis / היפנוזה עסקית
    90DayPlan: 90-Day Plan / תוכנית 90 יום

healthHub:
  modals:
    physical:
      title: Physical Health / בריאות פיזית
      overallScore: Overall Score / ציון כללי
      physicalActivity: Physical Activity / פעילות גופנית
      nutrition: Nutrition / תזונה
      sleepQuality: Sleep Quality / איכות שינה
      hydration: Hydration / הידרציה
      improvementRecommendations: Improvement Recommendations / המלצות לשיפור
    mental:
      title: Mental Health / בריאות נפשית
      stressLevel: Stress Level / רמת מתח
      stressRelief: Stress Relief Hypnosis / היפנוזה להפחתת מתח
      mentalResilience: Build Mental Resilience / חיזוק חוסן נפשי
      improveFocus: Improve Focus / שיפור ריכוז
      chatWithAurora: Chat with Aurora to share how you're feeling / צ׳אט עם אורורה...
    energetic:
      title: Energy Health / בריאות אנרגטית
      energyLevel: Energy Level / רמת אנרגיה
      energyHypnosis: Energy Hypnosis / היפנוזה לאנרגיה
      vitalityBoost: Vitality Boost / חיזוק חיוניות
      consecutiveDays: consecutive days of health activity / ימים רצופים...
    subconscious:
      title: Subconscious / תת-מודע
      discoverRelease: Discover and release limiting beliefs / גלה ושחרר...
      commonAreas: Common Areas to Work On / תחומים נפוצים לעבודה
      bodyImage: Body Image / דימוי גוף
      healthAnxiety: Health Anxiety / חרדת בריאות
      selfSabotage: Self-Sabotage / חבלה עצמית
      emotionalEating: Emotional Eating / אכילה רגשית
      deepWork: Deep Work / עבודה עמוקה
    sleep:
      title: Sleep / שינה
      sleepQuality: Sleep Quality / איכות שינה
      deepSleepHypnosis: Deep Sleep Hypnosis / היפנוזה לשינה עמוקה
      tipsForBetterSleep: Tips for Better Sleep / טיפים לשינה טובה יותר
      keepConsistentHours: Keep consistent hours / שמור על שעות קבועות
      avoidScreens: Avoid screens / הימנע ממסכים
      comfortableEnvironment: Comfortable environment / סביבה נוחה
    meditation:
      title: Breathing & Meditation / נשימה ומדיטציה
      boxBreathing: Box Breathing / נשימה מרובעת
      relaxationBreath: Relaxation Breath / נשימת הרפיה
      breatheIn: Breathe in... / שאפו...
      hold: Hold... / החזיקו...
      breatheOut: Breathe out... / נשפו...
      wait: Wait... / המתינו...
      pressToStart: Press to start / לחצו להתחיל
      start: Start / התחל
      stop: Stop / עצור
      cyclesCompleted: cycles completed / מחזורים הושלמו
  tools:
    physical: Physical Health / בריאות פיזית
    mental: Mental Health / בריאות נפשית
    energetic: Energy Health / בריאות אנרגטית
    subconscious: Subconscious / תת-מודע
    hypnosis: Health Hypnosis / היפנוזה לבריאות
    habits: Habits / הרגלים
    meditation: Meditation & Breathing / מדיטציה ונשימה
    sleep: Sleep / שינה
```

### Step 2: Refactor Components to Use t() Function

For each component, replace inline conditionals with translation keys:

**Before:**
```typescript
const isHebrew = language === 'he';
// ...
<DialogTitle>{isHebrew ? 'פיננסים' : 'Financials'}</DialogTitle>
```

**After:**
```typescript
const { t } = useTranslation();
// ...
<DialogTitle>{t('businessHub.modals.financials.title')}</DialogTitle>
```

### Step 3: Remove language prop from components

Components should use `useTranslation()` hook instead of receiving `language` as a prop.

**Before:**
```typescript
interface FinancialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}
```

**After:**
```typescript
interface FinancialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

## Implementation Order

Due to the scope (128 files), I recommend implementing in phases:

**Phase 1: Business Hub Components** (8 files)
- Add translation keys for businessHub section
- Refactor all 6 modals + 2 grid/card components

**Phase 2: Health Hub Components** (7 files)
- Add translation keys for healthHub section
- Refactor all 6 modals + tools grid

**Phase 3: Journey Components** (~40 files)
- Learning, Finance, Relationships, Business, Health journeys
- Each journey has 8+ step components

**Phase 4: Remaining Components** (~70+ files)
- Dashboard components
- Panel pages
- Other UI components

## Technical Notes

- Each modal component has ~5-15 translation strings
- Helper functions within components (like `getActivityLabel`) should also use translation keys
- Metric arrays with `titleHe`/`titleEn` pattern should be refactored to use translation keys
- Consider creating reusable translation patterns for common UI elements (Coming soon, Not specified, etc.)
