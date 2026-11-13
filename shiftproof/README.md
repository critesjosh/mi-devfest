# ShiftProof

Help experienced machinists turn what the written work instruction leaves out into reviewed guidance the next shift can use.

Built for Michigan DevFest Hackathon 2026 (Manufacturing). Discussion and scope: issue #1.

**All documents in `data/fixtures/` are fictional training fixtures.** They are not a real shop's procedure, and the veteran is not a real person.

## The demo (3 clicks)

1. **Compare.** The work instruction (WI-114) sits beside a veteran's account of the same job. Granite flags what the instruction leaves out, quotes both sources, and asks a follow-up question. The app checks every quote against the source text and marks any it can't find.
2. **Review.** The veteran answers the follow-up, Granite drafts a guide card, the veteran confirms it, and a quality lead approves it. Status moves `candidate -> expert_confirmed -> approved`. The app enforces the order, and editing a card sends it back to `candidate`.
3. **Ask.** An apprentice asks a question in their own words. The answer uses only approved cards for WI-114 Rev C and cites the veteran's words. If nothing approved covers it, the app says so instead of guessing.

Expected results for the golden path are in `data/fixtures/expected.md`.

## Run it

```bash
cd shiftproof
npm install
cp .env.example .env.local   # fill in WATSONX_API_KEY, WATSONX_PROJECT_ID, WATSONX_URL
npm run smoke                # checks IBM Cloud sign-in and the Granite model
npm run dev                  # http://localhost:3000
```

`npm run smoke` needs Node 22.6 or newer (it runs TypeScript directly). The watsonx.ai project must have the watsonx.ai Runtime service associated, or every model call returns 403.

No key yet? Set `SHIFTPROOF_OFFLINE=1` (or leave the key empty). The app then uses recorded sample output, and every result shows a "Sample output (offline)" banner. Never present sample output as a live model call.

`Reset demo` in the header clears state so the demo can be rerun.

## How it works

| Part | What it does |
|---|---|
| **IBM Granite on watsonx.ai** (`lib/watsonx.ts`, `lib/prompts.ts`) | Finds gaps between the instruction and the veteran's account, asks follow-ups, drafts guide cards, answers apprentice questions from approved cards only |
| **App code** (`lib/verify.ts`, `lib/store.ts`) | Checks that quotes really appear in the sources, enforces review order, limits answers to approved cards for the right procedure revision |
| Next.js + TypeScript | UI and API routes |
| JSON file store (`.data/`) | Demo persistence. Swap for Cloudant or SQLite later |

## AI tools used to build this

The hackathon asks teams to disclose AI tools. Update this list as you go.

- Claude Opus 5.5 (Claude Code): architecture, fixtures, prompts, watsonx.ai client, live prompt tuning, trust-rule fixes, review and QA
- Claude Sonnet 5.5 (Claude Code subagent): API routes and UI
- Claude Opus 5.5 (Claude Code + Claude Design): design system (`DESIGN.md`, `design/`) and copy contract (`COPY.md`)
- OpenAI Codex (GPT-6.1 Sol, medium reasoning): independent read-only security review of the prompts, quote verification and Ask route

## Not in the MVP

Audio capture and playback, Docling ingestion of real manuals, watsonx.governance, paired test cases, real sign-in.
