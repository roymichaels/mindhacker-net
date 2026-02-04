
# Plan: Add Businesses to Admin Panel

## Overview
Add a comprehensive "Businesses" management section to the admin panel that allows administrators to view and manage all user business journeys created through the business journey flow.

## What Will Be Added

### 1. New Admin Page: Businesses.tsx
A new page at `/panel/businesses` that displays:

**Statistics Cards:**
- Total businesses created
- Active journeys (in progress)
- Completed journeys
- Journeys started today/this week

**Main Table with columns:**
- Business name (or "Unnamed" if not set)
- User name (linked to user profile)
- Progress (step X/10)
- Status badge (In Progress / Completed)
- Industry (from step 2 data)
- Created date
- Actions (View details, View user)

**Features:**
- Search by business name or user name
- Filter by status (all/in-progress/completed)
- Click to view detailed journey data

### 2. Business Detail Dialog/View
When clicking on a business, show:
- Vision & goals (step 1)
- Business model (step 2)
- Target audience (step 3)
- Value proposition (step 4)
- Challenges (step 5)
- Resources (step 6)
- Financial plan (step 7)
- Marketing strategy (step 8)
- Operations (step 9)
- Action plan (step 10)
- AI Summary (if available)

### 3. Sidebar Navigation Update
Add "Businesses" item to the Administration group in AdminSidebar.tsx with a `Briefcase` icon.

### 4. Route Configuration
Add route `/panel/businesses` to App.tsx under the admin panel routes.

## Technical Details

### Files to Create:
```
src/pages/admin/Businesses.tsx (main admin page)
```

### Files to Modify:
```
src/components/panel/AdminSidebar.tsx (add nav item)
src/App.tsx (add route)
```

### Database Query Pattern:
```sql
SELECT 
  bj.*,
  p.full_name as user_name,
  p.id as profile_id
FROM business_journeys bj
JOIN profiles p ON bj.user_id = p.id
ORDER BY bj.created_at DESC
```

### UI Components Used:
- AdminPageHeader (consistent with other admin pages)
- Card, CardContent for stats
- Table with TableHeader, TableBody, TableRow, TableCell
- Badge for status indicators
- Dialog for detail view
- Input for search
- Select for filters

### Translation Keys to Add:
- `admin.businesses.title`: "עסקים" / "Businesses"
- `admin.businesses.subtitle`: "ניהול מסעות עסקיים של משתמשים" / "Manage user business journeys"
- `admin.businesses.totalBusinesses`: "סה\"כ עסקים" / "Total Businesses"
- `admin.businesses.inProgress`: "בתהליך" / "In Progress"
- `admin.businesses.completed`: "הושלמו" / "Completed"
- `admin.businesses.viewDetails`: "צפה בפרטים" / "View Details"

## Implementation Order
1. Create the Businesses.tsx admin page with all features
2. Add sidebar navigation item
3. Add route in App.tsx
4. Test functionality
