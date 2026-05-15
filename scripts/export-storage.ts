/**
 * Export every Supabase Storage bucket to a local directory.
 *
 * Usage:
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<service_role> \
 *   npx tsx scripts/export-storage.ts ./storage-dump
 *
 * Notes:
 *   - Requires the service role key (lists every bucket and object).
 *   - Recursively walks every prefix.
 *   - Skips files that already exist locally with a non-zero size, so
 *     re-runs are resumable.
 */

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OUT_DIR = process.argv[2] ?? "./storage-dump";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function exists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.size > 0;
  } catch {
    return false;
  }
}

async function walkBucket(bucket: string, prefix = ""): Promise<void> {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) {
    console.error(`[${bucket}] list ${prefix} failed:`, error.message);
    return;
  }
  if (!data) return;

  for (const entry of data) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    const isFolder = entry.id === null;
    if (isFolder) {
      await walkBucket(bucket, path);
      continue;
    }

    const localPath = join(OUT_DIR, bucket, path);
    if (await exists(localPath)) {
      console.log(`[${bucket}] skip (exists) ${path}`);
      continue;
    }

    const { data: blob, error: dlErr } = await supabase.storage
      .from(bucket)
      .download(path);
    if (dlErr || !blob) {
      console.error(`[${bucket}] download ${path} failed:`, dlErr?.message);
      continue;
    }
    await mkdir(dirname(localPath), { recursive: true });
    const buf = Buffer.from(await blob.arrayBuffer());
    await writeFile(localPath, buf);
    console.log(`[${bucket}] saved ${path} (${buf.length} bytes)`);
  }
}

async function main() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error || !buckets) {
    console.error("Failed to list buckets:", error?.message);
    process.exit(1);
  }
  console.log(`Found ${buckets.length} bucket(s):`, buckets.map((b) => b.name).join(", "));
  for (const b of buckets) {
    console.log(`\n=== bucket: ${b.name} (public=${b.public}) ===`);
    await walkBucket(b.name);
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});