# Deviations and gate proofs

## Deviations from the target structure

None. The repository matches the target structure in the brief.

## Process note

The precondition command `node scripts/check-legacy-names.mjs --root .` is
abbreviated: the tool requires `--ledger <file>`. The FUSORB repo's own
check:names supplies `--ledger ecosystem/naming-ledger.json` plus allowlists for
its own files. The equivalent check passes there.

## Gate proofs

### check:public-boundary and check:names

A temporary page was added at content/proof-test.md with visibility: public and
a body naming an internal product (Intel), an undecided product (SovGrant), a
legacy name (ArcWallet), a planned host (fusorb.com), and a retired org
(ArcevoDev).

- check:public-boundary failed (exit 1) with 5 problems: non-public product
  SovGrant, non-public product ArcWallet, non-public product Intel, non-live
  host fusorb.com, and retired org ArcevoDev.
- check:names failed (exit 1) with 2 renamed tokens: ArcWallet and ArcevoDev.

The page was then deleted, and both gates returned to OK.

### check:sync

A byte was appended to vendor/fusorb/ecosystem.json.

- check:sync failed (exit 1) with "vendored file hash mismatch: ecosystem.json".
- After restoring the original bytes, check:sync returned OK (exit 0).

### Live-name non-trigger

check:names passes (self-test passed) while ArcevoCirqle, arcevocirqle, and
arcevocirqle.com.ng appear in content and docs, and its built-in self-test
confirms no renamed or pending pattern matches the live examples (including
contact@arcevocirqle.com.ng).
