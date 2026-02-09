
# Launch Readiness Plan: Mind OS Production Deployment

## Current State Assessment
The app is feature-rich with 35+ edge functions, 8 life pillars, AI coaching (Aurora), hypnosis, gamification, PWA support, multi-tenant coach storefronts, and a comprehensive admin/coach panel. However, several areas need hardening before a public launch.

## Phase 1: Security Hardening (Critical)

### 1.1 Fix Overly Permissive RLS Policies
The database linter found **18 tables with `USING (true)` or `WITH CHECK (true)`** on INSERT/UPDATE/DELETE operations. This is the most critical issue.

**Action:** Run a security scan to identify exactly which tables are affected, then tighten RLS policies to scope write operations to authenticated users or row owners. Some tables (like `leads`) intentionally allow anonymous INSERT -- those will be left as-is per existing design decisions.

### 1.2 Fix Function Search Path Vulnerability
3 database functions have mutable search paths, which could allow SQL injection via search_path manipulation.

**Action:** Add `SET search_path = public` to all affected functions.

### 1.3 Enable Leaked Password Protection
Currently disabled. This should be enabled to prevent users from registering with known-compromised passwords.

### 1.4 Remove Debug Console Logs
Found **171 `console.log()` calls across 14 files**. These leak internal state information in production.

**Action:** Replace debug-level `console.log` calls with the existing `debug.log()` utility (which only logs in development), or remove them entirely. Keep `console.error` for genuine error reporting.

## Phase 2: Branding Consistency Fixes

### 2.1 Fix Stale Branding in index.html
- `apple-mobile-web-app-title` still says "מיינד האקר" (old brand) -- should be "Mind OS"
- `application-name` still says "מיינד האקר" -- should be "Mind OS"
- OG image still points to the default Lovable placeholder image (`lovable.dev/opengraph-image-p98pqg.png`) -- should use the actual Mind OS branded image

### 2.2 Fix sitemap.xml Domain
Sitemap references `mind-hacker.net` instead of `mindos.app`.

### 2.3 Fix robots.txt Sitemap URL
Already correct (`mindos.app`), but verify consistency.

## Phase 3: Production Polish

### 3.1 Remove Bug Report Widget for Production
The bug report FAB widget with its pulsing animation is great for beta testing but distracting for a consumer launch. Either:
- Hide it behind a feature flag / admin-only visibility
- Move it to a Settings page link instead

### 3.2 Error Boundary - Add Bilingual Support
The ErrorBoundary currently only shows Hebrew text. Add English support using the language context or a simple detection.

### 3.3 Custom OG Image
Replace the default Lovable OG image with a branded Mind OS social sharing image for better social media presence when links are shared.

## Phase 4: Performance & SEO

### 4.1 Code Splitting Verification
Already using lazy loading for all pages -- good. Verify the vendor chunk split is optimal.

### 4.2 Sitemap Update
Update sitemap.xml with:
- Correct domain (`mindos.app`)
- All public routes (free journey, practitioners, subscriptions, courses, etc.)
- Current dates

### 4.3 Service Worker / PWA Verification
PWA manifest and service worker are configured. Verify icons exist and the install flow works on iOS and Android.

## Implementation Priority

| Priority | Task | Impact |
|---|---|---|
| P0 | Security scan + fix permissive RLS policies | Data protection |
| P0 | Fix function search paths | SQL injection prevention |
| P1 | Remove/gate console.log calls | Information leak prevention |
| P1 | Fix stale branding (index.html, sitemap) | Brand consistency |
| P1 | Custom OG image replacement | Social sharing quality |
| P2 | Bug report widget production mode | UX polish |
| P2 | Bilingual error boundary | Accessibility |
| P2 | Update sitemap with all routes | SEO |

## Technical Details

### Files to Edit
1. **`index.html`** -- Fix apple-mobile-web-app-title, application-name, OG image references
2. **`public/sitemap.xml`** -- Update domain to mindos.app, add all public routes
3. **`src/components/BugReportWidget.tsx`** -- Add production mode gate (show only for admins or hide)
4. **`src/components/ErrorBoundary.tsx`** -- Add bilingual support
5. **Multiple files (14)** -- Replace `console.log` with `debug.log` or remove
6. **Database migration** -- Fix RLS policies and function search paths
7. **`src/lib/seo.ts`** -- Update default OG image fallback URL

### Database Changes Required
- SQL migration to fix 3 function search paths
- SQL migration to tighten ~18 overly permissive RLS policies (after identifying which are intentional vs. accidental)
- Enable leaked password protection

### No New Dependencies Required
All changes use existing infrastructure and patterns.
