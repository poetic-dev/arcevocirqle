#!/usr/bin/env node
// check-content.mjs — the content gate for this repo.
//
// Fails (exit 1) when:
//   * a content page has missing/invalid frontmatter (title, section, order,
//     summary, status in draft|reviewed|planned, visibility in draft|public)
//   * an internal Markdown link does not resolve
//   * a derived-fact pattern appears in authored text
//   * an ADR has a numbering gap or a missing required section
//   * a generated public.products block is out of sync
//
// Composes the vendored tools/lib/* modules; it does not re-implement them.

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "../vendor/fusorb/tools/lib/frontmatter.mjs";
import { scanDerivedFacts } from "../vendor/fusorb/tools/lib/derived-facts.mjs";
import { findUnresolvedLinks } from "../vendor/fusorb/tools/lib/links.mjs";
import { walkFiles } from "../vendor/fusorb/tools/lib/fs-walk.mjs";
import { syncPublicDocs } from "./gen-public-docs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const DECISIONS = path.join(ROOT, "decisions");

const VALID_STATUS = new Set(["draft", "reviewed", "planned"]);
const VALID_VISIBILITY = new Set(["draft", "public"]);
const REQUIRED_FM = ["title", "section", "order", "summary", "status", "visibility"];
const ADR_SECTIONS = ["Context", "Decision", "Alternatives", "Consequences", "Verification"];

let failures = 0;
function fail(msg) {
  failures += 1;
  console.error("check:content: " + msg);
}

async function main() {
  const contentFiles = (await walkFiles(CONTENT)).filter((f) => f.endsWith(".md"));

  for (const rel of contentFiles) {
    const full = path.join(CONTENT, rel);
    const text = await readFile(full, "utf8");
    const { data, hasFrontmatter } = parseFrontmatter(text);
    if (!hasFrontmatter) {
      fail(`${rel}: missing frontmatter`);
      continue;
    }
    for (const k of REQUIRED_FM) {
      if (data[k] === undefined || data[k] === "") fail(`${rel}: missing frontmatter field "${k}"`);
    }
    if (data.status !== undefined && !VALID_STATUS.has(data.status)) {
      fail(`${rel}: invalid status "${data.status}" (draft|reviewed|planned)`);
    }
    if (data.visibility !== undefined && !VALID_VISIBILITY.has(data.visibility)) {
      fail(`${rel}: invalid visibility "${data.visibility}" (draft|public)`);
    }
    if (typeof data.order !== "number") fail(`${rel}: frontmatter "order" must be a number`);

    for (const m of scanDerivedFacts(text)) {
      fail(`${rel}:${m.line}: derived fact "${m.match}" in authored text`);
    }

    for (const u of await findUnresolvedLinks(text, full)) {
      fail(`${rel}: unresolved internal link "${u}"`);
    }
  }

  let adrFiles = [];
  try {
    adrFiles = (await readdir(DECISIONS)).filter((f) => f.endsWith(".md")).sort();
  } catch {
    fail("decisions/ directory is missing (expected ADRs)");
  }

  const numbered = [];
  for (const f of adrFiles) {
    const full = path.join(DECISIONS, f);
    const text = await readFile(full, "utf8");
    const m = f.match(/^(\d{4})-/);
    if (m) numbered.push({ n: Number(m[1]), f, text });
  }
  const real = numbered.filter((x) => x.n > 0).sort((a, b) => a.n - b.n);
  for (let i = 0; i < real.length; i += 1) {
    if (real[i].n !== i + 1) {
      fail(`decisions/: ADR numbering gap — expected ${String(i + 1).padStart(4, "0")}, saw ${String(real[i].n).padStart(4, "0")}`);
    }
  }
  for (const { f, text } of real) {
    for (const sec of ADR_SECTIONS) {
      const re = new RegExp(`^#{2,3}\\s+${sec}\\b`, "m");
      if (!re.test(text)) fail(`decisions/${f}: missing section "${sec}"`);
    }
    const { data, hasFrontmatter } = parseFrontmatter(text);
    if (!hasFrontmatter) fail(`decisions/${f}: missing frontmatter`);
    else {
      if (data.status === undefined) fail(`decisions/${f}: missing frontmatter "status"`);
      if (data.date === undefined) fail(`decisions/${f}: missing frontmatter "date"`);
      if (data.governs === undefined) fail(`decisions/${f}: missing frontmatter "governs"`);
    }
  }

  const drift = await syncPublicDocs({ check: true });
  if (drift) fail("generated public.products blocks are out of sync; run pnpm gen:docs");

  if (failures > 0) {
    console.error(`check:content: ${failures} problem(s) found`);
    process.exit(1);
  }
  console.log("check:content: OK");
}

main().catch((e) => {
  console.error("check:content: " + e.message);
  process.exit(1);
});
