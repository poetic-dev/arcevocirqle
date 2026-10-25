---
status: Proposed
date: 2026-10-24
governs: [arcevocirqle]
---

# 1. Role and boundary

## Context

The Fusorb ecosystem has a canonical architecture layer that owns decided
facts. It also needs a public-facing layer that presents the ecosystem without
leaking internal detail.

## Decision

This repo is the public-facing layer. It presents and links; it does not define
ecosystem facts. Every fact it shows comes from a vendored snapshot of the
Fusorb repo's ecosystem data, never hand-typed into authored content.

## Alternatives

- Author ecosystem facts directly here — rejected: two sources of truth and
  drift.
- Read product repos to assemble public content — rejected: internal detail
  would leak into public content and the boundary would be unenforceable.

## Consequences

Public content can only drift from truth if the vendored snapshot drifts, which
check:sync detects. A new fact must be decided in the Fusorb repo first.

## Verification

check:content and check:public-boundary keep this repo presenting rather than
defining.
