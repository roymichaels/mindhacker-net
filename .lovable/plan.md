
# Fix Coach Sidebar Quick Action Buttons

## Problem
The three quick action buttons in the left Coach HUD Sidebar -- **חנות (Store)**, **תוכנית (Plan)**, and **הוסף (Add)** -- have no click handlers. They render as buttons but do nothing when clicked. This applies to both the collapsed mini-view and the expanded view.

## Solution

### 1. **חנות (Store) Button** -- Open Storefront
- Navigate to `/p/{slug}` in a new tab using the practitioner's slug (already available via `myProfile?.slug`)
- The expanded sidebar already has a "View Storefront" link at the bottom doing exactly this -- the quick action button just needs the same `window.open` call

### 2. **תוכנית (Plan) Button** -- Generate AI Plan
- Since plans are now tied to individual clients, this button should select the first active client and open their profile panel (where the "Generate Plan" dialog lives)
- If no clients exist, show a toast message prompting the coach to add a client first
- This requires the sidebar to receive `onSelectClient` as a prop (passed from `CoachesLayoutWrapper`)

### 3. **הוסף (Add) Button** -- Add New Client
- Create an **Add Client Dialog** directly in the sidebar with an email/name search field
- The dialog searches existing users by email, then calls the existing `useAddCoachClient` hook to link them
- This is the standard flow: coach enters an email, system finds the user profile, and creates the `practitioner_clients` record

## Technical Changes

### File: `src/components/coach/CoachHudSidebar.tsx`
- Add props: `onSelectClient`, `onAddClient` callbacks
- Add an `AddClientDialog` component (inline or separate) with email input + search + confirm
- Wire each quick action button's `onClick`:
  - **Store**: `window.open(/p/${slug}, '_blank')`
  - **Plan**: call `onSelectClient` with first client ID (or toast if none)
  - **Add**: open the add-client dialog
- Apply the same onClick handlers to both collapsed and expanded button variants
- Import and use `useAddCoachClient` hook for the add flow
- Import `useCoachClients` to get client list for the "Plan" button logic

### File: `src/pages/Coaches.tsx`
- Update `useCoachSidebars` to pass `onSelectClient` to `CoachHudSidebar`

### File: `src/components/coach/CoachesLayoutWrapper.tsx`
- No changes needed (already manages `selectedClientId` state and passes `setSelectedClientId`)

## Add Client Dialog Design
The dialog will contain:
- An email input field to search for existing users
- A search button that queries the `profiles` table by email
- When a match is found, show the user's name and a "Confirm" button
- On confirm, call `useAddCoachClient` with the found user's ID
- Optional: a notes field for the coach to attach initial notes

## Button Behavior Summary

| Button | Expanded Click | Collapsed Click |
|--------|---------------|-----------------|
| חנות (Store) | Opens storefront in new tab | Same |
| תוכנית (Plan) | Selects first client to open profile panel | Same |
| הוסף (Add) | Opens Add Client dialog | Expands sidebar first, then opens dialog |
