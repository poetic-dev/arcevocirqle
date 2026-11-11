# UI plan

Status: living plan for this repo's surface. The durable decisions live in this
repo's ADRs; the plan and the site-start checklist live here. Nothing in this
file starts the site.

- ADRs: [role and boundary](../decisions/0001-role-and-boundary.md) ·
  [consuming fusorb facts](../decisions/0002-consuming-fusorb-facts.md) ·
  [public boundary](../decisions/0003-public-boundary.md) ·
  [site platform deferred](../decisions/0004-site-platform-deferred.md) ·
  [domain and email model](../decisions/0005-domain-and-email-model.md)
- Gates: `check:sync`, `check:names`, `check:content`, `check:public-boundary`
- Source of truth for ecosystem facts: the vendored snapshot in
  `vendor/fusorb/` (see [PROVENANCE](../../vendor/fusorb/PROVENANCE.json))

## Scope and non-goals

In scope: the information architecture, the page and content model, the
publication model, the Facet dependency policy, the roadmap, and the site-start
checklist for this surface.

Out of scope: starting the site, choosing hosting, authoring copy (owner or
counsel), and the vendored data (owned by the Fusorb repo). The site itself lives
only in `site/`, which is documentation until the start decision is recorded.

## The surface

The public site at the live `arcevocirqle.com.ng`. It presents and links; it
never defines ecosystem facts. It is built only on `@fusorb/facet-*`.

## Invariants

These are owned by the linked records and hold for the life of the surface:

- Present, don't define. Every ecosystem fact comes from the vendored snapshot,
  never hand-typed (ADR 0001, ADR 0002).
- The public boundary. A page marked `visibility: public` describes only
  products whose audience is public and only hosts whose status is live
  (ADR 0003).
- Live names are untouchable. `ArcevoCirqle`, `arcevocirqle`, and
  `arcevocirqle.com.ng` are never renamed (ADR 0005, the naming ledger).
- No implied liveness. A planned domain is never shown as live (ADR 0005).
- Facet is the single UI system (the ecosystem UI invariant).

## Data flow

The vendored snapshot drives the generated views; authored content drives the
narrative pages, gated by visibility. No product repo is ever read, so internal
detail cannot reach public content.

## Information architecture

- **Home / About** — owner-authored identity and mission (currently a seed
  sentence, `visibility: draft`).
- **Ecosystem** — a generated view of public products from the vendored snapshot
  (the `public.products` block).
- **Community and Contact** — owner-authored channels and addresses only, from
  resolved facts; nothing invented.
- **Legal** — privacy and terms, owner- or counsel-authored before publish.
- **Provenance** — an optional, subtle "last synced" disclosure of the snapshot
  provenance, so "presents, don't define" is auditable in public without exposing
  internals.

## Page and content model

This is the model the gates already enforce; the plan adds no parallel schema.

- **Frontmatter:** `title`, `section`, `order` (a number), `summary`, `status` in
  `draft | reviewed | planned`, and `visibility` in `draft | public`.
- **Generated views:** blocks delimited by `<!-- BEGIN:generated public.products -->`
  and `<!-- END -->`, rendered from the vendored snapshot.
- **Page types:** index, narrative (about, community, contact), ecosystem
  (generated), and legal. A new page chooses an existing type.

Publication model: pages start `visibility: draft`. Only the owner promotes a
page to `public`. A public page whose status is `planned` fails the boundary
gate, and a public page naming a non-public product or a non-live host fails it
too.

## Facet dependency policy

- Pin to declared, registry-verified `@fusorb/facet-*` versions recorded in the
  site-start ADR; no floating or unverified majors at launch.
- Confine all Facet primitives to a thin adapter so a Facet major is a bounded
  change; keep content logic framework-agnostic.
- Add no non-Facet UI dependency. The frozen lockfile and CI make that a hard
  failure rather than a review comment.

## Cross-cutting qualities

- Accessibility and semantics — semantic HTML, keyboard and screen-reader
  support, contrast and performance budgets.
- Internationalization-ready — strings separated from layout, stable content
  keys, date and number neutrality.
- Progressive enhancement and durability — core content readable with minimal
  client dependency; provenance carried in the artifact.
- Security and trust — no secrets or personal data; the boundary and sync gates
  fail closed on drift.
- Evolution — additive schemas and migration-friendly ADRs.

## Roadmap

Each phase names its entry gate; no phase starts before the prior gate clears.

- **Phase 0 — Decide.** The owner records the site-start ADR (see the checklist
  below), closing the deferral in ADR 0004 and resolving owner inputs #1, #2, and
  #4.
- **Phase 1 — Scaffold (Facet-only).** Create the site workspace in `site/` with
  CI gates (sync, names, content, boundary, no non-Facet UI dependency, frozen
  lockfile). Wire the data loader: vendored snapshot plus authored content with
  visibility filtering.
- **Phase 2 — Systemize.** Page templates and a Facet token/type/layout baseline;
  wire the generated views so data drives the pages.
- **Phase 3 — Launch.** About, legal, and contact complete; boundary checks
  green; provenance surfaced; DNS and email-safe deploy to `arcevocirqle.com.ng`.
- **Phase 4 — Operate.** Routine `sync:fusorb` and regeneration in CI, and
  periodic Facet upgrades governed by ADRs.

## Site-start checklist (what the start ADR must record)

Per ADR 0004, the site begins only after a new ADR records:

- the required `@fusorb/facet-*` versions available on npm (the pinned baseline);
- the chosen hosting provider;
- a DNS- and email-safe cutover plan for `arcevocirqle.com.ng` (the domain also
  carries email);
- which owner-authored content is ready to publish;
- the page types and the provenance disclosure to be used.

## Open inputs

Blocking the start decision: owner inputs #1 (about wording), #2 (authors,
contact addresses, legal), and #4 (hosting provider and cutover plan). See
[owner questions](owner-questions.md). Inputs #3, #5, and #6 are answered and
consumed from the vendored snapshot.
