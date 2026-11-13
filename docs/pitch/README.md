# Pitch deck

`ShiftProof-pitch.pptx` is the 3-minute pitch deck (10 slides, speaker notes with timing). `ShiftProof-pitch.pdf` is a render of it. The Google Slides copy was made by uploading the .pptx to Drive.

The deck is generated from the repo: quotes come from `shiftproof/data/fixtures/`, numbers only from `docs/SUBMISSION.md`, and the look from `shiftproof/design/tokens.json`.

## Rebuild with live captures

```bash
cd docs/pitch && npm install
# 1. Run the app (live Granite, or SHIFTPROOF_OFFLINE=1 for sample output), then capture the golden path:
BASE=http://localhost:3000 npm run capture      # writes captures/shots/ (needs playwright)
# 2. Crop the pieces the slides use, then build:
npm run crop && npm run build                   # writes ShiftProof-pitch.pptx
```

The captures checked in here are from offline mode and show the "Sample output (offline)" banner. Slides 5 to 7 caption them as placeholders; after a live capture, delete those captions in the deck (or in `scripts/build-deck.js`).
