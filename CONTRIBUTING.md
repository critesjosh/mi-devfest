# Pull request guide

Every change to this repository goes through a pull request. Nobody pushes to `main`. This guide applies to people and to every coding agent (Claude, Codex, Gemini and others). GitHub fills in a new PR's description from [`.github/pull_request_template.md`](.github/pull_request_template.md); this guide explains each part.

Read [`AGENTS.md`](AGENTS.md) first. UI work also follows [`shiftproof/DESIGN.md`](shiftproof/DESIGN.md), and any text a person sees follows [`shiftproof/COPY.md`](shiftproof/COPY.md).

## 1. Before you open it

- Branch from an up-to-date `main`: `git pull`, then `git switch -c <your-name>/<what>`, for example `alex/ask-phone-view`. An agent working for you uses your name plus its own, for example `alex-codex/ask-phone-view`.
- Keep the PR to **one workstream and the files you own** (see issue #5). Two small PRs merge faster than one big one.
- Run `npm run build` in `shiftproof/`. It must pass.
- Never include `.env.local`, keys, project IDs or tokens, in the code, the description or a screenshot.

## 2. Title

Say what the PR does, in the imperative, in sentence case, for example "Move the Ask view onto design tokens" or "Add acceptance test for wrong-order approval". Don't use prefixes like `feat:`. Don't end it with a full stop.

## 3. Description

Use every section of the template. Write "None" or "Not applicable" rather than deleting a section, so a reviewer can tell you considered it.

| Section | What to write |
|---|---|
| **What and why** | Two to five lines. The change and the reason for it. Link the issue (`Part of #5`). |
| **Workstream and files** | Your workstream, and confirmation that you changed only files you own. Name any file you changed outside that, and who agreed to it. |
| **How I checked it** | The commands you ran and what happened (`npm run build` passed). For behaviour, the steps you clicked through. Say whether you used **live Granite** or **sample output** (`SHIFTPROOF_OFFLINE=1`). |
| **Visual proof** | Required for any change a person can see. See section 4. |
| **Trust rules** | Whether the PR touches quote checks, review order, approved-cards-only Ask, citation filtering, or the sample-output label. If it does, explain how you checked they still hold. |
| **Copy changes** | Every changed user-facing string: old text, new text, and where it appears. This includes API error messages and anything that changes what Granite says (`lib/prompts.ts`). A PR with copy changes waits for Daniel's approval. |
| **Models used** | Which AI model wrote which part, with tier and effort if you know it (for example "Codex GPT-6.1 Sol, medium: `app/page.tsx`"). Write "Human only" if no model was used. This feeds the hackathon's AI-tool disclosure. |
| **Open questions** | Anything you're unsure about, or want a person to decide. |

## 4. Visual proof for UI and UX changes

If a person could see the difference, show it. Reviewers can't approve a UI change from the diff alone. Visual proof means screenshots, a short video, or both.

**What to capture**

| Change | Proof |
|---|---|
| Static look: colour, type, spacing, a component | Screenshots **before and after**, at **375px** (phone) and **1280px** (desktop) wide. |
| A state: busy, empty, error, disabled, unverified, out of scope, sample banner | A screenshot of **each state you touched**. |
| A flow or interaction: tabs, Compare to Review to Ask, reset, approvals, focus order | A **short video or GIF**, 30 seconds at most, with no sound needed. |
| Theme-related styles | Light **and** dark. |
| Keyboard or focus changes | A video, or screenshots that show the focus ring. |

**How to capture**

- Use the dev server (`npm run dev`) or the component previews (`python3 -m http.server 4100 -d shiftproof/design`, then http://localhost:4100/preview.html).
- In the browser's device toolbar, set the width to 375px and 1280px. Crop to the part that changed, but keep enough around it to show where it sits.
- On macOS: `Cmd+Shift+4` for a screenshot, `Cmd+Shift+5` for a screen recording. Coding agents can use their browser or Playwright tools.
- Drag the images or video into the PR description on GitHub. **Don't commit screenshots to the repository.**
- Put each pair side by side with a caption, for example "Ask, 375px: before | after".

**Rules for what's on screen**

- Show whether the output is live or sample. Never crop the sample banner out of a screenshot of sample output, and never present sample output as live.
- Show no secrets, no IBM Cloud console pages and no personal data. Use the fictional WI-114 fixtures.
- If you or your agent can't capture visuals, say so under **Visual proof** and write "Visual proof needed". The PR waits until someone adds it.

## 5. Review and merge

- Open the PR as a **draft** while you're still working. Mark it **ready for review** when it's done. You don't need to request a review.
- Daniel's orchestrator session picks up every PR that is ready for review, and every new push to it. The steps are in [`AGENTS.md`](AGENTS.md#pull-requests):
  - a read-only review by a model from a different family than the one that wrote the code;
  - a build, run by the orchestrator;
  - fixes on your branch;
  - another review, repeated until it finds nothing.
- Fixes may land on your branch as new commits. Pull before you push again.
- A clean PR is squash-merged and its branch deleted. PRs with copy changes, or UI PRs without visual proof, wait.
- After **5:00 PM ET** (feature freeze), only bug fixes are merged.
- No review within 15 minutes? Comment on issue #5 and mention Daniel.
