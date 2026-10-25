#!/usr/bin/env node
// check-public-boundary.mjs — the public boundary gate.
//
// Reads the vendored ecosystem.json and fails (exit 1) when a page marked
// visibility: public:
//   * names a product whose audience is not public (match product name and
//     legacyNames, whole word, case-insensitive)
//   * contains a hostname whose domain status is not live
//   * names or links to a retired org
//   * is public while its status is planned
//
// Zero runtime dependencies. Node 22+, ESM. Windows + Linux safe.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "../vendor/fusorb/tools/lib/frontmatter.mjs";
import { walkFiles } from "../vendor/fusorb/tools/lib/fs-walk.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const ECOSYSTEM = path.join(ROOT, "vendor", "fusorb", "ecosystem.json");

let failures = 0;
function fail(msg) {
  failures += 1;
  console.error("check:public-boundary: " + msg);
}

function escapeRegExp(s) {
  return s.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}

function wholeWord(token) {
  return new RegExp(`\\b${escapeRegExp(token)}\\b`, "i");
}

async function main() {
  let eco;
  try {
    eco = JSON.parse(await readFile(ECOSYSTEM, "utf8"));
  } catch (e) {
    fail(`cannot read vendored ecosystem.json: ${e.message}`);
    process.exit(1);
  }

  const nonPublicTokens = [];
  for (const p of eco.products || []) {
    if (p.audience !== "public") {
      nonPublicTokens.push(p.name);
      for (const legacy of p.legacyNames || []) nonPublicTokens.push(legacy);
    }
  }
  const nonLiveHosts = (eco.domains || []).filter((d) => d.status !== "live").map((d) => d.host);
  const retiredOrgs = (eco.orgs || []).filter((o) => o.status === "retired").map((o) => o.id);

  const contentFiles = (await walkFiles(CONTENT)).filter((f) => f.endsWith(".md"));
  for (const rel of contentFiles) {
    const full = path.join(CONTENT, rel);
    const text = await readFile(full, "utf8");
    const { data, hasFrontmatter } = parseFrontmatter(text);
    if (!hasFrontmatter || data.visibility !== "public") continue;

    if (data.status === "planned") {
      fail(`${rel}: page is public while status is planned`);
    }

    for (const token of nonPublicTokens) {
      if (wholeWord(token).test(text)) {
        fail(`${rel}: public page names non-public product "${token}"`);
      }
    }

    for (const host of nonLiveHosts) {
      if (new RegExp(`\\b${escapeRegExp(host)}\\b`, "i").test(text)) {
        fail(`${rel}: public page contains non-live host "${host}"`);
      }
    }

    for (const org of retiredOrgs) {
      if (wholeWord(org).test(text)) {
        fail(`${rel}: public page names retired org "${org}"`);
      }
    }
  }

  if (failures > 0) {
    console.error(`check:public-boundary: ${failures} problem(s) found`);
    process.exit(1);
  }
  console.log("check:public-boundary: OK");
}

main().catch((e) => {
  console.error("check:public-boundary: " + e.message);
  process.exit(1);
});
