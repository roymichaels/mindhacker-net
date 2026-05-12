---
name: Journaling Hub & Auto-Capture
description: Dedicated /journal hub with 9 categories; AION captures journal entries from conversations via aurora-capture-journal edge function
type: feature
---
**Hub**: `/journal` → `JournalingHub.tsx` with 9 categories (Gratitude, Plan, Beliefs, Dreams, Reflection, Breakthroughs, Emotional State, Lessons, Wins). Linked from AppNameMenu nav.

**Schema**: `journal_entries.journal_type` extended (dream/reflection/gratitude/plan/beliefs/breakthrough/emotion/lesson/win). Added optional cols: title, summary, source_excerpt, ai_insight, source ('manual'|'aion'), linked_mission_id.

**Auto-capture**: Edge function `aurora-capture-journal` accepts `{excerpt, linked_mission_id?}`, uses Lovable AI with tool calling to decide should_save + extract category/title/summary/ai_insight/mood/tags, inserts with source='aion'.

**UX rule**: NO journaling chips above chat composer. Journaling lives in the hub; AION may surface "Save to Journal" contextually after deep reflection.
