# Episodes

Architectural inferences and notable session notes for this repo.

## 2026-11-10

- Synced vendored Fusorb snapshot to `3e159aa` (`vendor/fusorb/PROVENANCE.json`) so decided facts (including resolved owner answers recorded in fusorb) stay current; `pnpm check:all` passes.
- Applied agent-tool tracking policy in line with fusorb: track `.agent/episodes.md` and `.commandcode/settings.json` while keeping other local agent scratch ignored.
- Fusorb repo pushed to `origin/main` at `3e159aa`; both foundation repos remain in `poetic-dev` with no open foundation-branch divergence.