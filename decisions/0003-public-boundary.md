---
status: Proposed
date: 2026-10-24
governs: [arcevocirqle]
---

# 3. Public boundary and audience gating

## Context

Some products have audience internal or undecided. Public content must not name
or describe them, must not present a planned domain as live, and must not link
to retired orgs.

## Decision

A page marked visibility: public may describe only products whose audience is
public in the vendored ecosystem data. It may contain only hostnames whose
domain status is live. check:public-boundary enforces this against the vendored
ecosystem data. This repo never reads product repos, so internal detail cannot
reach public content.

## Alternatives

- Let authors mark facts public by hand — rejected: the boundary must be
  enforced against the single source, not author memory.
- Read product repos to determine audience — rejected: product repos contain
  internal detail that must stay out of public content.

## Consequences

The public boundary is mechanical rather than a convention. Promoting a page to
public is safe only after the facts it relies on are public in the source data.

## Verification

check:public-boundary fails on a public page that names a non-public product,
names a planned host, links to a retired org, or is public while planned.
