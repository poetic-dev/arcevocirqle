// derived-facts.mjs — detector for derived facts in authored prose.
//
// A "derived fact" is a number next to a counted noun (components, packages,
// tests, routes, presets, icons, effects, repos, ...) or a semver string.
// Measurements are owned elsewhere (the owning repo, the Facet registry, Intel)
// and must never be hand-typed into this repo's authored text.
//
// Single exported API: scanDerivedFacts(text) -> [{ line, match, text }]
// Skips fenced code blocks (``` / ~~~) and <!-- BEGIN:evidence --> ...
// <!-- END:evidence --> regions. Vendored unchanged; no repo-specific constants.

const NOUNS =
  "components?|packages?|tests?|routes?|presets?|icons?|effects?|repos?|files?|projects?|" +
  "workspaces?|models?|entities?|relationships?|layers?|modules?|domains?|permissions?|" +
  "flows?|services?|repositories?|templates?";

const SEMVER_RE = /\b\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?\b/g;
const NUM_NOUN_RE = new RegExp(`\\b(\\d[\\d,]*(?:\\.\\d+)?)\\s+(${NOUNS})\\b`, "gi");
const NOUN_NUM_RE = new RegExp(`\\b(${NOUNS})\\s*[:,(]\\s*(\\d[\\d,]*(?:\\.\\d+)?)\\b`, "gi");

export function scanDerivedFacts(text) {
  const lines = text.split(/\r?\n/);
  const matches = [];
  let inFence = false;
  let inEvidence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (line.includes("<!-- BEGIN:evidence -->")) {
      inEvidence = true;
      continue;
    }
    if (line.includes("<!-- END:evidence -->")) {
      inEvidence = false;
      continue;
    }
    if (inFence || inEvidence) continue;
    for (const re of [SEMVER_RE, NUM_NOUN_RE, NOUN_NUM_RE]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        matches.push({ line: i + 1, match: m[0], text: line.trim() });
      }
    }
  }
  return matches;
}
