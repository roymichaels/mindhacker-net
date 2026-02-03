
# Translation System Expansion Plan

## Overview
This plan expands the Hebrew/English translation system to cover all untranslated strings in the application, particularly focusing on the panel pages where many strings are hardcoded using `isHebrew ? 'text' : 'text'` patterns instead of the `t()` translation function.

## Current State Analysis

### Translation System Structure
- **Hebrew translations**: `src/i18n/translations/he.ts` (2,695 lines)
- **English translations**: `src/i18n/translations/en.ts` (2,639 lines)
- **Translation hook**: `useTranslation()` returns `t()`, `language`, and `isRTL`

### Issues Identified
Many panel pages use inline conditional translations (`isHebrew ? 'Hebrew' : 'English'`) instead of the centralized `t()` function. This approach:
- Creates inconsistency across the codebase
- Makes future language additions difficult
- Bypasses the centralized translation system

---

## Scope of Changes

### Files Requiring Translation Updates

#### Panel Dashboard & Navigation
1. **CoachDashboard.tsx** - 12 hardcoded strings
2. **CoachAnalytics.tsx** - 18 hardcoded strings
3. **AffiliateDashboard.tsx** - 14 hardcoded strings
4. **CoachContent.tsx** - 15+ hardcoded strings
5. **CoachTheme.tsx** - 10+ hardcoded strings
6. **MyClients.tsx** - 20+ hardcoded strings
7. **MyCalendar.tsx** - Needs review
8. **MyEarnings.tsx** - Needs review
9. **MyLinks.tsx** - Needs review
10. **MyReferrals.tsx** - Needs review
11. **MyPayouts.tsx** - Needs review

#### Storefront & Profile
12. **StorefrontSettings.tsx** - Uses `t()` but needs additional keys for missing strings
13. **ClientProfile.tsx** - Needs review
14. **UserProfile.tsx** - Needs review

---

## Implementation Plan

### Phase 1: Expand Translation Keys

Add new translation keys to both `he.ts` and `en.ts`:

```typescript
// New keys for panel.coach section
coach: {
  dashboard: "דאשבורד הפרקטיקה",
  dashboardSubtitle: "סקירה כללית של הפרקטיקה שלך",
  activeClients: "לקוחות פעילים",
  sessionsThisWeek: "פגישות השבוע",
  monthlyEarnings: "הכנסות החודש",
  satisfactionRate: "שביעות רצון",
  upcomingSessions: "פגישות קרובות",
  noScheduledSessions: "אין פגישות מתוכננות",
  recentActivity: "פעילות אחרונה",
  noRecentActivity: "אין פעילות אחרונה",
  
  // Content page
  myContent: "התכנים שלי",
  manageContent: "נהל את הקורסים והתכנים שלך",
  totalCourses: "סה\"כ קורסים",
  totalEnrollments: "סה\"כ נרשמים",
  totalViews: "צפיות",
  avgRating: "דירוג ממוצע",
  myCourses: "הקורסים שלי",
  allYourContent: "כל הקורסים והתכנים שיצרת",
  noContentYet: "עדיין אין לך תכנים",
  stats: "סטטיסטיקות",
  published: "פורסם",
  draft: "טיוטה",
  archived: "בארכיון",
  
  // Analytics
  analytics: "אנליטיקס",
  trackPerformance: "מעקב אחר הביצועים שלך",
  clientGrowth: "צמיחת לקוחות",
  last30Days: "30 הימים האחרונים",
  coursePerformance: "ביצועי קורסים",
  enrollmentsByCourse: "נרשמים לפי קורס",
  noDataToDisplay: "אין נתונים להצגה",
  contentViews: "צפיות בתכנים",
  
  // Reviews
  myReviews: "הביקורות שלי",
  reviewsDescription: "צפה בביקורות שקיבלת מלקוחות",
  
  // Theme
  themeSettings: "ערכת נושא",
  customizeLook: "התאם אישית את המראה של הפרופיל ודפי הנחיתה שלך",
  colors: "צבעים",
  chooseColors: "בחר את צבעי המותג שלך",
  primaryColor: "צבע ראשי",
  secondaryColor: "צבע משני",
  images: "תמונות",
  uploadImages: "העלה תמונות לפרופיל שלך",
}

// New keys for panel.affiliate section
affiliateDashboard: {
  title: "דאשבורד שותפים",
  subtitle: "סקירת הביצועים שלך",
  monthlyClicks: "קליקים החודש",
  referrals: "הפניות",
  commissions: "עמלות",
  conversionRate: "המרה",
  topLinks: "הקישורים המובילים",
  recentReferrals: "הפניות אחרונות",
  noDataYet: "אין נתונים עדיין",
  noRecentReferrals: "אין הפניות אחרונות",
}

// Additional panel.clients keys
clients: {
  myClients: "הלקוחות שלי",
  manageClients: "נהל את הלקוחות והמטופלים שלך",
  addClient: "הוסף לקוח",
  totalClients: "סה\"כ לקוחות",
  activeClients: "לקוחות פעילים",
  completed: "הושלמו",
  clientList: "רשימת לקוחות",
  allClientsLinked: "כל הלקוחות המקושרים אליך",
  noClientsYet: "עדיין אין לך לקוחות",
  addClientsToManage: "הוסף לקוחות כדי לנהל את הקשר איתם",
  addFirstClient: "הוסף לקוח ראשון",
  unnamedClient: "לקוח ללא שם",
  hasNotes: "יש הערות",
  viewProfile: "צפה בפרופיל",
  sendMessage: "שלח הודעה",
  scheduleSession: "קבע פגישה",
  statusActive: "פעיל",
  statusInactive: "לא פעיל",
  statusCompleted: "הושלם",
}
```

