# ShiftProof: hackathon submission text

For Josh. Paste each field into the submission form. Submit by 5:45 PM ET (hard close 6:00 PM).

Draft by Claude Opus 5.5 from `README.md`, `HANDOFF.md`, `COPY.md`, `orchestrate/README.md`, `data/fixtures/expected.md` and `docs/video/vo-script.txt`. Every claim below is checked against those files. If the form gives a word or character limit, trim to fit and keep the trust rules.

Do not add the live app URL, API keys, project IDs or anyone's email. The app has no sign-in, and anyone with the URL can reset the demo or approve cards.

---

## Project name

ShiftProof

## Event and track

Michigan DevFest Hackathon 2026, Manufacturing track. Built on IBM watsonx.

## Tagline

*(Length limit unknown. This one is 15 words.)*

Turn what the work instruction leaves out into reviewed guidance the next shift can use.

## Problem statement

*(Length limit unknown. About 130 words.)*

A written work instruction tells you the steps. It leaves out what experienced machinists know from years at the machine. When they retire or change shifts, that knowledge leaves with them.

Our demo uses a fictional training fixture: work instruction WI-114 Rev C, a bracket job. An apprentice's first part reads 0.002 in over on the pocket. Step 7 says to adjust the tool wear offset and rerun. The veteran's notes say to wait: the first part comes off warm, a 4 in aluminum bracket about 40 degrees over shop temperature reads about two thousandths long, and chasing the offset makes every part after it short once it cools. The instruction doesn't say that.

A chat tool that answers from its general training can't close this gap. The answer has to come from the veteran's own words, checked by people who know the job.

## Solution statement

*(Length limit unknown. About 230 words. The three steps can be cut to one line each if needed.)*

ShiftProof puts the work instruction beside a veteran's account of the same job, finds what the instruction leaves out, has people review it, and gives the apprentice only approved guidance. The demo is three steps.

1. **Compare.** WI-114 sits beside the veteran's notes. IBM Granite flags what the instruction leaves out, quotes both sources, and asks the veteran a follow-up question. In the fixture it finds three gaps: seat the part and shim it if it rocks, let the first part cool before measuring, and measure the pocket in two places. It does not flag Step 3, which the veteran confirms is right. The app checks the quotes against the source text and marks any it can't find.
2. **Review.** The veteran answers the follow-up, Granite drafts a guide card, the veteran confirms it, and a quality lead approves it. Status moves candidate, expert confirmed, approved, one step at a time. Editing a card sends it back to candidate. The work instruction itself is not changed.
3. **Ask.** An apprentice asks a question in their own words, on a phone at the machine. Granite answers from approved guide cards for WI-114 Rev C only, and the answer quotes the veteran's words from the card. Asked "Should I bump the wear offset?", it says to let the part cool and re-measure first. Asked about spindle speed, which no card covers, it says: "No approved guidance covers this. Ask your lead or quality."

## How we used IBM technology

*(Length limit unknown. About 170 words.)*

- **IBM Granite on watsonx.ai** (`ibm/granite-4-h-small`, us-south). Granite finds the gaps between the work instruction and the veteran's notes, writes the follow-up questions, drafts guide cards, and answers apprentice questions from approved cards only. The app calls the watsonx.ai chat API directly (`lib/watsonx.ts`, prompts in `lib/prompts.ts`).
- **IBM watsonx Orchestrate.** The agent `shiftproof_apprentice` gives apprentices the Ask step through Orchestrate. Its one tool is a flow that calls the app's `POST /api/ask`, so the app's trust rules still apply. The flow turns off agent summarization, so the agent relays the app's reply word for word and adds no text of its own. Granite on watsonx.ai still writes the answer inside the app. We tested it on Nov 13 with an in-scope question, an out-of-scope question and a prompt-injection attempt. The last two returned the fixed refusal.
- **IBM Code Engine** (ca-tor, one instance) hosts the app from a Docker image, so Orchestrate can reach it.

## Trust rules: what makes it safe

*(Length limit unknown. About 150 words.)*

App code enforces these rules, not prompts. A model can't talk its way past them.

