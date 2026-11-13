# ShiftProof brand

## The idea

The mark is a milled pass. One end-mill pass enters a square plate from its edge, cuts an S and stops in a round slot end. It is the veteran's path, left in the part for the next shift to follow.

Concept by GPT-6 Astra ("Shift Relay"), refined by Claude Fable 5.2 into the milled pass.

## Files

| File | Use |
|---|---|
| `mark.svg` | The mark alone, in Dykem blue |
| `lockup-light.svg` | Mark and wordmark for light backgrounds |
| `lockup-dark.svg` | Mark and wordmark for the granite rail and other dark backgrounds |
| `app/Brand.tsx`, `app/brand.css` | `BrandMark` and `BrandLockup` for the app, coloured by tokens |
| `app/icon.svg`, `app/apple-icon.tsx`, `app/manifest.ts` | Favicon, home-screen icon and web manifest |

The lockup SVGs use live text in IBM Plex Sans Condensed. Convert the text to outlines before sending them anywhere the font may be missing.

## Construction

- 64-unit grid, one filled path, no strokes. The plate is 56 units square.
- The slot is a constant 8 units wide. Walls between runs are 8 units. Every edge sits on a 4-unit grid, so at 16px the slot and walls are 2px each.
- Outside corners of the slot are rounded (4-unit radius). Inside corners are sharp.
- The slot is open where it enters on the right edge and ends in a full round end on the left, like a real slot cut.
- Wordmark: IBM Plex Sans Condensed SemiBold (600), "ShiftProof" in one word, tracking -0.01em.

## Colour

| Background | Plate |
|---|---|
| Light (`--paper`, `--surface`) | `--dykem` |
| Dark (`--granite`) | `--on-granite` |

The favicon and home-screen icon are a granite tile with a paper plate. Ember is not part of the mark.

## Clear space and minimum size

- Clear space: one slot width (an eighth of the mark) on every side.
- Minimum size: 16px.

## Don't

- Don't close the slot's open entry or square off its round end.
- Don't rotate or mirror the mark.
- Don't put a gradient, glow or shadow on the mark.