### Phase 2: Refactor Panel Pages

Convert all `isHebrew ? 'text' : 'text'` patterns to use `t()`:

**Before:**
```typescript
const { language } = useTranslation();
const isHebrew = language === 'he';
// ...
<h1>{isHebrew ? 'דאשבורד הפרקטיקה' : 'Practice Dashboard'}</h1>
```

**After:**
```typescript
const { t } = useTranslation();
// ...
<h1>{t('panel.coach.dashboard')}</h1>
```

### Phase 3: Update Components

Files to update (in order of priority):

| Priority | File | Estimated Strings |
|----------|------|-------------------|
| High | CoachDashboard.tsx | 12 |
| High | CoachAnalytics.tsx | 18 |
| High | MyClients.tsx | 20 |
| High | AffiliateDashboard.tsx | 14 |
| Medium | CoachContent.tsx | 15 |
| Medium | CoachTheme.tsx | 10 |
| Medium | CoachReviews.tsx | ~8 |
| Medium | MyCalendar.tsx | ~10 |
| Medium | MyEarnings.tsx | ~10 |
| Low | MyLinks.tsx | ~8 |
| Low | MyReferrals.tsx | ~10 |
| Low | MyPayouts.tsx | ~8 |

---

## Technical Implementation Details

### Step 1: Add Translation Keys to he.ts
Add approximately 150 new translation keys organized under:
- `panel.coach.*` - Coach/practitioner panel strings
- `panel.clients.*` - Client management strings  
- `panel.affiliateDashboard.*` - Affiliate dashboard strings
- `panel.analytics.*` - Analytics page strings

### Step 2: Add Translation Keys to en.ts
Mirror all Hebrew keys with English translations.

### Step 3: Refactor Each Panel Page
For each file:
1. Change `const { language } = useTranslation()` to `const { t } = useTranslation()`
2. Remove `const isHebrew = language === 'he'` where no longer needed
3. Replace all inline conditionals with `t('key')` calls
4. Keep `isRTL` for RTL-specific layout handling

### Step 4: Verify StorefrontSettings.tsx
Add any missing translation keys used by this file:
- `storefrontSettings` - Main title
- `customizeYourStorefront` - Subtitle
- `yourStorefrontUrl` - URL label
- `copiedToClipboard` - Toast message
- Various field labels

---

## Files to Create/Modify

### Modifications Required

1. **src/i18n/translations/he.ts**
   - Add ~150 new keys under `panel.*` sections
   
2. **src/i18n/translations/en.ts**
   - Add corresponding English translations

3. **src/pages/panel/CoachDashboard.tsx**
   - Refactor to use `t()` function

4. **src/pages/panel/CoachAnalytics.tsx**
   - Refactor to use `t()` function

5. **src/pages/panel/AffiliateDashboard.tsx**
   - Refactor to use `t()` function

6. **src/pages/panel/MyClients.tsx**
   - Refactor to use `t()` function

7. **src/pages/panel/CoachContent.tsx**
   - Refactor to use `t()` function

8. **src/pages/panel/CoachTheme.tsx**
   - Refactor to use `t()` function

9. **src/pages/panel/CoachReviews.tsx**
   - Refactor to use `t()` function

10. **src/pages/panel/MyCalendar.tsx**
    - Refactor to use `t()` function

11. **src/pages/panel/MyEarnings.tsx**
    - Refactor to use `t()` function

12. **src/pages/panel/MyLinks.tsx**
    - Refactor to use `t()` function

13. **src/pages/panel/MyReferrals.tsx**
    - Refactor to use `t()` function

14. **src/pages/panel/MyPayouts.tsx**
    - Refactor to use `t()` function

---

## Benefits

1. **Consistency**: All translations go through a single system
2. **Maintainability**: Adding new languages requires updating only the translation files
3. **Type Safety**: TypeScript will catch missing translation keys
4. **Scalability**: Easy to add more languages in the future
5. **Mobile Optimization**: Proper RTL support already in place via `isRTL`

---

## Estimated Effort

- Translation file updates: ~200 new keys
- Page refactoring: 12-14 files
- Testing: Verify all panels in both Hebrew and English
