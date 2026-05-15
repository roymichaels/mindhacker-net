# Clone & Deploy MindOS — One Prompt

This is the only file you need to migrate the project out of Lovable.
Everything below is idempotent and safe to re-run.

---

## TL;DR — 5 commands

```bash
git clone <your-repo-url> mindos && cd mindos
cp .env.example .env          # then fill in the 3 VITE_* values + OPENROUTER_API_KEY
bun install
bun run bootstrap             # links Supabase, pushes migrations, deploys edge fns
bun run dev                   # http://localhost:8080
```

That's it. The `bootstrap` script handles linking, migrations, edge-function
deploys, and tells you exactly which secrets are still missing.

---

## What you need before starting

| Tool | Install |
|---|---|
| Node 20+ or Bun 1.1+ | https://bun.sh |
| Supabase CLI | https://supabase.com/docs/guides/cli |
| A Supabase project (free tier is fine) | https://supabase.com/dashboard |
| OpenRouter API key (for AI) | https://openrouter.ai/keys |

Optional: Stripe, ElevenLabs, Resend, Web3Auth — only if you use those features.

---

## Required env values

From your Supabase dashboard → **Project Settings → API**:

```env
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...   # same value
VITE_SUPABASE_PROJECT_ID=<ref>
```

If migrating an existing Lovable project, copy these from
**Lovable → Connectors → Lovable Cloud** before disabling Cloud.

---

## Edge-function secrets

After `bun run bootstrap` succeeds, set the secrets you actually need:

```bash
supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...   # required for AI
supabase secrets set ELEVENLABS_API_KEY=...            # voice (optional)
supabase secrets set STRIPE_SECRET_KEY=sk_live_...     # payments (optional)
supabase secrets set RESEND_API_KEY=re_...             # email (optional)
```

The AI gateway (`supabase/functions/_shared/aiGateway.ts`) auto-routes:
- `OPENROUTER_API_KEY` set → uses OpenRouter (recommended outside Lovable)
- otherwise → falls back to `LOVABLE_API_KEY` if present

No code changes are needed to switch providers.

---

## Auth configuration (one-time, in Supabase dashboard)

1. **Authentication → Providers** → enable **Email** + **Google**.
2. **Authentication → URL Configuration**:
   - Site URL: your production domain (e.g. `https://mindos.example.com`)
   - Redirect URLs: add your dev URL (`http://localhost:8080`) and production
3. (Optional) **Authentication → Providers → Email** → enable
   "Leaked password protection".

---

## Frontend deployment (Vercel)

1. Push the repo to GitHub.
2. Vercel → **New Project** → import → framework preset: **Vite**.
3. Add the same `VITE_*` env vars from your `.env`.
4. Build command: `bun run build`. Output: `dist`.
5. After first deploy, paste the production URL into Supabase Auth → Site URL.

(Any static host works — Netlify, Cloudflare Pages, S3+CloudFront. SPA
fallback is required: rewrite all unknown routes to `/index.html`.)

---

## Data migration (only if you have existing Lovable data)

Run these once **before** disabling Lovable Cloud:

```bash
# 1. Snapshot generated types
cp src/integrations/supabase/types.ts src/integrations/supabase/types.snapshot.ts

# 2. Dump every storage bucket
SUPABASE_URL=https://<old-ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<old-service-role> \
bun run export:storage

# 3. pg_dump the database (run from anywhere with psql installed)
pg_dump "postgresql://postgres:<pwd>@db.<old-ref>.supabase.co:5432/postgres" \
  --schema=public --data-only --no-owner > mindos-data.sql

# 4. Restore into the new project (after `bun run bootstrap`)
psql "postgresql://postgres:<pwd>@db.<new-ref>.supabase.co:5432/postgres" \
  < mindos-data.sql
```

Storage upload back into the new project: re-run `bun run export:storage`
pointed at the new project ref using `supabase storage cp` or the dashboard.

---

## Useful npm scripts

| Command | What it does |
|---|---|
| `bun run bootstrap` | Full setup: link, db push, fns deploy |
| `bun run bootstrap:ci` | Same, fails fast on missing env (for CI) |
| `bun run dev` | Local dev server |
| `bun run build` | Production build |
| `bun run db:push` | Replay migrations to linked project |
| `bun run fns:deploy` | Redeploy all edge functions |
| `bun run types:pull` | Regenerate `src/integrations/supabase/types.ts` |
| `bun run export:storage` | Download every storage bucket |
| `bun run audit:dead` | Refresh orphan-file list |

---

## Files that must NOT be hand-edited

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts` (regen via `bun run types:pull`)
- `supabase/config.toml` (project_id binding)
- `supabase/migrations/*` (append-only — never modify existing files)
- `supabase/functions/_shared/aiGateway.ts` (the AI provider seam)
- `supabase/functions/_shared/cors.ts` (already wildcard `*`)

---

## Smoke test after migration

1. `bun run dev` → app loads at `http://localhost:8080`.
2. Sign up with email → confirm email arrives.
3. Send a chat message to AION → response streams (confirms OpenRouter).
4. Open one world → atmosphere transitions cleanly.
5. Open browser console → no red errors.

If all five pass, you're fully migrated.

---

## After cutover (Lovable-specific surfaces to swap)

These still work after migration but are Lovable-flavored — replace at leisure:

- `src/integrations/lovable/index.ts` + `@lovable.dev/cloud-auth-js`
  → swap for `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- Auto type regeneration → wire `bun run types:pull` into CI.
- Auto edge-fn deploys → use `.github/workflows/deploy-functions.yml`
  (already in repo) with `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_ID`
  GitHub secrets.

---

## Reference docs in this repo

- [`MIGRATION.md`](./MIGRATION.md) — long-form run book
- [`AUDIT_REPORT.md`](./AUDIT_REPORT.md) — dead-code map (309 orphans, 6-wave plan)
- [`AUDIT_P2_ARCHITECTURE.md`](./AUDIT_P2_ARCHITECTURE.md) — runtime + provider tree
- [`AUDIT_P3_DEPENDENCIES.md`](./AUDIT_P3_DEPENDENCIES.md) — duplicate components, cleanup order
- [`AUDIT_P4_PERFORMANCE.md`](./AUDIT_P4_PERFORMANCE.md) — bundle, canvas, leak risks
- [`WAVE1_CLEANUP_REPORT.md`](./WAVE1_CLEANUP_REPORT.md) — what's already deleted

---

**Status: cloning is now `bun install && bun run bootstrap`. Nothing more.**
