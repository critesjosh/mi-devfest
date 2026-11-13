# ShiftProof handoff (orchestrator)

Last updated: 2026-11-13, about 12:30 PM ET. Written by Claude Opus 5.5 so a fresh Claude Code session can take over as orchestrator.

## Where things stand

- **Project:** ShiftProof, Michigan DevFest Hackathon 2026, Manufacturing focus. Proposal and constraints: GitHub issue #1 in `critesjosh/mi-devfest`. Alternatives #2–4 were considered and not chosen.
- **Deadlines:** MVP demo today. Submit by 5:45 PM ET (hard close 6:00 PM), presentations 6:30 PM. The IBM portal says final submissions close Sun Nov 15, 2:00 PM ET. Treat today as the real deadline until an organizer says otherwise.
- **Checkpoints:** MVP working 4:30 PM, feature freeze 5:00 PM, 1-minute video uploaded 5:30 PM.
- **Code:** `shiftproof/` (Next.js 15 + TypeScript). Builds and type-checks. The full golden path passes in a browser in offline mode at 1280px and 375px wide.
- **Update, about 1:30 PM:** live Granite works end to end in us-south with `ibm/granite-4-h-small`. The Runtime service (`watsonx-Hackathon WML`) was associated with the project through the API. Prompts were tuned, and Compare, Review and Ask match `expected.md` across repeated live runs. Codex review (GPT-6.1 Sol) found two trust holes, both fixed and re-approved: quote verification ignored +/- signs and ellipsis order, and an injected Ask question could show model text without an approved citation. The server now writes the refusal itself. Next: step 4, the acceptance test script.
- **Demo tip:** in Review, give the cooling follow-up a plain answer, for example "About ten minutes on the granite plate, until it feels the same temperature as the plate. I never touch the offset off a warm part." An answer about taking two readings confuses Granite's Ask answer.
- **Git:** the files were copied into the local folder but **not committed**. The local clone was one commit behind `origin/main`, so run `git pull` before you commit. Cloud Claude sessions can't push to this repo because the Claude GitHub App isn't installed on it.

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
| `lib/offline.ts` | Labeled sample output |
| `app/api/*` | `state`, `compare`, `cards`, `cards/[id]`, `cards/[id]/status`, `ask`, `reset` |
| `app/page.tsx` | Single-page UI with three tabs and a demo role switcher |
| `scripts/smoke-watsonx.ts` | `npm run smoke`: checks IBM sign-in and the model ID |

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

## Next steps, in order

1. Get the keys, run `npm run smoke`, and set `WATSONX_MODEL_ID`.
2. Run the golden path live with `npm run dev`. Compare the output to `data/fixtures/expected.md`, and tune `lib/prompts.ts` until compare finds the 3 gaps without flagging Step 3, and the off-topic ask is refused.
3. Have a model from a different family review the diff adversarially: prompt injection in a source, made-up quotes, skipping a review step, citations leaking from unapproved cards.
4. Write the acceptance test script (stream 3).
5. 4:30 PM: MVP freeze check. 5:00 PM: feature freeze. Record the video. Submit at 5:45 PM.
6. After today: `git pull`, commit, push. Update the README's AI-tool list.

## Kickoff prompt (paste into a new Claude Code session)

Open a terminal in `/Users/daniel/Dev/REPOS/GitHub/mi-devfest`, run `claude` (add `--dangerously-skip-permissions` if you want no prompts), and paste:

```
You are the orchestrator and release lead for ShiftProof, our Michigan DevFest 2026 hackathon project. Read shiftproof/HANDOFF.md and shiftproof/docs/MODEL_ROUTING.md first, then shiftproof/data/fixtures/expected.md. Follow the routing rules: you (Opus) plan, orchestrate and do final QA; delegate routine implementation, search and reviews to cheaper tiers or other providers (Codex, Gemini, DeepSeek) where available, pinning model and effort; reviews go to a different model family than the implementer; only Anthropic models write user-facing copy. Delegates don't commit; you review, test, and commit with the model noted.

Deadline: submit by 5:45 PM ET today. MVP must work end to end by 4:30 PM; feature freeze 5:00 PM.

Start with HANDOFF.md "Next steps" step 1: check that shiftproof/.env.local exists and run `npm run smoke`. If it passes, run the live golden path against expected.md and tune lib/prompts.ts. Don't change the decisions listed in HANDOFF.md without asking me. Before each step, tell me the plan in two lines and which model you're routing it to.
```
