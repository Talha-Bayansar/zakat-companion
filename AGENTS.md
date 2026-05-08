## Agent skills

### Issue tracker

Work items for this repo are tracked in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single shared `CONTEXT.md` at the repo root, plus `docs/adr/` for architectural decisions. See `docs/agents/domain.md`.

Before making implementation changes, also read `docs/architecture.md` and the canonical ADRs for feature structure and UI conventions:

- `docs/adr/0002-feature-first-folder-structure.md`
- `docs/adr/0003-ui-patterns-for-forms-loading-empty-and-destructive-actions.md`

Treat these as required context, not background reading.

Any new client-facing text must be added to the Paraglide message catalog first. That includes labels, helper text, validation copy, errors, loading states, empty states, fallback names, and any other UI-visible wording.

Server errors that can reach the client are part of client-facing text. Translate those messages too, instead of hardcoding English strings in server functions or service layers.
