# Instructions for coding agents

This file is for every agent and model provider working in this repository: Claude Code, Codex, Gemini CLI, Cursor, Copilot, DeepSeek and others. `CLAUDE.md` and `GEMINI.md` point here.

The product is ShiftProof, in `shiftproof/`. Start with `shiftproof/README.md`. The orchestrator's state and decisions are in `shiftproof/HANDOFF.md`.

## Before you change anything

| If you are changing | Read first, and follow it |
|---|---|
| Any UI: layout, colour, type, spacing, components | `shiftproof/DESIGN.md` and `shiftproof/design/` |
| Any text a person sees: UI strings, API error messages, prompts in `lib/prompts.ts` | `shiftproof/COPY.md` |
| Opening a pull request | `CONTRIBUTING.md` |
| Which model does what, reviews, commits | `shiftproof/docs/MODEL_ROUTING.md` |
| Product decisions | `shiftproof/HANDOFF.md`, "Decisions already made". Don't reopen them without the owner. |

## Rules

1. **Design.** Use the tokens (`var(--dykem)`, `var(--space-4)`, ...) and the `sp-*` classes from `shiftproof/design/`. Never write a hex colour, font name or pixel size in a component. If a token is missing, add it to `design/tokens.json`, run `npm run tokens`, and document it in `DESIGN.md` in the same change.
2. **Copy.** Only Anthropic models (Claude) and people on the team may write user-facing text. Other models must not add, reword or remove it: keep the existing string and list what you need under "Copy needed" in your summary or PR description. Every copy change lists old and new text under "Copy changes" and needs the owner's approval.
3. **Trust rules live in app code**, not prompts: quote verification (`lib/verify.ts`), review order (`lib/store.ts`), approved-cards-only Ask, and server-side citation filtering. Don't weaken them. Never present sample (offline) output as live.
4. **Secrets.** Never commit `.env.local`, API keys, project IDs or tokens, and never print their values. Only `.env.example` with empty values is tracked.
5. **Commits.** Delegated agents don't commit. The supervising session reviews, tests and commits, and notes which model wrote what in the commit message. Keep the AI-tool list in `shiftproof/README.md` current.
6. **Pull requests only. Never push to `main`.** Every change, however small, goes on a branch and through a PR (see below).

## Pull requests

1. `git pull` on `main`, then create a branch named `<your-name>/<what>`, for example `alex/ask-phone-view`.
2. Keep each PR to one workstream and the files you own (see issue #5). Push early. A draft PR is fine while you work.
3. Follow [`CONTRIBUTING.md`](CONTRIBUTING.md), the PR guide. GitHub pre-fills the description from `.github/pull_request_template.md`. Fill in every section: what and why, workstream and files, how you checked it, **visual proof** (screenshots or a short video for any UI or UX change), trust rules, copy changes, models used, and open questions.
4. Open it against `main`, and mark it **ready for review** when it is done. You don't need to request a review.
   - **Who runs the loop:** Daniel's orchestrator session (Claude Code) checks for open PRs every minute. It skips drafts, and it picks up each new PR and each new push.
   - **Review:** a model from a different family than the one that wrote the code reviews it (Codex reviews Claude's code, and Claude reviews Codex's or Gemini's). The reviewer is read-only, as `shiftproof/docs/MODEL_ROUTING.md` requires. It checks the diff against this file, `DESIGN.md`, `COPY.md` and the trust rules.
   - **Build and fixes:** the orchestrator runs `npm run build` itself, checks each finding, and fixes the real ones on the PR branch. The next push starts a new review, until the review is clean.
   - **No review after 15 minutes?** Comment on issue #5 and mention Daniel.
5. A clean PR is squash-merged and its branch deleted. A PR with copy changes waits for Daniel's approval, and a UI PR waits for visual proof, even when the review finds nothing.
6. After 5:00 PM (feature freeze), only bug-fix PRs are merged.

## Check your work

```bash
cd shiftproof
npm run build     # type-checks and builds
npm run dev       # http://localhost:3000; set SHIFTPROOF_OFFLINE=1 if you have no IBM key
```

Check UI changes at 375px and 1280px wide, against the component previews (`python3 -m http.server 4100 -d shiftproof/design`, then http://localhost:4100/preview.html).
