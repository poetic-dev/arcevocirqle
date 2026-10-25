#!/usr/bin/env node
// gen-public-docs.mjs — renders generated blocks in content/ from the vendored
// ecosystem snapshot.
//
// Block delimiters: <!-- BEGIN:generated public.products --> and <!-- END -->.
// Only products with audience "public" are rendered, and only name and role.
// --check mode reports drift (exit 1) without writing; plain mode writes.
//
// Zero runtime dependencies. Node 22+, ESM. Windows + Linux safe.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { walkFiles } from "../vendor/fusorb/tools/lib/fs-walk.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const ECOSYSTEM = path.join(ROOT, "vendor", "fusorb", "ecosystem.json");

const BEGIN = "<!-- BEGIN:generated public.products -->";
const END = "<!-- END -->";

export function renderPublicProducts(eco) {
  const rows = (eco.products || [])
    .filter((p) => p.audience === "public")
    .map((p) => `| ${p.name} | ${p.role} |`);
  return ["| Name | Role |", "| --- | --- |", ...rows].join("\n");
}

export async function syncPublicDocs({ check = false } = {}) {
  const eco = JSON.parse(await readFile(ECOSYSTEM, "utf8"));
  const contentFiles = (await walkFiles(CONTENT)).filter((f) => f.endsWith(".md"));
  let drift = false;

  for (const rel of contentFiles) {
    const full = path.join(CONTENT, rel);
    let text = await readFile(full, "utf8");
    const bi = text.indexOf(BEGIN);
    if (bi === -1) continue;
    const contentStart = bi + BEGIN.length;
    const ei = text.indexOf(END, contentStart);
    if (ei === -1) continue;
    const expected = `\n${renderPublicProducts(eco)}\n`;
    const current = text.slice(contentStart, ei);
    if (check) {
      if (current !== expected) {
        drift = true;
        console.error(`${rel}: generated public.products block is out of sync; run pnpm gen:docs`);
      }
    } else if (current !== expected) {
      text = text.slice(0, contentStart) + expected + text.slice(ei);
      await writeFile(full, text, "utf8");
    }
  }

  return drift;
}

async function main() {
  const check = process.argv.includes("--check");
  const drift = await syncPublicDocs({ check });
  if (check && drift) process.exit(1);
  console.log(check ? "gen-public-docs: no drift" : "gen-public-docs: done");
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((e) => {
    console.error("gen-public-docs: " + e.message);
    process.exit(1);
  });
}
