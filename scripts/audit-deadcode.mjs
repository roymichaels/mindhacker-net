// Build a static import graph for src/ and report orphans, route-reachability,
// and usage counts. Resolves @/ alias and relative imports.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname, relative, extname } from 'node:path';

const ROOT = resolve('src');
const ALIAS = { '@/': ROOT + '/' };
const EXTS = ['.ts', '.tsx', '.js', '.jsx'];
const INDEX_NAMES = EXTS.flatMap(e => ['/index' + e]);

function walk(dir, out=[]) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXTS.includes(extname(p))) out.push(p);
  }
  return out;
}

function tryResolve(spec, fromFile) {
  let base;
  if (spec.startsWith('@/')) base = ALIAS['@/'] + spec.slice(2);
  else if (spec.startsWith('./') || spec.startsWith('../')) base = resolve(dirname(fromFile), spec);
  else return null; // bare module
  // exact
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const e of EXTS) if (existsSync(base + e)) return base + e;
  for (const idx of INDEX_NAMES) if (existsSync(base + idx)) return base + idx;
  return null;
}

const files = walk(ROOT);
const importGraph = new Map(); // file -> Set(imported files)
const reverse = new Map();     // file -> Set(importers)
const importRe = /(?:from\s+['"]([^'"]+)['"])|(?:import\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const set = new Set();
  let m;
  while ((m = importRe.exec(src))) {
    const spec = m[1] || m[2];
    const target = tryResolve(spec, f);
    if (target) set.add(target);
  }
  importGraph.set(f, set);
}
for (const [from, deps] of importGraph) {
  for (const d of deps) {
    if (!reverse.has(d)) reverse.set(d, new Set());
    reverse.get(d).add(from);
  }
}

// Roots = entry + every file referenced by App.tsx routing or main.tsx, etc.
// We treat as roots: main.tsx, App.tsx, anything in api/, plus files referenced by index.html.
const ENTRY_PATTERNS = ['src/main.tsx', 'src/App.tsx'];
const roots = new Set(ENTRY_PATTERNS.map(p => resolve(p)).filter(existsSync));

// BFS reachability
const reachable = new Set();
const queue = [...roots];
while (queue.length) {
  const f = queue.pop();
  if (reachable.has(f)) continue;
  reachable.add(f);
  const deps = importGraph.get(f);
  if (deps) for (const d of deps) queue.push(d);
}

const orphans = files.filter(f => !reachable.has(f));
const orphanByDir = {};
for (const o of orphans) {
  const rel = relative(ROOT, o);
  const top = rel.split('/')[0];
  orphanByDir[top] = (orphanByDir[top] || 0) + 1;
}

// Hot files: top importers
const usage = files.map(f => [relative(ROOT, f), (reverse.get(f)?.size || 0)]).sort((a,b)=>b[1]-a[1]);

console.log('=== TOTALS ===');
console.log('files in src:', files.length);
console.log('reachable from main+App:', reachable.size);
console.log('orphans (no path from entry):', orphans.length);
console.log('\n=== ORPHANS BY TOP-LEVEL DIR ===');
for (const [k,v] of Object.entries(orphanByDir).sort((a,b)=>b[1]-a[1])) console.log(v.toString().padStart(4), k);
console.log('\n=== ALL ORPHANS ===');
for (const o of orphans) console.log(relative(ROOT, o));
console.log('\n=== TOP 30 MOST-IMPORTED FILES ===');
for (const [f,n] of usage.slice(0,30)) console.log(n.toString().padStart(4), f);

// Save raw lists
import { writeFileSync } from 'node:fs';
writeFileSync('/tmp/orphans.txt', orphans.map(o => relative(ROOT, o)).join('\n'));
writeFileSync('/tmp/usage.json', JSON.stringify(Object.fromEntries(usage), null, 2));
