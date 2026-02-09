
# Sync All Business Tools to Coach Panel

## Overview
Add all content and business management features from the Admin Panel to the Coach Panel, giving Dean (and any future coach) full control over their content, products, testimonials, leads, and campaigns directly from their coach dashboard.

## Features to Add to Coach Panel

### New Routes (in App.tsx under /coach)
The following admin pages will be reused directly as coach routes:

| New Coach Route | Component | Description |
|---|---|---|
| `/coach/testimonials` | `Testimonials` (from admin) | Full CRUD for bilingual testimonials |
| `/coach/videos` | `Videos` (from admin) | Video library management |
| `/coach/recordings` | `Recordings` (from admin) | Audio/video recordings library |
| `/coach/forms` | `Forms` (from admin) | Custom forms builder + submissions |
| `/coach/leads` | `Leads` (from admin) | Lead tracking and management |
| `/coach/newsletter` | `Newsletter` (from admin) | Email campaign management |
| `/coach/offers` | `AdminOffers` (from admin) | Offer/product configuration |
| `/coach/purchases` | `Purchases` (from admin) | Purchase tracking |
| `/coach/manage-products` | `AdminProducts` (from admin) | Full product CRUD (vs. view-only MyProducts) |
| `/coach/manage-content` | `Content` (from admin) | Content product management with series/episodes |

### Sidebar Updates (CoachSidebar.tsx)
Reorganize navigation groups to include the new pages:

- **Overview**: Dashboard, Analytics
- **My Practice**: Clients, Calendar, Earnings
- **Content & Products**: My Content, Manage Products, Videos, Recordings, Forms
- **Marketing**: Testimonials, Offers, Leads, Newsletter, Purchases
- **My Storefront**: Storefront Settings
- **Settings**: Profile, Theme

### Routing Updates (App.tsx)
Add lazy imports and Route entries for each new page under the `/coach` parent route.

## Technical Details

### Files to Edit
1. **`src/App.tsx`** -- Add ~10 new Route entries under the coach parent route, reusing existing admin page components
2. **`src/components/panel/CoachSidebar.tsx`** -- Add new nav groups with the additional menu items for content, marketing, etc.

### No New Components Needed
All admin pages (Testimonials, Videos, Recordings, Forms, Leads, Newsletter, Offers, Purchases, Products, Content) will be reused as-is. They already work standalone and don't have admin-specific guards internally.

### No Database Changes
All tables and RLS policies already exist and support these pages.