- **Quote verification.** The veteran's quote in every finding is checked against the veteran's notes, and the instruction quote is checked against the work instruction whenever the finding names a step (`lib/verify.ts`). A finding with a quote the app can't find is marked "quote not found in source" and cannot become a card.
- **Review order.** A card moves candidate, expert confirmed, approved, one step at a time, and the server rejects any skip (`lib/store.ts`). Editing a card sends it back to candidate.
- **Approved cards only.** Ask gives Granite only approved cards for WI-114 Rev C. With no approved card, the app makes no model call and says so. The app does not check every sentence of the answer against the card, so the answer always shows the cited card and the veteran's quote for the apprentice to check.
- **Server-side citation filtering.** The server drops cited cards that are not approved and quotes that are not in the card sources. If an answer cites no approved card, the server writes the refusal itself.
- **Sample output is always labelled.** Without an IBM key the app shows recorded sample output, and every result says "Sample output (offline), not a live model call." Live results show "Granite on watsonx.ai" and the model ID.

## What's next

*(Length limit unknown.)*

Not in the MVP, and next on the list:

- Audio capture and playback, so a veteran can talk through a job instead of typing.
- Docling ingestion of real manuals and work instructions.
- watsonx.governance for the model calls.
- Paired test cases for each approved card.
- Block reuse of a card when the work instruction revision changes.
- Scope guide cards to a specific machine as well as the work instruction revision, since a warm-part or fixturing tip can hold on one machine and not the next. This is an idea, not built yet.
- Real sign-in, so confirm and approve are tied to real people. The demo uses role switching, not sign-in.
- A real database in place of the demo's JSON file store (Cloudant or SQLite).

## AI tools used to build this

*(Copied verbatim from `shiftproof/README.md`. Re-copy it just before you submit, in case the list grew.)*

- Claude Opus 5.5 (Claude Code): architecture, fixtures, prompts, watsonx.ai client, live prompt tuning, trust-rule fixes, review and QA
- Claude Sonnet 5.5 (Claude Code subagent): API routes and UI
- Claude Opus 5.5 (Claude Code + Claude Design): design system (`DESIGN.md`, `design/`) and copy contract (`COPY.md`)
- OpenAI Codex (GPT-6.1 Sol, medium reasoning): independent read-only security review of the prompts, quote verification and Ask route
- Claude Sonnet 5.5 (Claude Code subagent): first draft of the Orchestrate tool, agent and README (`orchestrate/`)
- Claude Opus 5.5 (Claude Code): Dockerfile, Code Engine deploy, Orchestrate import and live tests
- IBM Bob: AI coding assistant used by the team during the build
- Claude Opus 5.5 (Claude Code): Synchro-style redesign (rail, overview tiles, tokens, `DESIGN.md`)
- OpenAI Codex (GPT-6.1 Terra, high reasoning): blind judge between two Synchro redesigns
- Claude Fable 5.2 (Claude Code subagent): final UI polish (spindle art, card editor layout, Ask answer focus)
- Claude Fable 5.2 (Claude Code subagents, in parallel): "traveler" craft pass on the UI, the ShiftProof logo, favicon and app icons (`design/brand/`), and the animated robot arm (`app/RobotArm.tsx`)
- OpenAI Codex (GPT-6 Astra): logo concepts; Claude Fable 5.2 (Claude Code subagent): refined them into the "milled pass" mark (`design/brand/`)
- Claude Opus 5.5 (Claude Code): demo video plan, storyboard, voiceover script and on-screen text (`docs/video/`)
- Claude Fable 5.2 (Claude Code subagent): read-only review of the video concept and storyboard
- Google Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts`, Gemini API): reads the video voiceover exactly as written
- Google Gemini 4 Argon (`gemini-4-argon`, Gemini API): checks the voiceover's wording and timing against the script
- Google Lyria 3.5 (Gemini API): calm instrumental background music for the demo video; Google Gemini 4 Hydrogen checked it has no vocals or sudden changes

## Repository

https://github.com/critesjosh/mi-devfest

The app is in `shiftproof/`. Start with `shiftproof/README.md`.

## Demo video

VIDEO URL: https://youtu.be/2-2k48i3ESQ

One minute, recorded against the live app with IBM Granite on watsonx.ai. Also linked from `docs/VIDEO.md`.

## Note on the demo data

All documents in `shiftproof/data/fixtures/` are fictional training fixtures. WI-114 is not a real shop's procedure, and the veteran is not a real person.
