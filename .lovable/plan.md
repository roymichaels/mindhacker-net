

# Transform Coaches Page: Remove Directory, Make It a Coach Platform Landing

## What Changes

The Marketplace page currently shows a list of coaches for users to browse. Since coaches only use the platform to manage their own clients (not to be discovered by platform users), we'll replace the coach directory with a coach-focused landing page.

## Changes

### 1. Redesign `Marketplace.tsx` -- Remove Coach Listing
Replace the entire search/filter/grid layout with a clean landing page that:
- Shows a hero section explaining "Coach Pro" -- the platform for coaches
- Highlights key features (client management, AI plan builder, storefront, etc.)
- Has a prominent "Become a Coach" CTA (gated by subscription)
- If the user is already a coach, shows a "Go to Coach Panel" button instead
- Remove all imports for `usePractitioners`, `PractitionerCard`, `PractitionerDetailView`, search/filter state
- Bilingual (HE/EN) as always

### 2. Redesign `Practitioners.tsx` -- Same Treatment
The public-facing `/practitioners` page (redirected from legacy route) gets the same treatment -- remove the directory grid and replace with the coach platform landing.

### 3. Update Nav Labels (Optional Rename)
Consider renaming "Coaches" to "Coach Pro" or keeping "Coaches" but the page content will make it clear it's about becoming/being a coach, not browsing them.

## Visual Layout

```text
+------------------------------------------+
|  [Sparkles icon]  Coach Pro Platform     |
|  Build your coaching business with AI    |
|                                          |
|  +----+ +----+ +----+                    |
|  |icon| |icon| |icon|  Feature cards     |
|  |AI  | |CRM | |Store| (3 highlights)   |
|  +----+ +----+ +----+                    |
|                                          |
|  [ === Become a Coach === ]  (or)        |
|  [ === Go to Coach Panel === ]           |
|                                          |
+------------------------------------------+
```

## Technical Details

### File: `src/pages/Marketplace.tsx`
- Remove: `usePractitioners`, `PractitionerCard`, `PractitionerDetailView` imports
- Remove: search query state, specialty filter state, selectedPractitioner state, filteredPractitioners logic
- Remove: search bar, filter badges, practitioner grid, skeleton loaders
- Add: Feature cards section (AI Plan Builder, Client Management, Your Storefront)
- Keep: "Become a Coach" CTA with subscription gating
- Add: "Go to Coach Panel" button for existing coaches (`/coach/content`)

### File: `src/pages/Practitioners.tsx`
- Same simplification -- remove directory listing, replace with coach landing
- Or redirect entirely to `/marketplace`

### Files NOT changed
- Navigation tabs stay as "Coaches" -- the label still makes sense
- Bottom tab bar unchanged
- No database changes needed
