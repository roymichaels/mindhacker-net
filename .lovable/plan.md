

# Aurora Integration Gap Analysis & Completion Plan

## Current State Summary

The MindHacker platform has successfully integrated most of the Aurora Life Coaching system:

### What's Already Implemented ✅

| Category | Components | Status |
|----------|------------|--------|
| **Database Tables** | 11 aurora_* tables | ✅ Complete |
| **Edge Functions** | aurora-chat, aurora-analyze, aurora-generate-title | ✅ Complete |
| **UI Components** | 13 Aurora components | ✅ Complete |
| **Hooks** | 7 Aurora hooks | ✅ Complete |
| **Translations** | Hebrew & English aurora.* keys | ✅ Complete |
| **Unified Services** | unifiedContext.ts, unifiedVoice.ts | ✅ Complete |

### What's Missing ❌

---

## Gap 1: ElevenLabs Transcription Edge Function

**Problem**: The `useAuroraVoice.tsx` hook calls an edge function `elevenlabs-transcribe` that doesn't exist.

```typescript
// In useAuroraVoice.tsx line 79-80
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-transcribe`,
```

**Impact**: Voice input (microphone button) in Aurora chat will fail silently.

**Solution**: Create the missing edge function.

### New File: `supabase/functions/elevenlabs-transcribe/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'Audio file required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      // Fallback to browser speech recognition message
      return new Response(JSON.stringify({ 
        error: 'ElevenLabs not configured',
        fallback: true,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert to base64 for ElevenLabs
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: base64Audio,
        model_id: 'scribe_v1',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs STT error:', response.status, errorText);
      return new Response(JSON.stringify({ 
        error: 'Transcription failed',
        fallback: true,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    
    return new Response(JSON.stringify({ 
      text: result.text || '',
      success: true,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## Gap 2: Config.toml Missing Entry

**Problem**: The `elevenlabs-transcribe` function needs to be registered in `supabase/config.toml`.

**Solution**: Add entry:
```toml
[functions.elevenlabs-transcribe]
verify_jwt = false
```

---

## Gap 3: Aurora Gateway URL Typo

**Problem**: In `aurora-analyze/index.ts` line 93, the AI Gateway URL is incorrect:
```typescript
const response = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
```

Should be:
```typescript
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
```

Same issue in `aurora-generate-title/index.ts` line 38.

---

## Gap 4: Missing useChecklists Hook (UI Version)

**Problem**: `AuroraChecklistModal.tsx` imports `useChecklists` from `@/hooks/aurora/useChecklists`, but examining the hooks index shows we have:
- `useChecklistsData` (data-only, no UI dependencies) ✅
- `useChecklists` (with toast notifications) - needs verification

**Solution**: Verify and ensure `useChecklists.tsx` exists with proper toast notifications.

### Verify/Create: `src/hooks/aurora/useChecklists.tsx`

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useChecklistsData } from './useChecklistsData';
import { toast } from 'sonner';
import { useCallback } from 'react';

export const useChecklists = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const data = useChecklistsData(user);

  const createChecklist = useCallback(async (title: string, origin: 'manual' | 'aurora' = 'manual') => {
    const result = await data.createChecklist(title, origin);
    if (result) {
      toast.success(t('aurora.checklists.created'));
    } else {
      toast.error(t('aurora.checklists.createError'));
    }
    return result;
  }, [data, t]);

  const deleteChecklist = useCallback(async (checklistId: string) => {
    const result = await data.deleteChecklist(checklistId);
    if (result) {
      toast.success(t('aurora.checklists.deleted'));
    } else {
      toast.error(t('aurora.checklists.deleteError'));
    }
    return result;
  }, [data, t]);

  const archiveChecklist = useCallback(async (checklistId: string) => {
    const result = await data.archiveChecklist(checklistId);
    if (result) {
      toast.success(t('aurora.checklists.archived'));
    } else {
      toast.error(t('aurora.checklists.archiveError'));
    }
    return result;
  }, [data, t]);

  const toggleItem = useCallback(async (itemId: string, isCompleted: boolean) => {
    const result = await data.toggleItem(itemId, isCompleted);
    if (result && isCompleted) {
      toast.success(t('aurora.checklists.itemCompleted'));
    }
    return result;
  }, [data, t]);

  return {
    ...data,
    createChecklist,
    deleteChecklist,
    archiveChecklist,
    toggleItem,
  };
};
```

---

## Gap 5: Missing Award XP Function

**Problem**: The `aurora-analyze/index.ts` and `useChecklistsData.tsx` call `aurora_award_xp`, but the unified system uses `award_unified_xp`.

**Action**: Either:
1. Create an alias function `aurora_award_xp` that calls `award_unified_xp`, OR
2. Update all references to use `award_unified_xp` consistently

**Recommended Solution**: Create alias for backward compatibility:

```sql
CREATE OR REPLACE FUNCTION aurora_award_xp(
  p_user_id UUID,
  p_amount INT,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  PERFORM award_unified_xp(p_user_id, p_amount, 'aurora', p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Gap 6: Conversation Creation Flow

**Problem**: The Aurora chat flow expects conversations to exist, but the `useAuroraChat` hook doesn't handle conversation creation. The original Aurora app had `useConversations` hook that managed this.

**Current MindHacker Integration**: Uses the existing `conversations` table from the messaging system, which may work but needs verification.

**Action**: Verify that clicking on Aurora in messages:
1. Creates a conversation if none exists
2. Properly filters Aurora conversations vs regular DMs

---

## Implementation Order

### Phase 1: Critical Fixes (Immediate)
1. Create `elevenlabs-transcribe` edge function
2. Add config.toml entry
3. Fix AI Gateway URL typos in aurora-analyze and aurora-generate-title

### Phase 2: Database & Functions
4. Create `aurora_award_xp` alias function
5. Verify/create `useChecklists.tsx` hook

### Phase 3: Verification
6. Test Aurora chat end-to-end
7. Test voice input functionality
8. Test checklist creation from Aurora
9. Test XP awarding on insights

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/elevenlabs-transcribe/index.ts` | Voice-to-text transcription |
| `src/hooks/aurora/useChecklists.tsx` | UI wrapper with toast notifications (verify exists) |

## Files to Modify

| File | Change |
|------|--------|
| `supabase/config.toml` | Add elevenlabs-transcribe entry |
| `supabase/functions/aurora-analyze/index.ts` | Fix AI Gateway URL |
| `supabase/functions/aurora-generate-title/index.ts` | Fix AI Gateway URL |

## Database Changes

| Type | Name | Purpose |
|------|------|---------|
| Function | `aurora_award_xp` | Backward-compatible XP alias |

---

## Success Criteria

After implementation:
- ✅ Voice input works in Aurora chat (microphone button)
- ✅ Background analysis saves insights correctly
- ✅ Conversation titles auto-generate
- ✅ Checklists can be created from Aurora
- ✅ XP is awarded for insights and completed items
- ✅ All Aurora features work in Hebrew RTL mode

