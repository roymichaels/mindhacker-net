

# Bug Reporting Widget System

## Overview
Create a beautiful, advanced bug reporting system that allows all users to easily report issues from anywhere in the app. The system will automatically capture contextual information (current page, user details, device info) and present an elegant floating widget that matches the app's "Game UI" aesthetic.

---

## Features

### User-Facing Features
- **Floating Bug Report Button**: A persistent, beautifully animated button in the corner of the screen
- **Smart Context Capture**: Automatically records current page, URL, timestamp, device info, and browser
- **Category Selection**: Users can classify bugs (UI Issue, Performance, Feature Not Working, Other)
- **Priority Indicator**: Optional severity selection (Low, Medium, High, Critical)
- **Screenshot Capability**: Button to capture and attach a screenshot (using html2canvas - already installed)
- **Description Field**: Rich text area for detailed bug descriptions
- **Contact Preference**: Optional email field for follow-up
- **Success Animation**: Satisfying confirmation with confetti (canvas-confetti - already installed)

### Admin Features
- **Bug Reports Dashboard**: New admin page to view, filter, and manage all bug reports
- **Status Management**: Track reports through statuses (New, In Progress, Resolved, Closed)
- **Filtering**: By status, priority, category, date range
- **User Context Display**: See exactly where and when the bug occurred

---

## Technical Implementation

### 1. Database Schema
Create a new `bug_reports` table to store all submissions:

```sql
CREATE TABLE bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Bug Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  priority TEXT NOT NULL DEFAULT 'medium',
  
  -- Context (auto-captured)
  page_path TEXT NOT NULL,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_size TEXT,
  
  -- Optional
  screenshot_url TEXT,
  contact_email TEXT,
  
  -- Admin fields
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reports
CREATE POLICY "Users can create bug reports"
  ON bug_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON bug_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins full access"
  ON bug_reports FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Index for performance
CREATE INDEX idx_bug_reports_status ON bug_reports(status);
CREATE INDEX idx_bug_reports_created ON bug_reports(created_at DESC);
```

### 2. New Components

#### A. BugReportWidget (Floating Button + Dialog)
**File**: `src/components/BugReportWidget.tsx`

- Floating button with gradient animation (bottom-left corner, respecting pointer-events rules)
- Opens a beautiful dialog matching the app's glassmorphism style
- Auto-captures page context on open
- Form with validation using react-hook-form + zod

#### B. BugReportForm (Form Content)
**File**: `src/components/bug-report/BugReportForm.tsx`

- Category select (UI, Performance, Feature, Other)
- Priority select with color indicators
- Title input
- Description textarea
- Optional screenshot capture button
- Optional email input
- Submit with loading state

#### C. Admin Bug Reports Page
**File**: `src/pages/admin/BugReports.tsx`

- Data table with sorting
- Status badges with colors
- Filter controls
- Detail drawer/modal for each report
- Quick status update actions

### 3. Translation Keys
Add to both `he.ts` and `en.ts`:

```typescript
bugReport: {
  // Widget
  buttonTooltip: "Report a Bug",
  
  // Dialog
  title: "Report a Bug",
  subtitle: "Help us improve by reporting issues",
  
  // Form fields
  category: "Category",
  categoryUI: "UI Issue",
  categoryPerformance: "Performance",
  categoryFeature: "Feature Not Working",
  categoryOther: "Other",
  
  priority: "Priority",
  priorityLow: "Low",
  priorityMedium: "Medium", 
  priorityHigh: "High",
  priorityCritical: "Critical",
  
  titleLabel: "Title",
  titlePlaceholder: "Brief description of the issue",
  
  descriptionLabel: "Description",
  descriptionPlaceholder: "What happened? What did you expect?",
  
  screenshotLabel: "Screenshot",
  captureScreenshot: "Capture Screenshot",
  screenshotCaptured: "Screenshot captured!",
  
  emailLabel: "Email (optional)",
  emailPlaceholder: "For follow-up",
  
  // Context info
  pageInfo: "Page",
  deviceInfo: "Device",
  
  // Actions
  submit: "Submit Report",
  submitting: "Submitting...",
  
  // Success/Error
  successTitle: "Thank you!",
  successMessage: "Your report has been submitted",
  errorTitle: "Error",
  errorMessage: "Failed to submit report",
  
  // Admin
  adminTitle: "Bug Reports",
  status: "Status",
  statusNew: "New",
  statusInProgress: "In Progress",
  statusResolved: "Resolved",
  statusClosed: "Closed",
}
```

### 4. File Structure

```text
src/
├── components/
│   ├── BugReportWidget.tsx          # Main floating widget
│   └── bug-report/
│       ├── BugReportForm.tsx        # Form component
│       ├── BugReportDialog.tsx      # Dialog wrapper
│       ├── CategorySelect.tsx       # Category dropdown
│       ├── PrioritySelect.tsx       # Priority with colors
│       └── ScreenshotCapture.tsx    # Screenshot functionality
├── pages/
│   └── admin/
│       └── BugReports.tsx           # Admin management page
├── hooks/
│   └── useBugReport.ts              # Context capture + submission logic
```

### 5. Integration Points

**App.tsx** - Add widget globally (after CookieConsent):
```tsx
<CookieConsent />
<BugReportWidget />
```

**Admin Routes** - Add new admin page:
```tsx
<Route path="bug-reports" element={<BugReports />} />
```

**Admin Sidebar** - Add navigation link with Bug icon

---

## Visual Design

### Floating Button
- Gradient border animation (purple to fuchsia - matching brand)
- Glassmorphism background
- Bug icon with subtle glow
- Positioned bottom-left (opposite to chat input)
- Respects RTL layout
- Uses `pointer-events-none` container with `pointer-events-auto` on button

### Dialog
- Dark glassmorphism matching existing modals
- Category pills with icons
- Priority badges with severity colors (green/yellow/orange/red)
- Screenshot preview thumbnail
- Animated success state with confetti

### Admin Page
- Cards with status color coding
- Expandable rows for full details
- Quick action buttons
- Filter chips
