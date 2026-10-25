# CLAUDE.md

Thin pointer for agents working in this repo. See AGENTS.md for the rules.

## Structure

- content/ — authored Markdown (every page visibility: draft unless the owner
  promotes it).
- vendor/fusorb/ — vendored snapshot of the FUSORB repo (never edit by hand).
- decisions/ — ADRs (MADR, status Proposed).
- scripts/ — dependency-free gates and generators.
- docs/foundation/ — deviations.md and owner-questions.md.
- site/ — the planned web app; Facet-only; no code.

## Commands

- pnpm sync:fusorb -- --from <path> — refresh the vendored snapshot.
- pnpm gen:docs — render generated blocks.
- pnpm check:sync — verify the vendored snapshot.
- pnpm check:names — verify no renamed legacy name outside the allowlist.
- pnpm check:content — verify frontmatter, links, derived facts, ADRs, and
  generated blocks.
- pnpm check:public-boundary — verify public pages stay inside the boundary.
- pnpm check:all — run every gate.

## One rule

Present and link; never define ecosystem facts. Facts come from vendor/fusorb/.
