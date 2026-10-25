// links.mjs — internal link resolver for Markdown files.
//
// Single exported APIs:
//   extractLinkTargets(text)            -> [{ target, line }]
//   findUnresolvedLinks(text, fileAbs)  -> Promise<string[]> (unresolved targets)
//
// External links (http/https/mailto), pure anchors (#...), and non-.md targets
// are ignored. Relative targets are resolved against the containing file's
// directory. Vendored unchanged; no repo-specific constants.

import { stat } from "node:fs/promises";
import path from "node:path";

const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;

export function extractLinkTargets(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    LINK_RE.lastIndex = 0;
    let m;
    while ((m = LINK_RE.exec(lines[i])) !== null) {
      out.push({ target: m[1].trim(), line: i + 1 });
    }
  }
  return out;
}

function isExternal(t) {
  return /^(https?:|mailto:|#)/i.test(t);
}

export async function findUnresolvedLinks(text, fileAbsPath) {
  const dir = path.dirname(fileAbsPath);
  const unresolved = [];
  for (const { target } of extractLinkTargets(text)) {
    if (isExternal(target)) continue;
    if (!target.endsWith(".md") && !target.endsWith(".markdown")) continue;
    const resolved = path.resolve(dir, target.split("#")[0]);
    try {
      const s = await stat(resolved);
      if (!s.isFile()) unresolved.push(target);
    } catch {
      unresolved.push(target);
    }
  }
  return unresolved;
}
