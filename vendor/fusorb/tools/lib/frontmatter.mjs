// frontmatter.mjs — minimal YAML-ish frontmatter parser for Markdown files.
//
// Single exported API: parseFrontmatter(text) -> { data, body, hasFrontmatter }
// Handles:
//   * `key: value`            -> string / number / boolean
//   * `key: [a, b]`           -> inline array of strings
//   * `key:\n  - a\n  - b`    -> block array of strings
//
// Zero dependencies. Windows + Linux safe (splits on \r?\n). This module is
// vendored into other repos unchanged, so it must stay free of repo-specific
// constants.

export function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (!lines.length || lines[0].trim() !== "---") {
    return { data: {}, body: text, hasFrontmatter: false };
  }
  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) {
    return { data: {}, body: text, hasFrontmatter: false };
  }
  const fmLines = lines.slice(1, end);
  const body = lines.slice(end + 1).join("\n");
  return { data: parseBlock(fmLines), body, hasFrontmatter: true };
}

function parseBlock(lines) {
  const data = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) {
      i += 1;
      continue;
    }
    const key = m[1];
    const rest = m[2].trim();
    if (rest === "") {
      const items = [];
      let j = i + 1;
      while (j < lines.length && /^\s+-\s+/.test(lines[j])) {
        items.push(lines[j].replace(/^\s+-\s+/, "").trim());
        j += 1;
      }
      if (items.length > 0) {
        data[key] = items;
        i = j;
        continue;
      }
      data[key] = "";
      i += 1;
      continue;
    }
    data[key] = parseValue(rest);
    i += 1;
  }
  return data;
}

function parseValue(v) {
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1);
    if (inner.trim() === "") return [];
    return inner.split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
  }
  if (v === "true") return true;
  if (v === "false") return false;
  if (v !== "" && !Number.isNaN(Number(v))) return Number(v);
  return v.replace(/^["']|["']$/g, "");
}
