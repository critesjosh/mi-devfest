# Pitch deck

`ShiftProof-pitch.pptx` is the 3-minute pitch deck (10 slides, speaker notes with timing). To get a PDF, open the .pptx in PowerPoint or Keynote and export it. The Google Slides copy is made by uploading the .pptx to Drive; upload it again after a rebuild.

The deck is generated from the repo: quotes come from `shiftproof/data/fixtures/`, numbers only from `docs/SUBMISSION.md`, and the look from `shiftproof/design/tokens.json`.

## Rebuild with live captures

```bash
cd docs/pitch && npm install
# 1. Run the app (live Granite, or SHIFTPROOF_OFFLINE=1 for sample output), then capture the golden path:
BASE=http://localhost:3000 npm run capture      # writes captures/shots/ (needs playwright)
# 2. Crop the pieces the slides use, then build:
npm run crop && npm run build                   # writes ShiftProof-pitch.pptx
```

The captures checked in here are from a live run against IBM Granite on watsonx.ai (`ibm/granite-4-h-small`) on Nov 13, 2026, and the slides caption them as live. If you rebuild from an offline run, the captures show the "Sample output (offline)" banner: caption them as sample output in `scripts/build-deck.js`, never as live.
