import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EN_PATH = path.join(ROOT, 'src/i18n/translations/en.ts');
const ES_PATH = path.join(ROOT, 'src/i18n/translations/es.ts');

// Strip TS-isms so we can dynamically import via data URL
const enSrc = fs.readFileSync(EN_PATH, 'utf8');
const jsSrc = enSrc
  .replace(/import\s+type[^;]+;/g, '')
  .replace(/:\s*TranslationKeys/g, '')
  .replace(/export const en\s*=/, 'export const en =');

const dataUrl = 'data:text/javascript;base64,' + Buffer.from(jsSrc).toString('base64');
const mod = await import(dataUrl);
const en = mod.en;

// Walk tree, collect leaf string paths
const leaves = []; // { path: string[], value: string }
function walk(node, p) {
  if (node === null || node === undefined) return;
  if (typeof node === 'string') { leaves.push({ path: p, value: node }); return; }
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, [...p, String(i)]));
    return;
  }
  if (typeof node === 'object') {
    for (const k of Object.keys(node)) walk(node[k], [...p, k]);
  }
}
walk(en, []);
console.log(`Collected ${leaves.length} string leaves`);

// Chunk
const CHUNK = 60;
const chunks = [];
for (let i = 0; i < leaves.length; i += CHUNK) chunks.push(leaves.slice(i, i + CHUNK));
console.log(`Translating in ${chunks.length} chunks of ${CHUNK}`);

const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) throw new Error('OPENROUTER_API_KEY missing');

const SYSTEM = `You are a professional UI translator from English to neutral Latin American Spanish (informal "tú", warm, concise).
Rules:
- Keep brand names exactly: AION, Aurora, Mind OS, MindOS.
- Keep all placeholders/tokens intact: {name}, {count}, {days}, %s, \\n, emoji, HTML tags.
- Keep punctuation style natural for Spanish (¿ ¡).
- Do NOT add explanations. Return ONLY a JSON object mapping each numeric id to its Spanish translation.
- If the input is empty string, return empty string.
- Use these glossary terms consistently: pillar=pilar, quest=misión, world=mundo, brain=mente, energy=energía, wallet=cartera, free market=mercado libre, journey=camino, streak=racha, plan=plan, level=nivel, dashboard=panel, settings=ajustes, login=iniciar sesión, logout=cerrar sesión, signup=registrarse, course=curso, session=sesión, coach=coach, practice=práctica, mission=misión, day=día, week=semana, focus=foco, tactics=tácticas, strategy=estrategia.`;

async function translateBatch(batch, idx) {
  const input = {};
  batch.forEach((l, i) => { input[String(i)] = l.value; });
  const user = `Translate these UI strings to Spanish. Return JSON object with same numeric keys, values are translations.\n\n${JSON.stringify(input)}`;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Chunk ${idx} failed: ${res.status} ${t.slice(0, 300)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content ?? '{}';
  let parsed;
  try { parsed = JSON.parse(content); }
  catch (e) {
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) throw new Error(`Chunk ${idx} no JSON: ${content.slice(0, 200)}`);
    parsed = JSON.parse(m[0]);
  }
  return parsed;
}

const translations = new Array(leaves.length);
let done = 0;
const CONC = 6;
async function worker(qIdx) {
  while (true) {
    const i = qIdx.shift();
    if (i === undefined) return;
    const batch = chunks[i];
    let attempts = 0;
    while (attempts < 3) {
      try {
        const out = await translateBatch(batch, i);
        batch.forEach((l, j) => {
          const v = out[String(j)];
          translations[i * CHUNK + j] = (typeof v === 'string') ? v : l.value;
        });
        break;
      } catch (e) {
        attempts++;
        console.error(`Chunk ${i} attempt ${attempts}: ${e.message}`);
        if (attempts >= 3) {
          // fallback: keep English
          batch.forEach((l, j) => { translations[i * CHUNK + j] = l.value; });
        } else {
          await new Promise(r => setTimeout(r, 1500 * attempts));
        }
      }
    }
    done++;
    if (done % 5 === 0 || done === chunks.length) console.log(`  ${done}/${chunks.length} chunks`);
  }
}
const queue = chunks.map((_, i) => i);
await Promise.all(Array.from({ length: CONC }, () => worker(queue)));

// Rebuild tree
const out = {};
function setPath(obj, p, val) {
  let cur = obj;
  for (let i = 0; i < p.length - 1; i++) {
    const k = p[i];
    if (!(k in cur) || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[p[p.length - 1]] = val;
}
leaves.forEach((l, i) => setPath(out, l.path, translations[i] ?? l.value));

// Serialize as TS
function emit(node, indent) {
  const pad = '  '.repeat(indent);
  const padInner = '  '.repeat(indent + 1);
  if (typeof node === 'string') return JSON.stringify(node);
  if (Array.isArray(node)) {
    if (node.length === 0) return '[]';
    return '[\n' + node.map(v => padInner + emit(v, indent + 1)).join(',\n') + '\n' + pad + ']';
  }
  const keys = Object.keys(node);
  if (keys.length === 0) return '{}';
  return '{\n' + keys.map(k => {
    const safe = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
    return padInner + safe + ': ' + emit(node[k], indent + 1);
  }).join(',\n') + '\n' + pad + '}';
}

const header = `/**
 * Spanish translations — full parity with en.ts (machine-translated, neutral Latin American Spanish).
 *
 * Generated by scripts/translate-es.mjs against the Lovable AI Gateway.
 * Brand names (AION, Aurora, Mind OS) preserved. Placeholders ({name}, {count}, etc.) preserved.
 *
 * Style: informal "tú", warm and concise. Glossary terms aligned with product copy.
 * Missing keys fall through to English via the resolver in src/i18n/index.ts.
 */
import type { TranslationKeys } from './he';

export const es: TranslationKeys = ${emit(out, 0)};
`;

fs.writeFileSync(ES_PATH, header);
console.log(`Wrote ${ES_PATH} (${header.split('\n').length} lines)`);
