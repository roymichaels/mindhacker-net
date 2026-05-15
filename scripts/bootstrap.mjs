#!/usr/bin/env node
/**
 * One-shot bootstrap for cloning MindOS outside Lovable.
 *
 *   bun run bootstrap              # interactive
 *   bun run bootstrap --ci         # fails fast on missing env (no prompts)
 *
 * What it does (idempotent — safe to re-run):
 *   1. Verifies Node/Bun/Supabase CLI versions.
 *   2. Ensures .env exists (copies .env.example if missing) and reports which
 *      required keys are still placeholders.
 *   3. Verifies supabase/migrations/ + supabase/functions/ are present.
 *   4. Links the Supabase project (skips if already linked).
 *   5. Pushes migrations (`supabase db push`).
 *   6. Deploys all edge functions (`supabase functions deploy`).
 *   7. Prints the secrets you still need to set + the next manual step.
 *
 * Nothing here mutates source files. Pure orchestration.
 */
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, copyFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CI = process.argv.includes('--ci');
const c = (n, s) => `\x1b[${n}m${s}\x1b[0m`;
const ok = (m) => console.log(c(32, '✓'), m);
const warn = (m) => console.log(c(33, '!'), m);
const err = (m) => console.log(c(31, '✗'), m);
const step = (m) => console.log('\n' + c(36, '▸ ' + m));

function has(cmd) {
  try { execSync(`${cmd} --version`, { stdio: 'ignore' }); return true; }
  catch { return false; }
}
function run(cmd, opts = {}) {
  const r = spawnSync(cmd, { shell: true, stdio: 'inherit', ...opts });
  return r.status === 0;
}

// ── 1. tooling ───────────────────────────────────────────────────────────
step('Checking required tooling');
const tools = {
  node: has('node'),
  npm: has('npm') || has('bun'),
  supabase: has('supabase'),
  git: has('git'),
};
for (const [t, present] of Object.entries(tools)) {
  present ? ok(`${t} found`) : err(`${t} missing`);
}
if (!tools.supabase) {
  warn('Install Supabase CLI: https://supabase.com/docs/guides/cli');
  if (CI) process.exit(1);
}

// ── 2. .env ──────────────────────────────────────────────────────────────
step('Verifying .env');
const envPath = join(ROOT, '.env');
const examplePath = join(ROOT, '.env.example');
if (!existsSync(envPath)) {
  if (existsSync(examplePath)) {
    copyFileSync(examplePath, envPath);
    warn('.env created from .env.example — fill in real values before continuing');
  } else {
    err('No .env or .env.example found.');
    process.exit(1);
  }
} else ok('.env exists');

const envText = readFileSync(envPath, 'utf8');
const REQUIRED = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_PROJECT_ID'];
const missing = REQUIRED.filter((k) => {
  const m = envText.match(new RegExp(`^${k}=(.*)$`, 'm'));
  return !m || !m[1] || m[1].includes('your-') || m[1].includes('your_');
});
if (missing.length) {
  warn(`Placeholder/missing in .env: ${missing.join(', ')}`);
  if (CI) process.exit(1);
} else ok('All required VITE_* keys are set');

const projectRef = (envText.match(/^VITE_SUPABASE_PROJECT_ID=(.+)$/m) || [])[1]?.trim();

// ── 3. repo integrity ────────────────────────────────────────────────────
step('Verifying repo structure');
for (const p of ['supabase/migrations', 'supabase/functions', 'supabase/config.toml', 'src/integrations/supabase/client.ts']) {
  existsSync(join(ROOT, p)) ? ok(p) : err(`Missing: ${p}`);
}

// ── 4. supabase link ─────────────────────────────────────────────────────
if (tools.supabase && projectRef && !CI) {
  step(`Linking Supabase project (${projectRef})`);
  run(`supabase link --project-ref ${projectRef}`);

  step('Pushing migrations (supabase db push)');
  run('supabase db push');

  step('Deploying edge functions');
  run('supabase functions deploy');
}

// ── 5. summary ───────────────────────────────────────────────────────────
step('Next steps');
console.log(`
  1. Set edge-function secrets (only those you use):
       supabase secrets set OPENROUTER_API_KEY=...
       supabase secrets set ELEVENLABS_API_KEY=...
       supabase secrets set STRIPE_SECRET_KEY=...
       supabase secrets set RESEND_API_KEY=...
  2. Enable Email + Google auth in the Supabase dashboard, set Site URL.
  3. Regenerate types snapshot (recommended after first push):
       supabase gen types typescript --linked > src/integrations/supabase/types.ts
  4. Start dev:  ${c(36, 'bun run dev')}
  5. Deploy frontend:  push to GitHub → import into Vercel (Vite preset).
`);
ok('Bootstrap complete.');
