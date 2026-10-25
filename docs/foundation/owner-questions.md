# Owner questions

Open questions for the owner. This repo does not decide them.

## 1. Public wording for about.md

The about page currently carries only the seed sentence. Any wording beyond it
must be owner-authored.

- Options: owner writes the full page directly; or owner provides wording and an
  agent drafts it for review.
- Recommendation: owner writes it directly; the page stays visibility: draft
  until the wording is approved.
- Blocks: publishing about.md beyond the seed sentence.

## 2. Authors and contact addresses

Who authors the community, contact and legal pages, and which contact addresses
may be published?

- Options: owner authors community and contact and legal counsel authors privacy
  and terms; or a named agent drafts them and the owner approves.
- Recommendation: owner/counsel author; no address is published until the owner
  provides one (the email domain is live, but no addresses were given).
- Blocks: community.md, contact.md, and the legal pages leaving placeholder
  state.

## 3. audience for SovGrant, Relnex, SovPort

This is answered in the Fusorb repo's owner questions; this repo only consumes
the answer from the vendored ecosystem data (currently undecided). No decision
is made here.

- Blocks: nothing here. These products stay out of public content until the
  vendored audience is public.

## 4. Hosting provider and cutover plan

Which hosting provider serves the site, and what is the cutover plan for
arcevocirqle.com.ng given the domain also carries email?

- Options: owner selects a provider and records the cutover plan; or defer and
  keep the site documentation-only.
- Recommendation: record the provider and a DNS/email-safe cutover plan before
  any site work starts.
- Blocks: the site start decision (an ADR 0004 precondition).

## 5. @arcevocirqle social handle

Whether and when the @arcevocirqle social handle is linked from the site.

- Options: link it when the owner confirms the handle; or leave it unlinked
  until then.
- Recommendation: confirm the handle first; do not link an unconfirmed handle.
- Blocks: adding a social link to the site.

## 6. The older hyphenated GitHub repo arcevo-cirqle

What to do with the older hyphenated GitHub repo arcevo-cirqle.

- Options: archive it; redirect it via its description or README to this repo;
  or leave it as-is.
- Recommendation: archive or redirect; leaving it risks splitting identity.
- Blocks: a clean public identity across GitHub.
