
# Visual Landing Page Builder - Elementor Style

## Overview
Transform the current form-based landing page editor into a modern, visual drag-and-drop builder similar to Elementor, featuring:
- Visual template gallery with live previews
- Drag-and-drop section reordering
- Live preview panel alongside the editor
- Section widgets with visual thumbnails
- Full-screen immersive editing experience

## Current State vs Target State

### Current State
- Simple dialog with tabs and form fields
- List-based section editing
- No visual feedback or live preview
- Basic collapsible items for content

### Target State
- Full-page visual builder (like Elementor/Wix)
- Template gallery with visual cards
- Drag-and-drop section ordering
- Split-screen: Editor left, Live Preview right
- Section widgets with thumbnails
- Inline editing feel

---

## Architecture

### New Component Structure
```text
src/pages/admin/
├── LandingPages.tsx (updated - template gallery)
└── LandingPageBuilder.tsx (NEW - full-screen visual builder)

src/components/admin/landing/
├── TemplateGallery.tsx (NEW - visual template cards)
├── BuilderCanvas.tsx (NEW - drag-drop section ordering)
├── BuilderSidebar.tsx (NEW - section widgets + settings)
├── BuilderPreview.tsx (NEW - live preview iframe/component)
├── SectionWidget.tsx (NEW - draggable section card)
├── SectionSettingsPanel.tsx (NEW - settings for selected section)
└── SectionEditor.tsx (existing - content editing)
```

### Flow
1. `/admin/landing-pages` - Template Gallery (choose template or edit existing)
2. `/admin/landing-pages/edit/:id` - Full Visual Builder

---

## Phase 1: Template Gallery

Replace current list view with visual template cards showing:
- Live thumbnail/preview of template
- Template name and description
- "Use This Template" button
- Hover animations

