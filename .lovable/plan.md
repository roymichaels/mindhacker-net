## Phase 2 — Capability Extraction, Batch 3

Extract economy, social, payment, voice, and work capabilities into reusable services and register them in the AION capability system. No page deletions, no route changes, no silent writes. All mutations stay behind `confirmationBridge`. All payments/external/messaging stay confirm-required.

### 1. New service modules (read-only adapters around existing logic)

| Service file | Wraps existing | Exposes |
|---|---|---|
| `src/services/fmMarket.ts` | `useFMBounties`, `fm_listings`, `fm_bounties` tables | `searchListings(query?)`, `previewListing(id)`, `summarizeFM(userId)` |
| `src/services/walletStatus.ts` | `useFMWallet`, `useFMTransactions` | `getWalletStatus(userId)`, `getRecentTransactions(userId)` |
| `src/services/communityFeed.ts` | `community_posts`, `community_threads` | `getFeed(query?)`, `getThread(threadId)` |
| `src/services/messaging.ts` | `messages`, `message_threads` | `searchMessages(userId, query?)`, `previewSend(userId, recipientId, body)` (no write) |
| `src/services/subscriptionStatus.ts` | edge fn `check-subscription`, `subscribers` table | `getSubscriptionStatus(userId)` (read-only summary) |
| `src/services/voiceCapture.ts` | edge fn `elevenlabs-transcribe` | `describeVoiceCapture()` (returns capability descriptor; actual transcription stays in existing hook, wrapped only) |
| `src/services/ttsSpeak.ts` | edge fn `elevenlabs-tts`, existing `ttsPlayer` | `previewTTS(text, voiceId?)` returns metadata only; actual playback through confirmation |
| `src/services/workSummary.ts` | `useTodayWorkSessions`, `useTodayWorkScore` | `summarizeWorkToday(userId)`, `previewStartSession(input)` |
| `src/services/scheduleBlocks.ts` (already exists — extend) | `schedule_blocks` table | Add `previewBlock(input)`, `summarizeUpcomingBlocks(userId)` |

All services follow the Batch 1/2 pattern: read-only Supabase queries with RLS, return `{ text, samples?, total?, ... }` shaped payloads. No writes.

### 2. Capability registry additions (`src/orchestration/capabilities/registry.ts`)

| ID | declaredMode | safety | artifactKind |
|---|---|---|---|
| `fm.search` | read | safe | `marketplace.card` |
| `fm.listing.preview` | read | safe | `marketplace.card` |
| `fm.listing.create` | mutate | safe | `marketplace.card` |
| `wallet.open` | read | safe | `wallet.sheet` |
| `wallet.status` | read | safe | `wallet.sheet` |
| `community.feed` | read | safe | `community.preview` |
| `community.thread` | read | safe | `community.preview` |
| `message.search` | read | safe | `message.preview` |
| `message.send` | mutate | safe | `message.preview` |
| `subscription.status` | read | safe | `subscription.card` |
| `subscription.portal` | mutate | safe | `checkout.confirmation` |
| `checkout.create` | mutate | safe | `checkout.confirmation` |
| `voice.transcribe` | read | safe | `voice.capture` |
| `tts.speak` | mutate | safe | `audio.preview` |
| `work.startSession` | mutate | safe | `work.session-card` |
| `work.summarize` | read | safe | `work.session-card` |
| `schedule.block` | mutate | safe | `schedule.block-preview` |

Add these IDs to `CONFIRM_REQUIRED_CAPABILITIES`:
`fm.listing.create`, `message.send`, `subscription.portal`, `checkout.create`, `tts.speak`, `work.startSession`, `schedule.block`.

(`voice.transcribe` is read because it captures transient audio without DB write; the actual edge call already requires user mic gesture.)

### 3. Router rules (`observeRouter.ts`)

Add bilingual keyword buckets above existing rules where higher priority is needed (mutate-before-read pattern):

```text
fm.listing.create   → /list.*(item|on market)|create.*listing/i, /העלה למרקט|פרסם.*מודעה|תפרסם.*מוצר/
message.send        → /send.*message|reply to/i, /שלח הודעה|תשלח לו|תענה ל/
subscription.portal → /manage.*(subscription|plan|billing)/i, /נהל.*מנוי|בטל מנוי|חיוב/
checkout.create     → /upgrade|buy|subscribe|checkout/i, /שדרג|קנה|הרשם.*פלוס|שלם/
work.startSession   → /start.*(focus|deep work|session)/i, /התחל.*פוקוס|פתח טיימר|זמן עבודה/
schedule.block      → /schedule.*block|block.*time|put.*calendar/i, /קבע בלוק|חסום זמן|תוסיף ליומן/
tts.speak           → /read.*aloud|speak.*this/i, /הקרא לי|תקרא לי|דבר את זה/
voice.transcribe    → /transcribe|voice note/i, /תמלל|הקלטה קולית/
```

