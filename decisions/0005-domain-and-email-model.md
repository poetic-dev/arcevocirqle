---
status: Proposed
date: 2026-10-24
governs: [arcevocirqle]
---

# 5. Domain and email model

## Context

The public layer needs a domain model that distinguishes live from planned, and
it must not make DNS or email changes.

## Decision

arcevocirqle.com.ng is live for both the site and email. fusorb.com and its
subdomains are planned. No domain is claimed before it is live. No DNS or email
changes are made from this repo.

## Alternatives

- Present planned domains as live — rejected: misleading to the public.
- Take DNS or email action from this repo — rejected: out of scope and risky for
  a domain that also carries email.

## Consequences

Public content may reference only the live domain. Planned domains remain plans
until the owner acts on them.

## Verification

check:public-boundary fails if a planned host appears on a public page.
check:names protects the live names from being renamed.
