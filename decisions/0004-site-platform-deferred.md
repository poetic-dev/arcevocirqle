---
status: Proposed
date: 2026-10-24
governs: [arcevocirqle]
---

# 4. Site platform deferred

## Context

The public layer will eventually need a website. Starting it now would require
decisions that are not yet made.

## Decision

The site is Facet-only and is not started in this repo. It begins only after the
owner records a start decision as a new ADR. That ADR must address: required
@fusorb/facet-* versions available on npm, a chosen hosting provider, a
DNS/email-safe cutover plan for arcevocirqle.com.ng (the domain also carries
email), and which owner-authored content is ready.

## Alternatives

- Start the site now on a placeholder stack — rejected: any stack other than
  Facet violates the UI invariant, and Facet packaging is not yet ready.
- Start a minimal Facet shell now — rejected: hosting and cutover are undecided,
  so a site would risk presenting a planned domain as live.

## Consequences

This repo adds no UI dependency now. The site/ directory is documentation only.

## Verification

package.json declares no dependencies and CI runs pnpm install --frozen-lockfile,
so an added UI dependency would fail the frozen install. The start decision
itself is a new ADR gated by check:content.