Reads:
```text
fm.search          → /marketplace|free market|bounties/i, /שוק חופשי|באונטיז|מרקט|מודעות/
fm.listing.preview → /show.*listing|preview.*listing/i, /הצג מודעה|תראה לי את ה?מודעה/
wallet.status      → /wallet|balance|mos\b/i, /ארנק|יתרה|כמה MOS/
wallet.open        → /open.*wallet/i, /פתח.*ארנק/
community.feed     → /community|feed/i, /קהילה|פיד/
community.thread   → /thread|discussion/i, /שיחה|דיון/
message.search     → /search.*messages|find.*messages/i, /חפש בהודעות|הודעות/
subscription.status→ /my.*subscription|plan.*status/i, /המנוי שלי|מצב מנוי/
work.summarize     → /work.*today|focus.*summary/i, /כמה עבדתי|סיכום עבודה|פוקוס היום/
```

### 4. `safeReadExecutor.ts` — add cases

For each new capability, add a `read*` helper and a `case` branch wired to its service. Mutate capabilities still execute the read path for grounding (same pattern as `landing.generate` → `readLanding`).

Mapping:
- `fm.search` → `searchListings`
- `fm.listing.preview` / `fm.listing.create` → `previewListing` / `summarizeFM`
- `wallet.open` / `wallet.status` → `getWalletStatus`
- `community.feed` → `getFeed`
- `community.thread` → `getThread`
- `message.search` / `message.send` → `searchMessages`
- `subscription.status` / `subscription.portal` / `checkout.create` → `getSubscriptionStatus`
- `voice.transcribe` → `describeVoiceCapture` (pure metadata)
- `tts.speak` → `previewTTS` (text validation only)
- `work.summarize` / `work.startSession` → `summarizeWorkToday`
- `schedule.block` → `summarizeUpcomingBlocks`

### 5. `safeBridge.ts` — artifact mappings

Add `case` branches mapping new `artifactKind` values to existing renderers. Since `marketplace.card`, `wallet.sheet`, `community.preview`, `message.preview`, `subscription.card`, `checkout.confirmation`, `voice.capture`, `audio.preview`, `work.session-card`, `schedule.block-preview` do **not** have dedicated renderers in `artifactRegistry`, fall back to existing safe kinds:

| sourceKind | renderer kind | CTA href |
|---|---|---|
| `marketplace.card` | `capability` | `/free-market` |
| `wallet.sheet` | `capability` | `/free-market?wallet=open` (opens existing modal) |
| `community.preview` | `capability` | `/community` |
| `message.preview` | `capability` | `/messages` |
| `subscription.card` | `note` | `/subscriptions` |
| `checkout.confirmation` | `capability` | `/subscriptions` |
| `voice.capture` | `note` | none (transient) |
| `audio.preview` | `note` | none |
| `work.session-card` | `capability` | `/work` |
| `schedule.block-preview` | `capability` | `/work` |

Each mapped entry emits `artifact.candidate` with `rendered:true`. If a true dedicated renderer is later wanted, it can replace the fallback without touching capability code. Mappings that genuinely have no safe surface (none in this batch) would emit `artifact.skipped(reason: missing_renderer)`.

### 6. `confirmationBridge.ts` — describe() additions

Add cases for each confirm-required capability. Examples:
- `fm.listing.create`: title "לפרסם מודעה?", source `fm_listings`, label "פרסם".
- `message.send`: title "לשלוח את ההודעה?", source `messages`, label "שלח".
- `subscription.portal`: title "לפתוח את ניהול המנוי?", source `customer-portal` (external), label "פתח Portal".
- `checkout.create`: title "להמשיך לתשלום?", source `create-checkout-session`, label "המשך לתשלום".
- `tts.speak`: title "להשמיע בקול?", source `elevenlabs-tts`, label "השמע".
- `work.startSession`: title "להתחיל סשן פוקוס?", source `work_sessions`, label "התחל".
- `schedule.block`: title "להוסיף בלוק ליומן?", source `schedule_blocks`, label "קבע בלוק".

### 7. `safeMutationExecutor.ts` — wiring

Add minimal handlers (still no auto-execution; only run after confirm tap):
- `subscription.portal` / `checkout.create` → `supabase.functions.invoke('customer-portal' | 'create-checkout-session')`, return URL in `data.url`. Trace event `mutation.executed` includes `external:true`.
- `message.send` → `supabase.from('messages').insert(...)` (uses `targetId` as recipient + `ctx.message`).
- `fm.listing.create` → `supabase.from('fm_listings').insert(...)` (draft only, status='draft').
- `tts.speak` → invoke `elevenlabs-tts` edge function, play via existing `ttsPlayer`.
- `work.startSession` → `startWorkSession` from existing service.
- `schedule.block` → `createBlock` from existing `scheduleBlocks` service.

All branches keep current trace contract: `mutation.executed` / `mutation.skipped` with `source`, `rows_written`, `duration_ms`.

### 8. Trace events (no code change required — bridge already emits)

For every new capability the existing pipeline already produces:
- `capability.candidate` (router)
- `capability.executed` / `capability.skipped` / `capability.error` (read executor)
- `capability.result` (chat hook wraps read result)
- `artifact.candidate` (rendered:true) or `artifact.skipped` (reason:missing_renderer)
- For confirm-required: `suggestion.generated`, `confirmation.shown`, `confirmation.accepted|cancelled`, `mutation.executed|skipped`

