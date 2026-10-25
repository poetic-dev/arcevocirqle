#!/usr/bin/env node
// sync-fusorb.mjs — vendored snapshot of the FUSORB repo's decided facts.
//
// SOURCE -> GENERATOR -> CONSUMER. This repo never hand-types ecosystem facts;
// it consumes a vendored snapshot that carries provenance (source commit, sync
// time, and a SHA-256 for each file).
//
//   --from <path>       copy the vendored files from the FUSORB repo and write
//                       vendor/fusorb/PROVENANCE.json
//   --check             (offline) verify every vendored file's SHA-256 matches
//                       PROVENANCE.json, no unlisted file exists under
//                       vendor/fusorb/, and the vendored ecosystem.json has the
//                       fields this repo needs
//   --check --from <path>  additionally fail if the source differs from the
//                       vendored copy
//
// Zero runtime dependencies. Node 22+, ESM. Windows + Linux safe.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const VENDOR = path.join(ROOT, "vendor", "fusorb");
const PROVENANCE_PATH = path.join(VENDOR, "PROVENANCE.json");

// Source path (relative to the FUSORB repo root) -> vendored path (relative to
// vendor/fusorb/). The tools/ subtree mirrors scripts/ + scripts/lib/ so the
// vendored check-legacy-names.mjs keeps its ./lib/* imports working.
const FILES = [
  { src: "ecosystem/ecosystem.json", dst: "ecosystem.json" },
  { src: "ecosystem/naming-ledger.json", dst: "naming-ledger.json" },
  { src: "scripts/check-legacy-names.mjs", dst: "tools/check-legacy-names.mjs" },
  { src: "scripts/lib/fs-walk.mjs", dst: "tools/lib/fs-walk.mjs" },
  { src: "scripts/lib/glob.mjs", dst: "tools/lib/glob.mjs" },
  { src: "scripts/lib/frontmatter.mjs", dst: "tools/lib/frontmatter.mjs" },
  { src: "scripts/lib/derived-facts.mjs", dst: "tools/lib/derived-facts.mjs" },
  { src: "scripts/lib/links.mjs", dst: "tools/lib/links.mjs" },
];

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function parseArgs(argv) {
  const opts = { check: false, from: null };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--check") opts.check = true;
    else if (a === "--from") opts.from = argv[++i];
    else {
      console.error(`sync-fusorb: unknown argument "${a}"`);
      process.exit(1);
    }
  }
  if (!opts.check && !opts.from) {
    console.error("sync-fusorb: use --from <path> to sync, or --check to verify");
    process.exit(1);
  }
  return opts;
}

// Recursively list files under dir as POSIX-style relative paths.
async function listFiles(dir, base = dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).split(path.sep).join("/");
    if (entry.isDirectory()) {
      out.push(...(await listFiles(full, base)));
    } else if (entry.isFile()) {
      out.push(rel);
    }
  }
  return out;
}

// Structural check against what this repo consumes, not a full schema.
function validateEcosystem(eco) {
  const problems = [];
  if (eco === null || typeof eco !== "object" || Array.isArray(eco)) {
    return ["ecosystem.json must be a JSON object"];
  }
  if (!Array.isArray(eco.products)) {
    problems.push("ecosystem.json products must be an array");
  } else {
    eco.products.forEach((p, i) => {
      const where = `products[${i}]`;
      if (typeof p?.name !== "string" || p.name === "") problems.push(`${where}.name must be a non-empty string`);
      if (typeof p?.audience !== "string" || p.audience === "") problems.push(`${where}.audience must be a non-empty string`);
      if (typeof p?.role !== "string" || p.role === "") problems.push(`${where}.role must be a non-empty string`);
      if (p?.legacyNames !== undefined && !Array.isArray(p.legacyNames)) problems.push(`${where}.legacyNames must be an array`);
    });
  }
  if (!Array.isArray(eco.domains)) {
    problems.push("ecosystem.json domains must be an array");
  } else {
    eco.domains.forEach((d, i) => {
      const where = `domains[${i}]`;
      if (typeof d?.host !== "string" || d.host === "") problems.push(`${where}.host must be a non-empty string`);
      if (typeof d?.status !== "string" || d.status === "") problems.push(`${where}.status must be a non-empty string`);
    });
  }
  return problems;
}

async function sync(from) {
  let sourceCommit;
  try {
    sourceCommit = execFileSync("git", ["-C", from, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch (e) {
    console.error(`sync-fusorb: cannot read git HEAD of --from path: ${e.message}`);
    process.exit(1);
  }

  await rm(VENDOR, { recursive: true, force: true });
  await mkdir(VENDOR, { recursive: true });

  const provenance = { sourceCommit, syncedAt: new Date().toISOString(), files: [] };
  for (const { src, dst } of FILES) {
    const srcPath = path.join(from, src);
    const dstPath = path.join(VENDOR, dst);
    const data = await readFile(srcPath);
    await mkdir(path.dirname(dstPath), { recursive: true });
    await writeFile(dstPath, data);
    provenance.files.push({ path: dst, sha256: sha256(data) });
  }
  await writeFile(PROVENANCE_PATH, JSON.stringify(provenance, null, 2) + "\n", "utf8");
  return provenance;
}

async function check({ from = null } = {}) {
  let failures = 0;
  const fail = (msg) => {
    failures += 1;
    console.error("check:sync: " + msg);
  };

  let provenance;
  try {
    provenance = JSON.parse(await readFile(PROVENANCE_PATH, "utf8"));
  } catch (e) {
    fail(`cannot read vendor/fusorb/PROVENANCE.json (${e.message}); run sync:fusorb --from <path>`);
    return failures;
  }

  const listed = new Map((provenance.files || []).map((f) => [f.path, f.sha256]));
  const actualFiles = (await listFiles(VENDOR)).filter((f) => f !== "PROVENANCE.json");

  for (const rel of actualFiles) {
    const data = await readFile(path.join(VENDOR, rel));
    const hash = sha256(data);
    if (!listed.has(rel)) {
      fail(`unlisted file under vendor/fusorb/: ${rel}`);
    } else if (listed.get(rel) !== hash) {
      fail(`vendored file hash mismatch: ${rel}`);
    }
  }
  for (const rel of listed.keys()) {
    if (!actualFiles.includes(rel)) fail(`provenance lists missing file: ${rel}`);
  }

  let eco;
  try {
    eco = JSON.parse(await readFile(path.join(VENDOR, "ecosystem.json"), "utf8"));
  } catch (e) {
    fail(`vendored ecosystem.json is not valid JSON: ${e.message}`);
    return failures;
  }
  for (const p of validateEcosystem(eco)) fail(p);

  if (from) {
    for (const { src, dst } of FILES) {
      let srcData;
      try {
        srcData = await readFile(path.join(from, src));
      } catch {
        fail(`source file missing: ${src}`);
        continue;
      }
      const vendoredData = await readFile(path.join(VENDOR, dst));
      if (sha256(srcData) !== sha256(vendoredData)) {
        fail(`source differs from vendored copy: ${src}`);
      }
    }
  }

  return failures;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.check) {
    const failures = await check({ from: opts.from });
    if (failures > 0) {
      console.error(`check:sync: ${failures} problem(s) found`);
      process.exit(1);
    }
    console.log("check:sync: OK");
    return;
  }
  const provenance = await sync(opts.from);
  console.log(`sync:fusorb: vendored ${provenance.files.length} files from ${provenance.sourceCommit}`);
}

main().catch((e) => {
  console.error("sync-fusorb: " + e.message);
  process.exit(1);
});