```text
┌─────────────────────────────────────────────────────────────────────┐
│  דפי נחיתה                                              + חדש     │
├─────────────────────────────────────────────────────────────────────┤
│  Choose a Template:                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ ╔═════════════╗ │  │ ╔═════════════╗ │  │ ╔═════════════╗ │     │
│  │ ║   PREVIEW   ║ │  │ ║   PREVIEW   ║ │  │ ║   PREVIEW   ║ │     │
│  │ ║  (Live UI)  ║ │  │ ║  (Live UI)  ║ │  │ ║  (Live UI)  ║ │     │
│  │ ╚═════════════╝ │  │ ╚═════════════╝ │  │ ╚═════════════╝ │     │
│  │    Homepage     │  │     Product     │  │   Lead Capture  │     │
│  │  Hero + Cards   │  │  Full Funnel    │  │   Simple Form   │     │
│  │  [Use Template] │  │  [Use Template] │  │  [Use Template] │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
├─────────────────────────────────────────────────────────────────────┤
│  Your Pages:                                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ ╔═════════════╗ │  │ ╔═════════════╗ │  │ ╔═════════════╗ │     │
│  │ ║  דף הבית   ║ │  │ ║  קפיצה     ║ │  │ ║  היפנוזה   ║ │     │
│  │ ╚═════════════╝ │  │ ╚═════════════╝ │  │ ╚═════════════╝ │     │
│  │   📍 Published  │  │   📍 Published  │  │   📍 Draft     │     │
│  │ [Edit] [Preview]│  │ [Edit] [Preview]│  │ [Edit] [Preview]│     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Full-Screen Visual Builder

New dedicated page for editing with split layout:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ [← Back]  Landing Page Builder: קפיצה לתודעה    [Preview] [Publish] │
├────────────────────┬─────────────────────────────────────────────────┤
│                    │                                                  │
│  📦 SECTIONS       │           LIVE PREVIEW                          │
│  ════════════════  │                                                  │
│                    │  ┌──────────────────────────────────────────┐   │
│  ┌──────────────┐  │  │                                          │   │
│  │ ≡ Hero       │  │  │     ╔═══════════════════════════════╗    │   │
│  │   [img] ▼    │  │  │     ║         HERO SECTION          ║    │   │
│  └──────────────┘  │  │     ╚═══════════════════════════════╝    │   │
│  ┌──────────────┐  │  │                                          │   │
│  │ ≡ Pain Points│  │  │     ╔═══════════════════════════════╗    │   │
│  │   [img] ▼    │  │  │     ║       PAIN POINTS             ║    │   │
│  └──────────────┘  │  │     ╚═══════════════════════════════╝    │   │
│  ┌──────────────┐  │  │                                          │   │
│  │ ≡ Process    │  │  │     ╔═══════════════════════════════╗    │   │
│  │   [img] ▼    │  │  │     ║        PROCESS                ║    │   │
│  └──────────────┘  │  │     ╚═══════════════════════════════╝    │   │
│  ┌──────────────┐  │  │                                          │   │
│  │ ≡ Benefits   │  │  │                                          │   │
│  └──────────────┘  │  │                                          │   │
│                    │  └──────────────────────────────────────────┘   │
│  ┌────────────┐    │                                                  │
│  │ + Add Section │ │   Device: [📱] [💻] [🖥️]                        │
│  └────────────┘    │                                                  │
├────────────────────┴─────────────────────────────────────────────────┤
│  SECTION SETTINGS (when section selected)                            │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  Hero Section Settings                                         │   │
│  │  [Content] [Style] [Advanced]                                  │   │
│  │  Heading (HE): [_________________]                             │   │
│  │  Heading (EN): [_________________]                             │   │
│  │  Badge Text:   [_________________]                             │   │
│  │  Image URL:    [_________________] [📤 Upload]                 │   │
│  └───────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Phase 3: Section Widget Library

Add section from a visual widget panel:

```text
┌─────────────────────────────────────────────────┐
│  + Add Section                                   │
├─────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │ ╔═══════╗ │  │ ╔═══════╗ │  │ ╔═══════╗ │   │
│  │ ║ HERO  ║ │  │ ║ PAIN  ║ │  │ ║PROCESS║ │   │
│  │ ╚═══════╝ │  │ ╚═══════╝ │  │ ╚═══════╝ │   │
│  │   Hero    │  │Pain Points│  │  Process  │   │
│  └───────────┘  └───────────┘  └───────────┘   │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │ ╔═══════╗ │  │ ╔═══════╗ │  │ ╔═══════╗ │   │
│  │ ║BENEFIT║ │  │ ║ TESTI ║ │  │ ║  FAQ  ║ │   │
│  │ ╚═══════╝ │  │ ╚═══════╝ │  │ ╚═══════╝ │   │
│  │  Benefits │  │Testimonials│  │   FAQs   │   │
│  └───────────┘  └───────────┘  └───────────┘   │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │ ╔═══════╗ │  │ ╔═══════╗ │  │ ╔═══════╗ │   │
│  │ ║FOR WHO║ │  │ ║  CTA  ║ │  │ ║CUSTOM ║ │   │
│  │ ╚═══════╝ │  │ ╚═══════╝ │  │ ╚═══════╝ │   │
│  │  For Who  │  │    CTA    │  │  Custom   │   │
│  └───────────┘  └───────────┘  └───────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Dependencies
Add `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop (lightweight, modern alternative to react-beautiful-dnd):

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

### New Files

#### 1. LandingPageBuilder.tsx (Full-screen editor)
```tsx
// Full-screen builder with:
// - ResizablePanelGroup for sidebar/preview split
// - DndContext for drag-drop sections
// - Live preview component that re-renders on changes
// - Bottom drawer for section settings
```

#### 2. TemplateGallery.tsx (Visual template cards)
```tsx
// Visual cards with:
// - Miniature preview of each template type
// - Hover animations with framer-motion
// - Quick action buttons (Use, Preview)
```

#### 3. BuilderSidebar.tsx (Section list + widgets)
```tsx
// Sidebar with:
// - Draggable section list (SortableContext)
// - "Add Section" widget panel
// - Global page settings (brand color, SEO)
```

#### 4. SectionWidget.tsx (Draggable section card)
```tsx
// Each section as a card:
// - Thumbnail preview (miniature of actual section)
// - Drag handle
// - Quick actions (edit, duplicate, delete)
// - Visual indicator when selected
```

#### 5. BuilderPreview.tsx (Live preview)
```tsx
// Live preview that:
// - Shows actual rendered landing page
// - Highlights selected section
// - Responsive toggle (mobile/tablet/desktop)
// - Click-to-select sections
```

### Routing Updates
```tsx
// App.tsx
<Route path="/admin/landing-pages" element={<LandingPages />} />
<Route path="/admin/landing-pages/edit/:id" element={<LandingPageBuilder />} />
<Route path="/admin/landing-pages/new" element={<LandingPageBuilder />} />
```

---

## Section Thumbnails

Pre-designed SVG/CSS thumbnails for each section type:

| Section | Thumbnail Visual |
|---------|------------------|
| Hero | Large header + CTA button + badge |
| Pain Points | 3 red-tinted cards in row |
| Process | Numbered steps with arrows |
| Benefits | Green check cards grid |
| For Who | Two columns (✓ / ✗) |
| Testimonials | Quote cards with avatars |
| FAQ | Accordion-style lines |
| CTA | Full-width button banner |

---

## User Flow

### Creating New Page
1. Click "+ New Page" button
2. See visual Template Gallery modal
3. Click on a template thumbnail
4. Template preview expands with details
5. Click "Use This Template"
6. Redirects to full-screen Builder with template pre-loaded
7. Drag-drop to reorder sections
8. Click section to edit content
9. See live preview update in real-time
10. Click "Publish" when done

### Editing Existing Page
1. Click "Edit" on page card
2. Opens full-screen Builder
3. Same editing experience

---

## Implementation Priority

1. **Phase 1**: Add dnd-kit dependency + Visual template gallery on main page
2. **Phase 2**: Create LandingPageBuilder route + basic split layout
3. **Phase 3**: Implement BuilderSidebar with draggable sections
4. **Phase 4**: Add BuilderPreview with live rendering
5. **Phase 5**: Section settings panel at bottom
6. **Phase 6**: Add section widget library modal
7. **Phase 7**: Polish with animations, responsive preview toggle

Total: ~4-5 hours of implementation

---

## Key Features Summary

- **Visual Template Selection**: Cards with live mini-previews instead of dropdowns
- **Drag & Drop Sections**: Reorder page sections visually
- **Split-Screen Editor**: Edit on left, preview on right
- **Live Preview**: Changes reflect immediately
- **Section Widgets**: Visual library to add new sections
- **Responsive Preview**: Toggle phone/tablet/desktop view
- **Full-Screen Experience**: Immersive editing like Elementor/Wix
- **Click-to-Select**: Click on preview to select section for editing
