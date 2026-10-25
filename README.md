# ArcevoCirqle

ArcevoCirqle is the public-facing ecosystem, community and identity of the
Fusorb ecosystem, operating as a Fusorb initiative.

This repository is the **presentation layer**: it presents and links to the
ecosystem's public facts. It does not define them. Every ecosystem fact shown
here comes from a vendored snapshot of the Fusorb repo's ecosystem data.

## What this repo is

- The public-facing content for the ArcevoCirqle ecosystem, community and
  identity.
- A consumer of the decided facts published by the Fusorb repo, via a vendored
  snapshot with provenance.
- A set of gates that keep public content inside the public boundary.

## What this repo is not

- It does not define ecosystem facts. Facts come from the vendored snapshot.
- It is not a site yet. The future site is built only on @fusorb/facet-* and is
  not started here.
- It does not read product repos. Internal detail stays out of public content.
- It does not contain marketing copy, legal text, testimonials, or invented
  contact details.

## Navigation

- [About](content/about.md)
- [Ecosystem](content/ecosystem/index.md)
- [Community](content/community.md)
- [Contact](content/contact.md)
- [Privacy](content/legal/privacy.md)
- [Terms](content/legal/terms.md)
- [Decision records](decisions/)
- [Foundation notes](docs/foundation/)

## Commands

- `pnpm check:all` — run every gate.
- `pnpm sync:fusorb -- --from <path>` — refresh the vendored snapshot.

## Tooling

Uses pnpm major 12 (matching the Fusorb repo) and Node 22+.
