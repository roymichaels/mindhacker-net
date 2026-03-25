# Supabase Backend

This directory is reserved for the database and minimal backend surface in the Evolve monorepo.

Target contents:
- `migrations/`
- `functions/`
- `seed/`

Current state:
- The live Supabase project files still remain in the repository root `supabase/`
- They have not been physically moved yet to avoid breaking the active deployment and CLI workflows during the first bootstrap pass

Next step:
- Move `supabase/` into `backend/supabase/`
- Update deployment/docs/scripts to use the new location
