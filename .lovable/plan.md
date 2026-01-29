
# ChatGPT-Style Aurora Interface Redesign

## Overview

Transform the current Aurora chat interface from a mobile-first "messaging app" layout to a **ChatGPT-style desktop-first layout** with a sidebar for conversations and a spacious centered chat area.

## Design Reference Analysis (From Screenshots)

Based on the provided images, the target design has:

1. **Left Sidebar** (fixed ~280px width):
   - Aurora logo + title at top
   - "+ New chat" button with border/outline style
   - "Recent conversations" section with list
   - User account dropdown at bottom (avatar, name, expand chevron)
   - Footer actions: Dashboard, Settings, Language toggle, Sign out

2. **Main Chat Area** (centered, max-width ~800px):
   - **Welcome State**: Centered Aurora icon (circular gray bg with sparkle), welcome title/subtitle, suggestion pills in 2x2 grid
   - **Message Display**: 
     - Aurora messages: Avatar + "Aurora" label above message, full-width bubble
     - User messages: "You" label above message, right-aligned
     - Hover actions on Aurora messages (copy, read aloud, regenerate)
   - **Input Area**: Rounded pill input with mic button inside, send button, footer text "Aurora remembers your conversations..."

3. **RTL Support**: Right sidebar for Hebrew, text properly aligned

---

## Implementation Plan

### Phase 1: Create New Layout Component

**New File: `src/components/aurora/AuroraLayout.tsx`**

A full-page layout that orchestrates sidebar + chat:

```text
┌──────────────────────────────────────────────────────────┐
│  AuroraLayout (SidebarProvider)                          │
│  ┌───────────────┬──────────────────────────────────┐   │
│  │ AuroraSidebar │       AuroraChatArea             │   │
│  │ (280px fixed) │    (flex-1, centered content)    │   │
│  │               │                                   │   │
│  │ - Logo        │  - Welcome / Messages            │   │
│  │ - New Chat    │  - Auto-scroll                   │   │
│  │ - Conv List   │  - Input at bottom               │   │
│  │ - User Menu   │                                   │   │
│  └───────────────┴──────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

- Uses `SidebarProvider` from shadcn/ui
- Sidebar on left (LTR) or right (RTL)
- Mobile: Sheet/drawer for sidebar

### Phase 2: Create Aurora Sidebar Component

**New File: `src/components/aurora/AuroraSidebar.tsx`**

Features:
- Aurora sparkle icon + "Aurora" title
- `+ New chat` button (outline style, full width)
- "Recent conversations" label + list of conversations
- Each conversation: title, hover to delete
- Account dropdown at footer (avatar + name + chevron)
  - Dashboard modal trigger
  - Settings modal trigger  
  - Language toggle (English ↔ עברית)
  - Sign out

### Phase 3: Redesign Chat Area

**Update: `src/components/aurora/AuroraChatArea.tsx`** (new file, extracted from AuroraMessageThread)

- **Remove header** (no back button needed in desktop layout)
- **Welcome state** redesign:
  - Gray circular icon (not gradient), sparkle inside
  - "Welcome to Aurora" centered title
  - Subtitle text
  - 4 suggestion pills in a flex wrap layout (not buttons with icons)
- **Messages area**: 
  - Centered container (max-w-3xl mx-auto)
  - Generous padding top/bottom
  - Scroll area with auto-scroll
- **Footer text**: "Aurora remembers your conversations and grows with you over time"

### Phase 4: Redesign Message Bubbles

**Update: `src/components/aurora/AuroraChatMessage.tsx`**

Changes:
- Add **label above message**: "Aurora" or "You"
- Aurora avatar: Gray circular background (not gradient), sparkle icon
- User: No avatar, just label
- Bubble styling: Keep current but ensure clean look
- **Action buttons below bubble** (not on hover-top):
  - Copy, Read Aloud, Regenerate icons
  - Visible on hover

### Phase 5: Redesign Input

**Update: `src/components/aurora/AuroraChatInput.tsx`**

Changes:
- Single pill input with mic button **inside** on the right
- Send button outside on the far right (circular, primary color)
- Rounded corners on input (rounded-full)
- Max-width centered container
- Add footer text below input: "Aurora remembers your conversations..."

### Phase 6: Update Welcome Component

**Update: `src/components/aurora/AuroraWelcome.tsx`**

Changes:
- Remove icon gradient → use gray/muted background
- Remove icon pulse animation
- Suggestion buttons: Simple outline pills (not with colored icons inside)
- 2-column grid on desktop, stack on mobile

---

## New/Modified Files

| File | Action | Purpose |
|------|--------|---------|
| `src/components/aurora/AuroraLayout.tsx` | **CREATE** | Full-page layout with sidebar + chat |
| `src/components/aurora/AuroraSidebar.tsx` | **CREATE** | Conversation list sidebar |
| `src/components/aurora/AuroraChatArea.tsx` | **CREATE** | Main chat content area |
| `src/components/aurora/AuroraMessageThread.tsx` | **UPDATE** | Use new layout or redirect |
| `src/components/aurora/AuroraChatMessage.tsx` | **UPDATE** | Add labels, redesign actions |
| `src/components/aurora/AuroraChatInput.tsx` | **UPDATE** | Pill style with inline mic |
| `src/components/aurora/AuroraWelcome.tsx` | **UPDATE** | Simpler design, pill buttons |
| `src/components/aurora/AuroraAccountDropdown.tsx` | **CREATE** | User menu in sidebar footer |
| `src/components/aurora/index.ts` | **UPDATE** | Export new components |
| `src/i18n/translations/en.ts` | **UPDATE** | Add new translation keys |
| `src/i18n/translations/he.ts` | **UPDATE** | Add Hebrew translations |

---

## New Translation Keys Needed

```typescript
aurora: {
  // Existing...
  newChat: "New chat",
  recentConversations: "Recent conversations",
  footerNote: "Aurora remembers your conversations and grows with you over time",
  signIn: "Sign in",
  // Account dropdown
  account: {
    dashboard: "Dashboard",
    settings: "Settings",
    language: "Language",
    signOut: "Sign out",
  }
}
```

---

## Routing Considerations

The current `/messages/ai` route renders `AuroraMessageThread`. After redesign:
- Keep same route but render full `AuroraLayout`
- No need for separate conversation routes - sidebar handles selection
- Mobile: Show either sidebar (sheet) or chat, with toggle

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Desktop (≥1024px) | Sidebar always visible, chat centered |
| Tablet (768-1023px) | Sidebar collapsible, hamburger toggle |
| Mobile (<768px) | Sidebar as sheet/drawer, chat full-width |

---

## Technical Notes

1. **Conversation Management**: 
   - Reuse existing `get_or_create_ai_conversation` RPC
   - Add hook for fetching conversation history with titles
   - Support multiple conversations (new chat creates new one)

2. **RTL Support**:
   - Sidebar flips to right side
   - Text alignment auto-handled
   - Use existing `isRTL` from translation hook

3. **State Management**:
   - Sidebar open state (SidebarProvider)
   - Current conversation ID
   - Modal states (dashboard, settings, checklists)

4. **Modals** (keep existing):
   - `AuroraDashboardModal`
   - `AuroraSettingsModal`
   - `AuroraChecklistModal`

---

## Summary

This redesign transforms Aurora from a mobile-messaging style to a ChatGPT-style desktop-first interface while:
- Keeping all existing functionality intact
- Supporting full RTL for Hebrew
- Maintaining conversation history with sidebar navigation
- Using shadcn/ui Sidebar components
- Following existing code patterns and styling conventions
