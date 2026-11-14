# ShiftProof handoff (orchestrator)

Last updated: 2026-11-14, by Claude Opus 5.5 (orchestrator). The Nov 13 notes are condensed under "History".

## Where things stand

- **Project:** ShiftProof, Michigan DevFest Hackathon 2026, Manufacturing focus. Proposal and acceptance criteria: GitHub issue #1 in `critesjosh/mi-devfest`. Workstreams and owners: issue #5.
- **Status:** the MVP was submitted on Nov 13 (`docs/SUBMISSION.md`, video in `docs/VIDEO.md`, deck in `docs/pitch/`). Judging and presentations are on Nov 15. The IBM portal says final submissions close Sun Nov 15, 2:00 PM ET.
- **Live app:** IBM Code Engine (ca-tor, one instance), on Granite (`ibm/granite-4-h-small`, us-south). The URL is shared privately and stays out of the repo. Daniel's orchestrator session deploys every merge to `main`. Each deploy runs a live golden test that leaves a card behind, so the demo is reset to empty afterwards. As of PR #31 it runs `33ed74a`, reset to empty.
- **Tests:** `npm run acceptance` (PR #29, extended in #31) checks issue #1's criteria end to end. The last live run passed 39 of 39 with every model step live, in about 13 s. It resets the demo when it finishes.
- **Hardening on Nov 14 (PR #31):** GPT-6 Astra proposed the review and Claude Fable 5.2 verified and re-scoped it. Cards now record whether their draft was live or sample. Confirm and Approve are disabled while a card has unsaved edits. Ask shows the cited card's own veteran quote, never the model's string. Drafting no longer overwrites a reset or edit made during the model call. Ask refuses if a card changed mid-answer. watsonx.ai calls time out after 15 s for sign-in and 60 s for chat, then fall back to labelled sample output.
- **UI (PRs #26 to #28):** each step's content and Compare's source panels fit above the fold on a laptop. The offline sample cards match their finding.
- **Registry:** IBM Container Registry free tier, 512 MB. Old images were leaving untagged copies that still counted against the quota, which blocked a deploy on Nov 14. The deploy script now prunes them, and usage is about 126 MB.
- **Demo tip:** in Review, give the cooling follow-up a plain answer, for example "About ten minutes on the granite plate, until it feels the same temperature as the plate. I never touch the offset off a warm part."

## Known gaps (not fixed yet)

- **Answer text isn't checked against the card.** Ask requires an approved card citation and shows that card's veteran quote, but the model's answer sentences are not verified. Fable rates this the largest remaining hole. Fix: build the answer from the cited card's steps and escalation lines.
- **Numeric fragments pass quote verification.** `quoteAppears("0.002", "... 10.002 in.")` returns true (`lib/verify.ts`), and so do word fragments ("chip" in "chips"). Fix: boundary checks for each ellipsis part. Deferred because every Compare depends on this verifier.
- **Demo-only identity and storage.** Anyone can call reset and status changes. Approver names are hard-coded. State is one JSON file inside the container. These are known MVP limits.
- **Narrow acceptance suite.** It drafts and approves only the cooling card, and checks answers with keyword patterns.

## Decisions already made (don't reopen)

1. Build ShiftProof, not ScopeCheck, BenchCoach or ReuseSpec.
2. Use a concrete demo scenario instead of the abstract inspection-escalation one in #1. WI-114 is a fictional bracket job. The veteran notes add three things the instruction leaves out: seat and shim the part, let the first part cool before measuring (a warm 4 in aluminum part reads about 0.002 in long), and measure the pocket in two places.
3. The demo is three clicks: **Compare** (Granite flags gaps and quotes both sources), **Review** (the veteran answers the follow-up, a card is drafted, the veteran confirms, quality approves), **Ask** (the apprentice gets an answer from approved cards only, with citations, and off-topic questions are refused).
4. App code, not prompts, enforces the trust rules:
   - quotes are verified against the sources (`lib/verify.ts`)
   - review status only moves forward, `candidate -> expert_confirmed -> approved`, and an edit sends it back to `candidate` (`lib/store.ts`)
   - Ask uses only approved cards for WI-114 Rev C, and makes no model call when none exist
   - cited card IDs and quotes are filtered on the server
5. The offline fallback (`SHIFTPROOF_OFFLINE=1`) shows recorded sample output, and every screen labels it. Never present it as live.
6. Deferred until after the MVP: audio, Docling, watsonx.governance, paired test cases, blocking reuse when the procedure revision changes, real sign-in.

## File map

| Path | What it is |
|---|---|
| `data/fixtures/*.md` | Fictional work instruction, veteran notes, expected results (golden path) |
| `lib/prompts.ts` | Granite system and user prompts (compare, draft, ask) |
| `lib/watsonx.ts` | IAM token, `/ml/v1/text/chat`, JSON extraction with one retry |
| `lib/verify.ts`, `lib/store.ts` | Quote verification, review states, JSON-file store in `.data/` |
| `lib/offline.ts` | Labelled sample output |
| `app/api/*` | `state`, `compare`, `cards`, `cards/[id]`, `cards/[id]/status`, `ask`, `reset` |
| `app/page.tsx` | Single-page UI with three tabs and a demo role switcher |
| `lib/reply.ts` | Plain-text Ask reply for watsonx Orchestrate |
| `scripts/smoke-watsonx.ts` | `npm run smoke`: checks IBM sign-in and the model ID |
| `scripts/acceptance.ts` | `npm run acceptance`: issue #1 acceptance checks against a running app (resets it) |

## Get the IBM credentials (for `.env.local`)

Josh (team lead) requests the team IBM Cloud account on the hackathon portal. Everyone then accepts the "Join now" email from IBM Cloud.

1. **Switch to the hackathon account.** Open https://cloud.ibm.com and pick the hackathon account in the account switcher at the top right.
2. **Find the region, for `WATSONX_URL`.** Open https://cloud.ibm.com/resources, expand **AI / Machine Learning**, and note the location of the **watsonx.ai Runtime** service (formerly Watson Machine Learning).
   | Location | `WATSONX_URL` |
   |---|---|
   | Dallas (us-south) | `https://us-south.ml.cloud.ibm.com` |
   | Frankfurt (eu-de) | `https://eu-de.ml.cloud.ibm.com` |
   | London (eu-gb) | `https://eu-gb.ml.cloud.ibm.com` |
   | Tokyo (jp-tok) | `https://jp-tok.ml.cloud.ibm.com` |
   | Sydney (au-syd) | `https://au-syd.ml.cloud.ibm.com` |
   | Toronto (ca-tor) | `https://ca-tor.ml.cloud.ibm.com` |
3. **Get `WATSONX_PROJECT_ID`.** Open watsonx.ai at https://dataplatform.cloud.ibm.com/projects/?context=wx (for Frankfurt use `eu-de.dataplatform.cloud.ibm.com`, for London `eu-gb.`, for Tokyo `jp-tok.`, and so on). Open the team's project, or create one. Go to **Manage → General** and copy the **Project ID**.
   - In the same project, open **Manage → Services & integrations** and confirm that the watsonx.ai Runtime service is associated. If it isn't, click **Associate service** and add it, or every model call fails.
   - Shortcut: many accounts have a **Developer access** page (https://dataplatform.cloud.ibm.com/developer-access) that shows the project ID and URL and lets you create a key in one place.
4. **Get `WATSONX_API_KEY`.** Open https://cloud.ibm.com/iam/apikeys while you're still in the hackathon account, click **Create**, name the key `shiftproof-dev`, and copy it straight away. IBM shows it only once. Each teammate can create their own key.
5. Put the values in `shiftproof/.env.local`, never in git and never in chat. Then run `npm run smoke`.
   - If the model isn't found, open `<WATSONX_URL>/ml/v1/foundation_model_specs?version=2024-10-08&filters=function_text_chat` to list the available chat models, or check Prompt Lab. Then set `WATSONX_MODEL_ID` to a Granite chat model.

The hackathon accounts close after the event, so export anything you need first.

## Team and workstreams

Five workstreams, four people (Jason is invited but hasn't accepted yet). Daniel carries the heavy implementation and the review loops because he has the most AI subscriptions and tokens.

| # | Workstream | Owner | Deliverable by 4:30 PM |
|---|---|---|---|
| 1 | Product, IBM account, submission | **Josh** (team lead) | IBM Cloud account and keys shared privately. Workbook slides done. Submission (problem and solution statements, tool list, repo URL, video URL) by 5:45 PM |
| 2 | Live Granite integration and prompt tuning | **Daniel** (orchestrator) | `npm run smoke` passes. Live compare, draft and ask match `expected.md`. Prompts tuned |
| 3 | App hardening and acceptance tests | **Daniel** (delegated to cheaper models) | A test script covering the #1 acceptance checks (quotes verified, wrong-order approval rejected, off-topic refused, prompt injection in a source ignored) |
| 4 | UI polish and the phone apprentice view | **Alex** | Clean 375px Ask view, source highlighting, a demo-ready reset flow. Human-approved copy |
| 5 | Evidence, pitch and video | **Jason** if he joins, otherwise Alex and Josh | Independent review of `expected.md` (by someone who didn't write the prompts), the 3-minute pitch, the 1-minute video by 5:30 PM, Michigan stats from the repo README |

Daniel also runs the adversarial reviews and review loops across streams 2–4.

## Model routing (Daniel's rules, short version)

Full text: `docs/MODEL_ROUTING.md`.

- **Opus:** orchestrator, final QA, release lead.
- **Fable:** high-stakes decisions and reviews only.
- **Sonnet, or Codex GPT-6.1 Sol at medium:** routine implementation.
- **Haiku, or Gemini Hydrogen low:** search, logs, summaries.
- **DeepSeek:** cheap second-opinion reviews.
- Reviews go to a **different model family** than the one that wrote the code. Reviewers are read-only and get the exact diff range. Findings come back as severity, file:line and a failing scenario, ending in APPROVE or CHANGES REQUIRED. Verify each finding before acting on it.
- **User-facing copy is written by Anthropic models only** and needs owner approval.
- Delegates don't commit. The supervisor tests and commits, and notes which model wrote what. Keep the README's AI-tool disclosure up to date.
- Always pin Codex's model and reasoning level.

## Next steps

Before judging (Nov 15):

1. Freeze `main` except for demo-breaking fixes.
2. One person runs the demo. Stage the state once, and don't run `npm run acceptance` or the golden test against the live app after that, because both reset it or add cards.
3. Keep the offline mode (`SHIFTPROOF_OFFLINE=1`, every result labelled "Sample output") and the recorded video ready as fallbacks.
4. Jason: mirror the deck's one-line limits change in Google Slides ("Scripted acceptance checks pass against live Granite, but only on one fictional fixture."), then export the PDF again.

After judging: a two-week pilot with one shop. This is Fable's order; it reworks Astra's ranking around dependencies.

1. Durable, transactional storage with version checks on writes. Everything below depends on it.
2. Real sign-in, with server-side roles for confirm, approve, edit and reset. Record real approver names.
3. Immutable history: card versions, who signed off on which version, and withdrawal.
4. Build Ask answers from the cited card's content, with structured applies-when and does-not-apply-when conditions.
5. Paired test cases per card: questions it must answer, and close ones it must refuse, run in acceptance.
6. Docling ingestion of the shop's real documents, then more than one procedure.
7. Block a card from answering when its procedure revision changes, until it is reviewed again.
8. Recruit the shop and quality lead in week 1, and run a supervised shadow pilot in week 2.

Later: numeric and word boundaries in quote verification, audio capture, watsonx.governance, and integration with the shop's document-control system.

## History

- **Nov 13:**
  - Live Granite worked end to end by about 1:30 PM, after the watsonx.ai Runtime service was associated with the project.
  - Codex fixed two trust holes: quote signs and ellipsis order, and the server-written refusal.
  - The design system (`DESIGN.md`, `design/`) and copy contract (`COPY.md`) landed, followed by the Synchro-style redesign, the logo, the video and the deck.
  - From 1:30 PM all changes went through PRs, with cross-family review.
- **Nov 14:**
  - PRs #26 to #31: sample-card matching, above-the-fold layout, the acceptance script, and the trust fixes above.

## Kickoff prompt (paste into a new Claude Code session)

Open a terminal in `/Users/daniel/Dev/REPOS/GitHub/mi-devfest`, run `claude`, and paste:

```
You are the orchestrator and release lead for ShiftProof, our Michigan DevFest 2026 hackathon project. Read AGENTS.md, shiftproof/HANDOFF.md and shiftproof/docs/MODEL_ROUTING.md first. Follow the routing rules: you (Opus) plan, orchestrate and do final QA; delegate routine work to cheaper tiers or other providers, pinning model and effort; reviews go to a different model family than the implementer; only Anthropic models write user-facing copy. Delegates don't commit. Every change goes through a PR, never a push to main.

Start from HANDOFF.md "Where things stand" and "Next steps". Don't change the decisions listed in HANDOFF.md without asking me. Never print or commit keys, project IDs or the live app URL.
```
