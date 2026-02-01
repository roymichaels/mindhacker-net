
# Multi-Tenant Practitioner Platform (Shopify-like Architecture)

## Overview
Transform the platform into a Shopify-like multi-tenant system where each practitioner operates as a completely independent "storefront" with their own:
- Custom domain/subdomain support
- Isolated client authentication system
- Complete white-label experience
- Independent content, products, and client management

---

## Architecture Design

### Domain & Routing Strategy

```text
Mind Hacker Platform (Main)
├── mindhacker.net                    → Main platform landing
├── mindhacker.net/practitioners      → Directory of all coaches
│
Practitioner Storefronts (Isolated)
├── dean.mindhacker.net              → Dean's subdomain storefront
├── coach-dana.com                   → Custom domain (CNAME)
├── /:practitionerSlug/*             → Fallback path-based routing
```

Each practitioner gets:
1. **Subdomain**: `{slug}.mindhacker.net` (automatic)
2. **Custom Domain**: `their-domain.com` (optional, self-configured)
3. **Path-based Fallback**: `/p/{slug}/*` for development/testing

---

## Phase 1: Database Schema Extensions

### 1.1 Practitioner Platform Settings
New table: `practitioner_settings`
```sql
CREATE TABLE practitioner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  -- Domain Configuration
  custom_domain TEXT UNIQUE,           -- e.g., "coach-dana.com"
  subdomain TEXT UNIQUE,               -- e.g., "dana" for dana.mindhacker.net
  domain_verified BOOLEAN DEFAULT false,
  -- Branding
  logo_url TEXT,
  favicon_url TEXT,
  brand_color TEXT DEFAULT '#e91e63',
  brand_color_secondary TEXT,
  -- Landing Page Config
  hero_heading_he TEXT,
  hero_heading_en TEXT,
  hero_subheading_he TEXT,
  hero_subheading_en TEXT,
  about_section JSONB,
  -- Feature Toggles
  enable_courses BOOLEAN DEFAULT true,
  enable_services BOOLEAN DEFAULT true,
  enable_products BOOLEAN DEFAULT true,
  enable_community BOOLEAN DEFAULT false,
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  -- Settings
  default_language TEXT DEFAULT 'he',
  timezone TEXT DEFAULT 'Asia/Jerusalem',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(practitioner_id)
);
```

### 1.2 Practitioner Client Accounts (Separate Auth Context)
New table: `practitioner_client_profiles`
```sql
CREATE TABLE practitioner_client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                                    -- auth.users reference
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  -- Profile data scoped to this practitioner
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  notes TEXT,
  tags TEXT[],
  -- Engagement
  total_sessions INTEGER DEFAULT 0,
  total_purchases NUMERIC DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, practitioner_id)
);
```

### 1.3 Practitioner-Scoped Tables Updates
Add `practitioner_id` to existing tables that need isolation:
- `content_purchases` (add practitioner_id for direct filtering)
- `course_enrollments` (add practitioner_id)
- `conversations` (add practitioner_id for client messaging)

---

## Phase 2: Routing Infrastructure

### 2.1 Practitioner Context Provider
New context to detect and load practitioner based on domain/path:

```typescript
// src/contexts/PractitionerContext.tsx
interface PractitionerContextType {
  practitioner: Practitioner | null;
  isLoading: boolean;
  isStandalone: boolean;      // true when on practitioner's domain
  practitionerSlug: string | null;
}
```

**Detection Logic:**
1. Check hostname for custom domain → lookup `practitioner_settings.custom_domain`
2. Check hostname for subdomain → lookup `practitioner_settings.subdomain`
3. Check URL path `/p/:slug/*` → lookup `practitioners.slug`
4. No match → render main platform

### 2.2 Dynamic Route Structure
```text
/p/:practitionerSlug/                    → Practitioner Landing (Homepage)
/p/:practitionerSlug/login               → Client Login (practitioner-scoped)
/p/:practitionerSlug/signup              → Client Signup
/p/:practitionerSlug/courses             → Practitioner's Courses
/p/:practitionerSlug/courses/:courseId   → Course Detail
/p/:practitionerSlug/watch/:episodeId    → Course Watch
/p/:practitionerSlug/services            → Services
/p/:practitionerSlug/book/:serviceId     → Booking Flow
/p/:practitionerSlug/products            → Digital Products
/p/:practitionerSlug/dashboard           → Client Dashboard
/p/:practitionerSlug/profile             → Client Profile
/p/:practitionerSlug/messages            → Messages with Coach
```

---

## Phase 3: Isolated Client Authentication

### 3.1 Client Auth Flow
Clients signing up on a practitioner's storefront:
1. Use same Supabase auth (single auth.users table)
2. Create profile in main `profiles` table
3. Create entry in `practitioner_client_profiles` (links client to practitioner)
4. Create entry in `practitioner_clients` (relationship table)

### 3.2 Practitioner-Scoped Auth Context
```typescript
// src/contexts/PractitionerAuthContext.tsx
interface PractitionerAuthContextType {
  client: User | null;
  clientProfile: PractitionerClientProfile | null;
  practitioner: Practitioner;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

### 3.3 Auth Middleware
```typescript
// Practitioner-scoped ProtectedRoute
<PractitionerProtectedRoute practitionerId={practitioner.id}>
  <ClientDashboard />
