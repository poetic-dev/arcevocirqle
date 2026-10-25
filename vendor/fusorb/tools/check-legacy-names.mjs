#!/usr/bin/env node
// check-legacy-names.mjs — the naming gate.
//
// Scans a repo for RENAMED legacy tokens and fails (exit 1) when one appears
// outside the allowlist. PENDING tokens are reported as info, never failures.
//
// The self-test is a hard gate: it proves that
//   * every `match` example is matched by its entry's patterns,
//   * every `noMatch` example is NOT matched by its entry's patterns, and
//   * no RENAMED or PENDING pattern matches any LIVE name (including the live
//     domain and an email address on it).
//
// Configuration comes ONLY from CLI flags, so this file (and scripts/lib/)
// can be vendored into another repo unchanged:
//   --root <dir>       repo root to scan (default ".")
//   --ledger <file>    naming-ledger.json (required)
//   --allow <glob>     extra allowlisted path (repeatable)
//
// A line containing the literal "legacy-ok" is exempt from the scan.
//
// Zero runtime dependencies. Node 22+, ESM. Windows + Linux safe.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { walkFiles } from "./lib/fs-walk.mjs";
import { globToRegExp } from "./lib/glob.mjs";

function parseArgs(argv) {
  const opts = { root: ".", ledger: null, allow: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--root") opts.root = argv[++i];
    else if (a === "--ledger") opts.ledger = argv[++i];
    else if (a === "--allow") opts.allow.push(argv[++i]);
    else {
      console.error(`check-legacy-names: unknown argument "${a}"`);
      process.exit(1);
    }
  }
  if (!opts.ledger) {
    console.error("check-legacy-names: --ledger <file> is required");
    process.exit(1);
  }
  return opts;
}

function compile(patterns) {
  return patterns.map((p) => new RegExp(p));
}

function selfTest(entries) {
  for (const entry of entries) {
    const patterns = compile(entry.patterns);
    for (const ex of entry.examples.match) {
      if (!patterns.some((re) => re.test(ex))) {
        throw new Error(
          `self-test: entry "${entry.id}" match example "${ex}" is not matched by any of its patterns`
        );
      }
    }
    for (const ex of entry.examples.noMatch) {
      if (patterns.some((re) => re.test(ex))) {
        throw new Error(
          `self-test: entry "${entry.id}" noMatch example "${ex}" is matched by one of its patterns`
        );
      }
    }
  }

  const renamedOrPending = entries.filter((e) => e.class !== "live");
  const renamedOrPendingPatterns = renamedOrPending.flatMap((e) =>
    e.patterns.map((p) => new RegExp(p))
  );
  const live = entries.filter((e) => e.class === "live");
  for (const entry of live) {
    for (const ex of entry.examples.match) {
      const offending = renamedOrPendingPatterns.find((re) => re.test(ex));
      if (offending) {
        throw new Error(
          `self-test: LIVE name "${ex}" is matched by a renamed/pending pattern ${offending}`
        );
      }
    }
  }
}

async function main() {
  const opts = parseArgs(process.argv);

  let ledger;
  try {
    ledger = JSON.parse(await readFile(opts.ledger, "utf8"));
  } catch (e) {
    console.error(`check-legacy-names: cannot read ledger ${opts.ledger}: ${e.message}`);
    process.exit(1);
  }

  try {
    selfTest(ledger.entries || []);
  } catch (e) {
    console.error(`check-legacy-names: SELF-TEST FAILED: ${e.message}`);
    console.error("check-legacy-names: fix the ledger before scanning (a live token must never match a renamed/pending pattern)");
    process.exit(1);
  }

  const root = path.resolve(opts.root);
  const files = await walkFiles(root);
  const allowGlobs = [...(ledger.allow || []), ...opts.allow].map(globToRegExp);
  const renamed = (ledger.entries || []).filter((e) => e.class === "renamed");
  const pending = (ledger.entries || []).filter((e) => e.class === "pending");

  let failures = 0;
  for (const file of files) {
    if (allowGlobs.some((re) => re.test(file))) continue;
    let text;
    try {
      text = await readFile(path.join(root, file), "utf8");
    } catch {
      continue;
    }
    const lines = text.split(/\r?\n/);
    let inGenerated = false;
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (line.includes("<!-- BEGIN:generated")) {
        inGenerated = true;
        continue;
      }
      if (line.includes("<!-- END -->")) {
        inGenerated = false;
        continue;
      }
      if (inGenerated) continue;
      if (line.includes("legacy-ok")) continue;
      for (const entry of renamed) {
        for (const p of entry.patterns) {
          if (new RegExp(p).test(line)) {
            failures += 1;
            console.error(
              `${file}:${i + 1}: renamed "${entry.from.join(", ")}" -> "${entry.to}" (update or allowlist)`
            );
          }
        }
      }
      for (const entry of pending) {
        for (const p of entry.patterns) {
          if (new RegExp(p).test(line)) {
            console.log(`info: ${file}:${i + 1}: pending "${entry.from.join(", ")}" -> "${entry.to}"`);
          }
        }
      }
    }
  }

  if (failures > 0) {
    console.error(`check-legacy-names: ${failures} renamed token(s) found outside the allowlist`);
    process.exit(1);
  }
  console.log("check-legacy-names: OK (self-test passed)");
}

main();
