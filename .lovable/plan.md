
# Project Cleanup & Multi-Tenant Coach Platform Integration

## Executive Summary
This plan consolidates the codebase by removing redundant files, unifying panel architecture, and ensuring proper multi-tenant support for coaches with their courses, content, and reviews.

---

## Phase 1: Remove Duplicate/Unused Files

### 1.1 Duplicate Affiliate Dashboard Pages
**Problem**: Two separate affiliate dashboards exist:
- `src/pages/AffiliateDashboard.tsx` (standalone page with Header/Footer)
- `src/pages/panel/AffiliateDashboard.tsx` (panel version)

**Action**: Keep only the panel version. Redirect `/affiliate-dashboard` route to `/affiliate`.

**Files to remove**:
- `src/pages/AffiliateDashboard.tsx`

### 1.2 Unused/Legacy Panel Components
**Problem**: `UnifiedPanel.tsx` and `UnifiedSidebar.tsx` exist but are not used in routes (replaced by separate Admin/Coach/Affiliate panels).

**Action**: Remove these components if not referenced.

**Files to remove**:
- `src/components/panel/UnifiedPanel.tsx`
- `src/components/panel/UnifiedSidebar.tsx`

### 1.3 Consolidate Similar Components
**Problem**: Some dashboard components may have redundancy.

**Files to review**:
- `src/components/dashboard/DashboardRightPanel.tsx` - verify if used
- Check for any dead imports

---

## Phase 2: Panel Architecture Unification

### 2.1 Current Structure (Working Well)
```text
/panel/* -> AdminPanel (admin role)
   ├── Dashboard, Analytics, Notifications
   ├── Users, Roles, Practitioners, Leads
   ├── Offers, Products, Content, Recordings
   └── Theme, Settings, Landing Pages

/coach/* -> CoachPanel (practitioner role)
   ├── Dashboard, Clients, Services
   ├── Calendar, Products, Earnings
   └── Profile, Theme

/affiliate/* -> AffiliatePanel (affiliate role)
   ├── Dashboard, Links
   ├── Referrals, Payouts
   └── (Settings via profile)
```

### 2.2 Add Missing Coach Panel Routes
**Current Gap**: Coach panel lacks full CRUD for their content

**Add Routes**:
- `/coach/content` - Manage their assigned content
- `/coach/reviews` - View/manage reviews for their products
- `/coach/analytics` - Personal analytics dashboard

### 2.3 Unify Sidebar Structure
Ensure all three sidebars follow the same pattern:
- Logo + Control Center title
- RoleSwitcher (for multi-role users)
- ScrollArea with nav groups
- AuroraAccountDropdown at bottom

---

## Phase 3: Multi-Tenant Coach System

### 3.1 Database Schema (Already Exists)
The schema already supports multi-tenancy:
- `practitioners` table with `user_id` linking to auth
- `practitioner_id` foreign key on:
  - `offers`
  - `products` (content_products)
  - `practitioner_services`
  - `practitioner_specialties`
  - `practitioner_reviews`

### 3.2 Add Coach-Client Relationship Table
**New Table**: `practitioner_clients`
```sql
CREATE TABLE practitioner_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  client_user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'active', -- active, inactive, completed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(practitioner_id, client_user_id)
);
```

### 3.3 RLS Policies for Coach Data
**Ensure policies exist for**:
- Coaches can view only their own clients
- Coaches can view only their own products/offers
- Coaches can view reviews for their products
- Clients can leave reviews for coaches they've worked with

### 3.4 Update Coach Client View Hook
Enhance `useCoachClientView.ts` to:
- Verify client is actually linked to this practitioner
- Fetch client's progress on practitioner's courses
- Show session history with this specific practitioner

---

## Phase 4: Reviews & Content Management

### 4.1 Practitioner Reviews (Exists)
Table `practitioner_reviews`:
- `practitioner_id`, `user_id`, `rating`, `review_text`, `is_approved`

### 4.2 Add Coach Reviews Management Page
**New Page**: `/coach/reviews`
- List all reviews for their products
- Filter by product/service
- Respond to reviews (optional)

### 4.3 Content Reviews (Exists)
Table `content_reviews`:
- `product_id`, `user_id`, `rating`, `review_text`, `is_approved`

### 4.4 Coach Content Management
**New Page**: `/coach/content`
- View assigned courses/content
- See enrollment stats per course
- View content reviews

---

## Phase 5: Analytics for Coaches

### 5.1 Coach Analytics Dashboard
**New Page**: `/coach/analytics`
- Total clients over time
- Session completion rates
- Revenue breakdown
- Product performance
- Review ratings trend

---

## Technical Implementation Details

### Files to Create
1. `src/pages/panel/CoachReviews.tsx` - Reviews management
2. `src/pages/panel/CoachContent.tsx` - Content management
3. `src/pages/panel/CoachAnalytics.tsx` - Personal analytics
4. `src/hooks/useCoachAnalytics.ts` - Analytics hook

### Files to Modify
1. `src/App.tsx` - Add new coach routes, remove old affiliate dashboard route
2. `src/components/panel/CoachSidebar.tsx` - Add Reviews, Content, Analytics links
3. `src/hooks/useCoachClientView.ts` - Add practitioner-client verification
4. `src/pages/panel/MyClients.tsx` - Connect to real data

### Database Migrations
1. Create `practitioner_clients` table
2. Add RLS policies for practitioner data isolation
3. Create view for coach analytics aggregation

### Route Changes
```typescript
// Remove
<Route path="/affiliate-dashboard" ... />

// Add to /coach routes
<Route path="reviews" element={<CoachReviews />} />
<Route path="content" element={<CoachContent />} />
<Route path="analytics" element={<CoachAnalytics />} />
```

---

## Summary of Changes

| Category | Action | Files Affected |
|----------|--------|----------------|
| Cleanup | Remove duplicate affiliate dashboard | 1 file |
| Cleanup | Remove unused unified panel | 2 files |
| Routes | Redirect old affiliate route | App.tsx |
| Coach Panel | Add Reviews page | New file |
| Coach Panel | Add Content page | New file |
| Coach Panel | Add Analytics page | New file |
| Coach Panel | Update sidebar | CoachSidebar.tsx |
| Database | Add practitioner_clients table | Migration |
| Database | Add RLS policies | Migration |
| Hooks | Update coach client view | useCoachClientView.ts |
| Hooks | Create coach analytics hook | New file |
| Data | Connect MyClients to real data | MyClients.tsx |

---

## Benefits
1. **Cleaner codebase** - No duplicate files or unused components
2. **True multi-tenancy** - Each coach sees only their data
3. **Complete coach panel** - Reviews, content, analytics all accessible
4. **Proper client tracking** - Explicit coach-client relationships
5. **Security** - RLS ensures data isolation between practitioners