</PractitionerProtectedRoute>
```

---

## Phase 4: Practitioner Storefront Components

### 4.1 New Pages Structure
```text
src/pages/storefront/
├── StorefrontLayout.tsx          → Wrapper with practitioner context
├── StorefrontHome.tsx            → Landing page (customizable)
├── StorefrontLogin.tsx           → Client login
├── StorefrontSignup.tsx          → Client signup
├── StorefrontCourses.tsx         → Practitioner's courses
├── StorefrontCourseDetail.tsx    → Course detail
├── StorefrontCourseWatch.tsx     → Video player
├── StorefrontServices.tsx        → Services list
├── StorefrontBooking.tsx         → Booking flow
├── StorefrontProducts.tsx        → Digital products
├── StorefrontClientDashboard.tsx → Client's dashboard
├── StorefrontClientProfile.tsx   → Client profile
└── StorefrontMessages.tsx        → Messaging with coach
```

### 4.2 Storefront Header/Footer
White-labeled components that use practitioner's branding:
- Show practitioner logo (not Mind Hacker)
- Use practitioner brand colors
- Practitioner's social links
- Practitioner's contact info

---

## Phase 5: Coach Panel Extensions

### 5.1 New Panel Sections
Add to `/coach/*` routes:

```text
/coach/storefront                 → Storefront settings
  ├── /branding                  → Logo, colors, favicon
  ├── /domain                    → Custom domain setup
  ├── /homepage                  → Landing page builder
  └── /navigation                → Menu customization

/coach/clients/:clientId
  ├── Overview                   → Client summary
  ├── Progress                   → Course progress
  ├── Purchases                  → Purchase history
  ├── Sessions                   → Session history
  └── Notes                      → Private notes
```

### 5.2 Sidebar Updates
Add new nav group "My Storefront":
- Storefront Settings
- Domain & Branding
- Landing Page
- Preview Site

---

## Phase 6: RLS Policies

### 6.1 Practitioner Client Profiles
```sql
-- Practitioners can view their own clients
CREATE POLICY "Coaches view own client profiles"
ON practitioner_client_profiles FOR SELECT TO authenticated
USING (
  practitioner_id = get_practitioner_id_for_user(auth.uid())
);

-- Clients can view their own profile per practitioner
CREATE POLICY "Clients view own profile"
ON practitioner_client_profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());
```

### 6.2 Content Isolation
```sql
-- Clients only see content from their practitioner
CREATE POLICY "Clients see practitioner content"
ON content_products FOR SELECT TO authenticated
USING (
  practitioner_id IN (
    SELECT practitioner_id FROM practitioner_client_profiles
    WHERE user_id = auth.uid()
  )
  OR practitioner_id IS NULL  -- Platform-wide content
);
```

---

## Implementation Order

### Sprint 1: Foundation (Database + Context)
1. Create `practitioner_settings` table with migration
2. Create `practitioner_client_profiles` table
3. Implement `PractitionerContext` provider
4. Add subdomain/domain detection logic

### Sprint 2: Auth System
5. Create `PractitionerAuthContext`
6. Build `StorefrontLogin` and `StorefrontSignup` pages
7. Implement `PractitionerProtectedRoute`
8. RLS policies for client data isolation

### Sprint 3: Storefront Pages
9. `StorefrontLayout` with white-label header/footer
10. `StorefrontHome` (landing page)
11. `StorefrontCourses` + `StorefrontCourseDetail`
12. `StorefrontClientDashboard`

### Sprint 4: Coach Panel Extensions
13. Add storefront settings pages to coach panel
14. Domain configuration UI
15. Branding/theming editor
16. Preview functionality

### Sprint 5: Advanced Features
17. Custom domain verification flow
18. Client messaging system
19. Client progress tracking
20. Analytics per practitioner

---

## Technical Summary

### New Files to Create
| File | Purpose |
|------|---------|
| `src/contexts/PractitionerContext.tsx` | Detect & load practitioner from domain/path |
| `src/contexts/PractitionerAuthContext.tsx` | Scoped auth for practitioner clients |
| `src/components/storefront/StorefrontHeader.tsx` | White-label header |
| `src/components/storefront/StorefrontFooter.tsx` | White-label footer |
| `src/pages/storefront/*.tsx` | All storefront pages |
| `src/pages/panel/StorefrontSettings.tsx` | Coach panel storefront config |
| `src/hooks/usePractitionerContext.ts` | Hook for practitioner context |
| `src/hooks/usePractitionerAuth.ts` | Hook for practitioner-scoped auth |

### Database Migrations
1. `practitioner_settings` table
2. `practitioner_client_profiles` table
3. Add `practitioner_id` to `content_purchases`
4. RLS policies for all new tables

### Route Structure
```text
Main Platform: /*
Storefront:    /p/:practitionerSlug/*
Coach Panel:   /coach/* (extended with storefront settings)
```

---

## Benefits
1. **True Isolation**: Each practitioner's clients only see that practitioner's content
2. **White-Label**: Clients experience the practitioner's brand, not Mind Hacker
3. **Custom Domains**: Practitioners can use their own domain
4. **Independent Operations**: Each coach can run completely independently
5. **Scalable**: Add unlimited practitioners without affecting each other
6. **Single Codebase**: One app serves all practitioners
