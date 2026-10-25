// fs-walk.mjs — recursive directory walker returning POSIX-style relative paths.
//
// Single exported API: walkFiles(root, options) -> Promise<string[]>
// Returns relative paths with `/` separators (e.g. "scripts/check-x.mjs"),
// suitable for matching against glob allowlists. Skips the build/artifacts and
// VCS directories a repo never wants scanned.
//
// Zero dependencies. Vendored unchanged into other repos; no repo-specific
// constants. Options.skip is an array of RegExp (matched against basename or
// relative path) or string (exact basename or relative path).

import { readdir } from "node:fs/promises";
import path from "node:path";

const DEFAULT_SKIP = [
  /^\.git$/,
  /^node_modules$/,
  /^\.next$/,
  /^dist$/,
  /^build$/,
  /^coverage$/,
  /^\.turbo$/,
  /^\.agent$/,
  /^\.agent-cache$/,
  /^\.commandcode$/
];

export async function walkFiles(root, options = {}) {
  const skip = options.skip || DEFAULT_SKIP;
  const out = [];
  async function walk(dir, rel) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const name = entry.name;
      const childRel = rel ? `${rel}/${name}` : name;
      if (shouldSkip(name, childRel, skip)) continue;
      if (entry.isDirectory()) {
        await walk(path.join(dir, name), childRel);
      } else if (entry.isFile()) {
        out.push(childRel);
      }
    }
  }
  await walk(root, "");
  return out;
}

function shouldSkip(name, rel, skip) {
  for (const rule of skip) {
    if (rule instanceof RegExp) {
      if (rule.test(name) || rule.test(rel)) return true;
    } else if (typeof rule === "string") {
      if (name === rule || rel === rule) return true;
    }
  }
  return false;
}
