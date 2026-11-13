# ShiftProof brand

## The idea

The mark is a signed-off inspection tag: the chamfered shop tag with a punched hole that hangs on a part, carrying the first-article check. One shift proves it, the next shift trusts it.

## Files

| File | Use |
|---|---|
| `mark.svg` | The mark alone, indigo tag with a white check |
| `lockup-light.svg` | Mark and wordmark for light backgrounds |
| `lockup-dark.svg` | Mark and wordmark for the granite rail and other dark backgrounds (paper tag, indigo check) |
| `app/Brand.tsx`, `app/brand.css` | `BrandMark` and `BrandLockup` for the app, coloured by tokens |
| `app/icon.svg`, `app/apple-icon.tsx`, `app/manifest.ts` | Favicon, home-screen icon and web manifest |

The lockup SVGs use live text in IBM Plex Sans. Convert the text to outlines before sending them anywhere the font may be missing.

## Construction

- 32-unit grid. The tag is 22 wide and 28 tall, with 6-unit chamfers on the top corners and 3-unit radii on the bottom corners.
- The hole sits on the centre line. It is a real cut-out, so the background shows through.
- The check is a 3.2-unit stroke with round caps and joins, centred under the hole.
- The eyelet ring is dropped below 28px. The favicon uses a heavier, simplified drawing.
- Wordmark: IBM Plex Sans, "Shift" at 500 and "Proof" at 700, tracking -0.02em, no space. The cap height matches the check's height.

## Colour

| Background | Tag | Check |
|---|---|---|
| Light (`--paper`, `--surface`) | `--dykem` #4f46e5 | `--on-dykem` #ffffff |
| Dark (`--granite`) | `--on-granite` #f3f4f8 | `--glow-mid` #4f46e5 |

Ember is not part of the mark. It stays a rare accent in the interface.

## Clear space and minimum size

- Clear space: the width of the punched hole's eyelet (a quarter of the mark's width) on every side.
- Minimum size: 16px for the mark, 20px mark height for the lockup.

## Do

- Use the supplied files and components.
- Keep the tag upright.
- Let the hole show the background.

## Don't

- Don't fill the hole, rotate the tag or add a string.
- Don't put a gradient, glow or shadow on the mark.
- Don't recolour the check separately from the pairs above.
- Don't set the wordmark in one weight, in capitals, or with a space.
