---
status: Proposed
date: 2026-10-24
governs: [arcevocirqle]
---

# 2. Consuming Fusorb facts by vendored snapshot

## Context

The public layer needs the decided facts (audience, role, domains) that the
Fusorb repo publishes, without copying them by hand and without reading product
repos.

## Decision

This repo consumes a vendored snapshot of the Fusorb repo's ecosystem.json,
naming-ledger.json, and the naming-check tool with its lib modules. The snapshot
carries provenance: the source commit hash, the sync time, and a SHA-256 for
each file. sync-fusorb.mjs writes and verifies it; check:sync runs offline in CI.

## Alternatives

- Git submodule — rejected: heavy and poor Windows ergonomics.
- Published npm artifact — rejected: premature; nothing is published for this yet.
- Fetching at build time — rejected: couples builds to the network and breaks
  reproducibility.
- Manual copy — rejected: drift.

## Consequences

Staleness is bounded by check:sync --from when the sibling repo is present. The
long-term replacement is a published artifact from the Fusorb repo, to be
decided later; the vendored layout is chosen so that swap is mechanical.

## Verification

check:sync fails if a vendored file's hash differs from provenance, an unlisted
file appears under vendor/fusorb/, or the vendored ecosystem data lacks the
fields this repo needs.
