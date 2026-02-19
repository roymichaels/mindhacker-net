

# Instagram-Style Coach Profile Page

## Overview
Redesign the `/practitioner/:slug` profile page to follow Instagram's proven profile layout pattern, replacing the current vertical landing-page style with a compact header + tabbed feed grid.

## Layout Structure

```text
+---------------------------------------+
|  <- Back                  [Follow/CTA] |
+---------------------------------------+
|  [Avatar]  |  Posts  Followers  Rating |
|   Name     |   12      48       4.9   |
|   Title    |                           |
|   Bio (2 lines, "...more")            |
|   [Book] [WhatsApp] [Instagram] [Web] |
+---------------------------------------+
| [Posts]  [Products]  [Reviews]         |  <-- Tab bar
+---------------------------------------+
|  Grid / List content based on tab      |
|  +---------+  +---------+             |
|  |         |  |         |             |
|  |  Card   |  |  Card   |             |
|  |         |  |         |             |
|  +---------+  +---------+             |
+---------------------------------------+
```

## What Changes

### 1. Profile Header (replaces PractitionerHero + PractitionerAbout)
- **Compact avatar** (80px circle, not the current 200px)
- **Stats row** next to avatar: posts count, clients/followers count, rating
- **Name + title + bio** below, truncated with "more" expand
- **Action buttons row**: Book / WhatsApp / Instagram / Website as icon buttons
- **Verified badge** inline with name (blue checkmark like IG)
- Remove the massive gradient hero section

### 2. Tab Bar (replaces separate full-width sections)
Three tabs with icons:

| Tab | Icon | Content | Data Source |
|-----|------|---------|-------------|
| Posts | Grid | Community posts by this coach | `community_posts` filtered by `user_id` |
| Products | ShoppingBag | Offers/courses catalog | `offers` filtered by `practitioner_id` |
| Reviews | Star | Client testimonials | `testimonials` + `practitioner_reviews` |

### 3. Feed Content per Tab

**Posts Tab (default)**
- 3-column square grid (like IG) showing post thumbnails
- Posts with `media_urls` show the first image as thumbnail
- Text-only posts show a styled text preview card
- Click opens post detail modal
- *Requires no new DB table* -- uses existing `community_posts`

**Products Tab**
- 2-column grid of offer cards (reuse existing `OfferCard` component)
- Uses existing `offers` table with `practitioner_id` filter

**Reviews Tab**
- List layout with review cards (existing testimonial card style)
- Uses existing `testimonials` and `practitioner_reviews` data

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/practitioner-landing/PractitionerProfileHeader.tsx` | Create | IG-style compact header with stats |
| `src/components/practitioner-landing/PractitionerFeedTabs.tsx` | Create | Tab bar + content switcher |
| `src/components/practitioner-landing/PostsGrid.tsx` | Create | 3-column grid of community posts |
| `src/components/practitioner-landing/PostDetailModal.tsx` | Create | Full post view on click |
| `src/pages/PractitionerProfile.tsx` | Modify | Replace sections with new header + tabs |
| `src/hooks/usePractitioners.ts` | Modify | Add posts count to practitioner query |

## Technical Details

- **PractitionerProfileHeader**: Single component combining avatar, stats, bio, and action buttons. Uses `practitioners` table data. Bio truncation with useState toggle.
- **PractitionerFeedTabs**: Uses Radix Tabs component. Each tab lazy-loads its content.
- **PostsGrid**: Queries `community_posts` where `user_id = practitioner.user_id`. Renders as aspect-square grid items. Falls back to gradient+text preview for posts without images.
- **PostDetailModal**: Radix Dialog showing full post with images, text, likes, and comments count.
- **No DB migration needed** -- all data sources already exist (`community_posts`, `offers`, `testimonials`).
- Follows the existing React Native aesthetic (rounded-2xl, backdrop-blur, gap-4).
- Fully RTL-aware using existing `useTranslation` patterns.
- Mobile-first: header stacks vertically on small screens, grid adapts from 3 to 2 columns.

