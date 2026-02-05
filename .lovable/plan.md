
# Rebranding: Mind Hacker → MindOS / מיינדOS

## ✅ COMPLETED

All rebranding changes have been implemented.

## Overview
Complete rebranding of the application from "Mind Hacker / מיינד האקר" to "MindOS / מיינדOS". This aligns with the existing "Life Operating System" positioning already present in some areas (PWA manifest, homepage hero).

---

## Scope of Changes

### 1. Translation Files (Primary Brand References)
**Files:** `src/i18n/translations/he.ts`, `src/i18n/translations/en.ts`

| Location | Current | New |
|----------|---------|-----|
| `header.brandName` | מיינד האקר / Mind Hacker | מיינדOS / MindOS |
| `footer.copyright` | © 2025 מיינד האקר / Mind Hacker | © 2025 MindOS |
| `toast.welcomeNew` | ברוך הבא למיינד האקר | ברוך הבא ל-MindOS |
| `seo.indexTitle` | Mind Hacker \| AI-Powered... | MindOS \| AI-Powered... |
| `seo.indexKeywords` | ...Mind Hacker | ...MindOS |
| `about.name` | Mind Hacker Team | MindOS Team |
| `about.defaultStory` | Mind Hacker was built... | MindOS was built... |
| `invitation.signature` | Mind Hacker Team | MindOS Team |
| `chatWidget.assistantName` | Mind Hacker Assistant | MindOS Assistant |
| `exitIntent.imageAlt` | Mind Hacker | MindOS |
| `personalHypnosis.seo*` | ...Mind Hacker... | ...MindOS... |
| `consciousnessLeapLanding.brandName` | מיינד האקר / Mind Hacker | מיינדOS / MindOS |
| `consciousnessLeapLanding.aboutSectionTitleHighlight` | Mind Hacker | MindOS |
| `consciousnessLeapLanding.aboutText1` | Mind Hacker is... | MindOS is... |
| `progressiveEngagement.welcomeTitle` | ברוכים הבאים למיינד האקר | ברוכים הבאים ל-MindOS |
| `community.pageTitle` | קהילה \| מיינד האקר | קהילה \| MindOS |
| `legal.privacy.seoTitle` | מדיניות פרטיות \| מיינד האקר | מדיניות פרטיות \| MindOS |
| `legal.terms.seoTitle` | תנאי שימוש \| מיינד האקר | תנאי שימוש \| MindOS |

---

### 2. Default Theme Settings (Fallback Values)
**File:** `src/hooks/useThemeSettings.ts`

```text
Line 92:  brand_name: "מיינד האקר" → "מיינדOS"
Line 93:  brand_name_en: "Mind Hacker" → "MindOS"
Line 94:  company_legal_name: "Mind Hacker OÜ" → "MindOS OÜ"
Line 138: site_url: "https://mind-hacker.net" → "https://mindos.app" (or current domain)
```

---

### 3. PWA Install Page
**File:** `src/pages/Install.tsx`

```text
Line 38: title: 'התקן את האפליקציה | מיינד האקר' → '...| MindOS'
Line 39: description: 'התקן את אפליקציית מיינד האקר...' → '...MindOS...'
Line 70: <h1>מיינד האקר</h1> → <h1>MindOS</h1>
```

---

### 4. PWA Hook
**File:** `src/hooks/usePWA.ts`

```text
Line 132: 'בחר "התקן את מיינד האקר"' → 'בחר "התקן את MindOS"'
```

---

### 5. Subscriptions Page
**File:** `src/pages/Subscriptions.tsx`

```text
Line 230: 'הצטרף למיינד האקר...' → 'הצטרף ל-MindOS...'
```

---

### 6. Admin Theme Page (Placeholder)
**File:** `src/pages/admin/Theme.tsx`

```text
Line 703: placeholder="מיינד האקר" → placeholder="מיינדOS"
```

---

### 7. PDF Cover Page
**File:** `src/components/pdf/PDFCoverPage.tsx`

```text
Line 26: <span>MH</span> → <span>מO</span> or use Orb icon
Line 48: <p>MindHacker.net</p> → <p>MindOS</p>
```

---

### 8. Storefront Settings (Domain References)
**File:** `src/pages/panel/StorefrontSettings.tsx`

```text
Line 439: '.mindhacker.net' → '.mindos.app' (or new domain)
Line 462: 'Value: mindhacker.net' → 'Value: mindos.app'
```

---

### 9. Legal Pages (Company Name in Content)
**Files:** `src/i18n/translations/he.ts`, `src/i18n/translations/en.ts`

Update all legal content references:
- `legal.company.name`: "Mind Hacker OÜ" → "MindOS OÜ"
- `legal.privacy.introText`: References to "Mind Hacker OÜ"
- `legal.terms.acceptanceText`: References to "Mind Hacker OÜ"
- `legal.terms.servicesIntro`: References to "Mind Hacker OÜ"
- `legal.terms.liabilityText`: References to "Mind Hacker OÜ"

---

### 10. Database Update (Live Brand Settings)
Update `theme_settings` table via SQL migration:

```sql
UPDATE theme_settings SET setting_value = 'מיינדOS' WHERE setting_key = 'brand_name';
UPDATE theme_settings SET setting_value = 'MindOS' WHERE setting_key = 'brand_name_en';
UPDATE theme_settings SET setting_value = 'MindOS OÜ' WHERE setting_key = 'company_legal_name';
```

---

## Summary Statistics

| Category | Files | Changes |
|----------|-------|---------|
| Translation files | 2 | ~50 string updates |
| Theme/Config | 2 | 4 default values |
| Pages | 4 | 6 hardcoded strings |
| Components | 1 | 2 PDF text elements |
| Database | 1 migration | 3 settings |

**Total: ~10 files, ~65 changes**

---

## Technical Notes

1. **No visual design changes** - only text/brand name swaps
2. **PWA manifest in vite.config.ts** already uses "MindOS" - no change needed
3. **Domain URL** updates are optional and depend on the actual domain being used
4. **Company legal name** change should be verified with actual registration before updating legal pages
