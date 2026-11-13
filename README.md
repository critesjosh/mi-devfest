# mi-devfest

Our team's repo for the Michigan DevFest Hackathon 2026 (Manufacturing track, November 13, 2026).

## ShiftProof

Experienced machinists know things the written work instruction leaves out. ShiftProof helps them turn that know-how into reviewed guidance the next shift can use, built on IBM Granite on watsonx.ai.

The demo takes three clicks:

1. **Compare.** Granite reads a work instruction beside a veteran's notes on the same job. It flags what the instruction leaves out, quotes both sources, and asks the veteran a follow-up question. The app checks that every quote really appears in the source.
2. **Review.** The veteran answers, Granite drafts a guide card, the veteran confirms it, and a quality lead approves it. The app enforces that order.
3. **Ask.** An apprentice asks a question in their own words and gets an answer from approved cards only, citing the veteran's words. If nothing approved covers the question, the app says so instead of guessing.

All demo documents are fictional training fixtures, not a real shop's procedure.

Code, setup and details: [`shiftproof/`](shiftproof/). Start with [`shiftproof/README.md`](shiftproof/README.md).

## Quick start

```bash
cd shiftproof
npm install
cp .env.example .env.local   # add your own IBM Cloud keys; never commit this file
npm run smoke                # needs Node 22.6 or newer
npm run dev                  # http://localhost:3000
```

No keys? Set `SHIFTPROOF_OFFLINE=1` to run on recorded sample output. Every screen labels it as sample output.

## What else is here

| Path | What it is |
|---|---|
| [`shiftproof/`](shiftproof/) | The app (Next.js + TypeScript) |
| [`shiftproof/HANDOFF.md`](shiftproof/HANDOFF.md) | Current status, decisions and next steps for the team |
| [`shiftproof/DESIGN.md`](shiftproof/DESIGN.md), [`shiftproof/design/`](shiftproof/design/) | Design system: tokens, components, previews |
| [`shiftproof/COPY.md`](shiftproof/COPY.md) | Copy contract for every word a person sees |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Pull request guide, including visual proof for UI changes |
| [`AGENTS.md`](AGENTS.md) | Rules for every coding agent (Claude, Codex, Gemini and others) |
| [`shiftproof/docs/MODEL_ROUTING.md`](shiftproof/docs/MODEL_ROUTING.md) | Which AI models we use for which work |
| [`ideas/`](ideas/) | The project proposal |
| [`personas.html`](personas.html), [`personas.json`](personas.json) | Stakeholder personas |

## Contributing

- Never commit `.env.local`, API keys or project IDs. `.gitignore` already excludes them.
- Run `npm run typecheck` before you push.
- The hackathon asks teams to disclose AI tools. Add yours to the list in [`shiftproof/README.md`](shiftproof/README.md).
