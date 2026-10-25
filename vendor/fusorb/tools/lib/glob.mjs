// glob.mjs — minimal glob → RegExp conversion for path allowlists.
//
// Single exported API: globToRegExp(pattern) -> RegExp
// Supports `*` (matches within one path segment), `**` (matches across any
// depth), `?` (single non-slash char), and `{a,b}` alternation.
// Paths are matched with `/` separators (POSIX style).
//
// Zero dependencies. Vendored unchanged into other repos; no repo-specific
// constants.

export function globToRegExp(pattern) {
  let re = "^";
  let i = 0;
  while (i < pattern.length) {
    const c = pattern[i];
    if (c === "*") {
      if (pattern[i + 1] === "*") {
        if (pattern[i + 2] === "/") {
          re += "(?:.*/)?";
          i += 3;
        } else {
          re += ".*";
          i += 2;
        }
      } else {
        re += "[^/]*";
        i += 1;
      }
    } else if (c === "?") {
      re += "[^/]";
      i += 1;
    } else if (c === "{") {
      const close = pattern.indexOf("}", i);
      if (close !== -1) {
        const alts = pattern.slice(i + 1, close).split(",").map(escapeRegExp);
        re += "(?:" + alts.join("|") + ")";
        i = close + 1;
      } else {
        re += escapeRegExp(c);
        i += 1;
      }
    } else {
      re += escapeRegExp(c);
      i += 1;
    }
  }
  re += "$";
  return new RegExp(re);
}

export function escapeRegExp(s) {
  return s.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}
