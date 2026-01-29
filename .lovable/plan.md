
# Fix: Aurora Not Loading on /messages/ai

## Problem Identified

When navigating to `/messages/ai`, the page shows "משתמש לא ידוע" (Unknown User) instead of the Aurora interface. This happens because of a **routing parameter mismatch**.

## Root Cause

In `App.tsx`, there are two routes:
```jsx
<Route path="/messages/ai" element={<MessageThread />} />           // Static route
<Route path="/messages/:conversationId" element={<MessageThread />} /> // Dynamic route
```

In `MessageThread.tsx`:
```typescript
const { conversationId } = useParams();
const isAI = conversationId === 'ai';

if (isAI) {
  return <AuroraMessageThread conversationId="ai" />;
}
```

**The issue:** When the user navigates to `/messages/ai`, React Router matches the static route first. But since `/messages/ai` is a **static** route (not `/messages/:conversationId`), the `useParams()` hook returns `{ conversationId: undefined }` - not `{ conversationId: 'ai' }`.

So `conversationId === undefined`, `isAI === false`, and the regular message thread loads showing "Unknown User".

## Solution

Modify `MessageThread.tsx` to detect the Aurora route using `useLocation()` in addition to `useParams()`:

```typescript
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const MessageThread = () => {
  const { conversationId } = useParams();
  const location = useLocation();
  
  // Check if this is Aurora - either by param OR by route path
  const isAI = conversationId === 'ai' || location.pathname === '/messages/ai';
  
  if (isAI) {
    return <AuroraMessageThread conversationId="ai" />;
  }
  // ... rest of component
};
```

## File Changes

### `src/pages/MessageThread.tsx`

1. Import `useLocation` from react-router-dom
2. Use `useLocation()` to get current path
3. Update `isAI` check to include pathname check

## Impact

- **Aurora will load correctly** when navigating to `/messages/ai`
- **No changes to routing structure** needed
- **Backward compatible** - the `conversationId === 'ai'` check remains as a fallback