No new trace plumbing needed.

### Acceptance table

| Capability | Old page source | Service extracted | Artifact mapped | Write mode | Trace proof |
|---|---|---|---|---|---|
| `fm.search` | `pages/fm/FMMarket.tsx` | `services/fmMarket.ts` | `marketplace.card` → `capability` | read | candidate→executed→artifact.candidate |
| `fm.listing.preview` | `FMMarket.tsx` | `fmMarket.previewListing` | `marketplace.card` | read | candidate→executed→artifact.candidate |
| `fm.listing.create` | `components/fm/FMPublishWizard.tsx` | `fmMarket` (read) + mutation insert | `marketplace.card` | confirm-required mutate | suggestion→shown→accepted→mutation.executed |
| `wallet.open` | `WalletModalContext` | `walletStatus` | `wallet.sheet` → `capability` | read | candidate→executed→artifact.candidate |
| `wallet.status` | `useFMWallet` | `walletStatus.getWalletStatus` | `wallet.sheet` | read | candidate→executed→artifact.candidate |
| `community.feed` | `pages/Community.tsx` | `communityFeed.getFeed` | `community.preview` → `capability` | read | candidate→executed→artifact.candidate |
| `community.thread` | `pages/MessageThread.tsx` | `communityFeed.getThread` | `community.preview` | read | candidate→executed→artifact.candidate |
| `message.search` | `pages/Messages.tsx` | `messaging.searchMessages` | `message.preview` → `capability` | read | candidate→executed→artifact.candidate |
| `message.send` | `pages/MessageThread.tsx` | `messaging` + insert | `message.preview` | confirm-required mutate | suggestion→shown→accepted→mutation.executed |
| `subscription.status` | `pages/Subscriptions.tsx`, `check-subscription` | `subscriptionStatus` | `subscription.card` → `note` | read | candidate→executed→artifact.candidate |
| `subscription.portal` | `customer-portal` edge fn | `subscriptionStatus` (read) + portal call | `checkout.confirmation` | external (confirm-required) | suggestion→shown→accepted→mutation.executed(external) |
| `checkout.create` | `create-checkout-session` edge fn | `subscriptionStatus` (read) + checkout call | `checkout.confirmation` | external (confirm-required) | suggestion→shown→accepted→mutation.executed(external) |
| `voice.transcribe` | `useAuroraVoice` + `elevenlabs-transcribe` | `voiceCapture` | `voice.capture` → `note` | read | candidate→executed→artifact.candidate |
| `tts.speak` | `ttsPlayer` + `elevenlabs-tts` | `ttsSpeak.previewTTS` | `audio.preview` → `note` | confirm-required mutate | suggestion→shown→accepted→mutation.executed |
| `work.startSession` | `pages/WorkHub.tsx` + `useStartWorkSession` | `workSummary` (read) + start call | `work.session-card` → `capability` | confirm-required mutate | suggestion→shown→accepted→mutation.executed |
| `work.summarize` | `useTodayWorkScore`, `useTodayWorkSessions` | `workSummary.summarizeWorkToday` | `work.session-card` | read | candidate→executed→artifact.candidate |
| `schedule.block` | `services/scheduleBlocks.ts` (existing) | extend with `previewBlock` + insert | `schedule.block-preview` → `capability` | confirm-required mutate | suggestion→shown→accepted→mutation.executed |

### Files to be created / edited

**New:**
- `src/services/fmMarket.ts`
- `src/services/walletStatus.ts`
- `src/services/communityFeed.ts`
- `src/services/messaging.ts`
- `src/services/subscriptionStatus.ts`
- `src/services/voiceCapture.ts`
- `src/services/ttsSpeak.ts`
- `src/services/workSummary.ts`

**Edited:**
- `src/orchestration/capabilities/registry.ts` (17 new IDs + confirm set)
- `src/orchestration/router/observeRouter.ts` (16 new keyword rules)
- `src/orchestration/executors/safeReadExecutor.ts` (17 new read branches)
- `src/orchestration/artifacts/safeBridge.ts` (10 new artifactKind→renderer mappings)
- `src/orchestration/artifacts/confirmationBridge.ts` (7 new describe() cases)
- `src/orchestration/executors/safeMutationExecutor.ts` (7 new mutation branches)
- `src/services/scheduleBlocks.ts` (extend with `previewBlock` + `summarizeUpcomingBlocks`)

### Guardrails

- No page deleted, no route removed.
- No `tts.speak`, `message.send`, `checkout.create`, `subscription.portal`, `fm.listing.create`, `work.startSession`, `schedule.block` runs without explicit confirm tap.
- All payment/external actions return URLs only; no card capture in app.
- Voice transcribe runs only on user mic gesture (existing rule preserved).
- Existing UI hooks (`useFMWallet`, `useStartWorkSession`, `useStripe*`) untouched — services adapt over them.
