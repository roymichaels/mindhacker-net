# MindOS — External Migration Run Book

This document captures everything needed to clone, run, and deploy MindOS outside Lovable.
It is the operational counterpart to the audit in `.lovable/plan.md`.

---

## 1. Run Book (local + deploy)

```text
1.  Export source: zip repo from Lovable (or git clone the auto-mirrored repo).
2.  cp .env.example .env
    Fill: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY,
          VITE_SUPABASE_PROJECT_ID.
3.  npm install              # bun install also works
4.  npm run dev              # http://localhost:8080
5.  supabase login && supabase link --project-ref <ref>
6.  supabase db push         # replays all migrations in supabase/migrations/
7.  supabase functions deploy --project-ref <ref>
    (or use .github/workflows/deploy-functions.yml)
8.  Set edge secrets:
      supabase secrets set OPENROUTER_API_KEY=...     # AI (preferred path)
      supabase secrets set LOVABLE_API_KEY=...        # optional fallback
      supabase secrets set ELEVENLABS_API_KEY=...     # voice (optional)
      supabase secrets set STRIPE_SECRET_KEY=...      # payments (optional)
      supabase secrets set RESEND_API_KEY=...         # email (optional)
9.  Auth: enable Email + Google in Supabase dashboard.
    Set Site URL and additional redirect URLs for the new domain.
10. Vercel: import repo, framework = Vite, output = dist.
    Add the same VITE_* vars used locally.
11. Stripe webhook → repoint to new functions URL.
12. Web3Auth (optional): register a verifier for the new domain,
    keep behind feature flag VITE_ENABLE_NFT_INVENTORY=false.
```

---

## 2. AI Gateway Behavior

`supabase/functions/_shared/aiGateway.ts` is the single migration seam.

- If `OPENROUTER_API_KEY` is set → all AI calls go to OpenRouter (model IDs auto-mapped).
- Else if `LOVABLE_API_KEY` is set → calls go to the Lovable AI Gateway.
- To exit Lovable AI: set `OPENROUTER_API_KEY` and unset `LOVABLE_API_KEY`. No code changes needed.

---

## 3. Regenerating Supabase Types

`src/integrations/supabase/types.ts` is auto-managed inside Lovable. Outside Lovable, regenerate with:

```bash
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

Snapshot the current file before cutover so a known-good baseline exists.

---

## 4. Storage Export

Run the bundled script to download every storage bucket via the service role key:

```bash
SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service_role_key> \
npx tsx scripts/export-storage.ts ./storage-dump
```

The script lists all buckets and recursively downloads every object into `./storage-dump/<bucket>/<path>`.

---

## 5. Export Checklist

- [ ] Full source tree (`src/`, `supabase/`, `api/`, `public/`, configs).
- [ ] `package.json` + lockfile (regenerate if missing).
- [ ] `.env.example` (committed) + private `.env` values backed up out of band.
- [ ] All migrations under `supabase/migrations/` (already in repo).
- [ ] **Database dump** (`pg_dump`) of production data:
      `auth.users`, `profiles`, `user_roles`, AION memory tables,
      journals, `action_items`, `ai_generations`, `dna_*`,
      conversation/message history, subscription records.
- [ ] All edge function source dirs under `supabase/functions/`.
- [ ] Storage objects (use `scripts/export-storage.ts`).
- [ ] `public/` assets (icons, manifest, sitemap, robots).
- [ ] `src/integrations/supabase/types.ts` snapshot.
- [ ] Web3 contract addresses (none in repo today; export from Web3Auth dashboard if any).
- [ ] Secret name list (no values) — see §6 below.
- [ ] `vercel.json` and `.github/workflows/*`.
- [ ] Docs and content (`docs/`, `management/`, blog posts in DB).

---

## 6. Required Secrets (names only)

**Frontend (Vite):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- Optional flags: `VITE_ENABLE_*`, `VITE_AGENT_API_BASE_URL`

**Edge functions / backend:**
- `OPENROUTER_API_KEY` (preferred AI path)
- `LOVABLE_API_KEY` (optional fallback while still on Lovable)
- `ELEVENLABS_API_KEY` (TTS + transcribe; optional)
- `STRIPE_SECRET_KEY` (payments; optional)
- `RESEND_API_KEY` (transactional email; optional)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**CI / GitHub Actions:**
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_ID`

---

## 7. Files That Must NOT Be Touched During Migration

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts` (snapshot, do not hand-edit)
- `supabase/config.toml` (project_id binding)
- `supabase/migrations/*` (append-only)
- `supabase/functions/_shared/aiGateway.ts` (the migration seam)
- `vite.config.ts`, `vercel.json`, `tailwind.config.ts`, `tsconfig*.json`
- `public/manifest.webmanifest`, `public/custom-sw.js`
- `.env`, `.env.example`

---

## 8. CORS Posture

`supabase/functions/_shared/cors.ts` uses `Access-Control-Allow-Origin: *`.
No domain pinning is required when moving to a new host. Tighten only if your
threat model changes.

---

## 9. Lovable-Only Surfaces to Replace After Cutover

- `src/integrations/lovable/index.ts` and the `@lovable.dev/cloud-auth-js` npm
  dependency. Replace with direct `supabase.auth.signInWithOAuth(...)`.
- Reliance on Lovable to auto-regenerate `supabase/types.ts` — replace with the
  CLI command in §3, optionally as a CI step.
- Reliance on Lovable to auto-deploy edge functions — replace with the GitHub
  workflow `.github/workflows/deploy-functions.yml`.

---

## 10. Cleanup Phases (after migration is stable)

- **Phase A** — Migration stabilization (this document).
- **Phase B** — Remove `src/_legacy/`, archive `src/hallway/` and
  `src/flows/pillarSpecs/`, drop unused npm deps confirmed by `depcheck`.
- **Phase C** — Ontology cleanup, single canonical orb path, single canvas,
  optional move to the `apps/evolve` + `backend/supabase` monorepo target.

See `.lovable/plan.md` for the full audit and rationale.