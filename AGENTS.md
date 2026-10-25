# AGENTS.md

## Purpose

This repo is the public-facing layer of the ArcevoCirqle ecosystem: it presents
and links, and never defines ecosystem facts.

## The presents-don't-define law

Every ecosystem fact shown in content/ comes from the vendored snapshot in
vendor/fusorb/. No hand-typed ecosystem fact belongs in authored text. A derived
fact (a measurement or a version) is owned by its owning repo, never this one.

## Boundaries

- Write only inside THIS repo.
- Read from the FUSORB repo (the sibling). Never open or read product repos.
- Never edit anything under vendor/fusorb/ by hand. It is written by sync:fusorb
  and verified by check:sync.

## Workflow

- Refresh the snapshot with `pnpm sync:fusorb -- --from <path-to-fusorb>`.
- Always run `pnpm check:all` before finishing.
- Never promote a page from visibility: draft to public. Only the owner does that.
- Add no UI dependencies. The future site is built only on @fusorb/facet-*.

## Live names are untouchable

ArcevoCirqle, arcevocirqle, arcevocirqle.com.ng, and email addresses on that
domain are live. Never rename or "fix" them. The naming ledger's live class
protects them; honor it.

## Notes

- Keep .agent/output.txt (gitignored) updated with progress and evidence.
