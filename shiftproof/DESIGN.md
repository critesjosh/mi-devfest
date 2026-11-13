# ShiftProof design system

**Read this before you change any UI.** It applies to every agent and model provider (Claude, Codex, Gemini, DeepSeek and others) and to every person on the team.

- **Source of truth:** this file plus `design/` in this repository. The visual copy in Claude Design (https://claude.ai/artifact/VbcMDJWkw6FSUbdarRuTrD, private to the team) mirrors it. If they disagree, the repository wins.
- **Tokens:** `design/tokens.json`. Run `npm run tokens` to regenerate `design/tokens.css`; never edit `tokens.css` by hand.
- **Component classes:** `design/components.css`. One README and a live preview per component in `design/components/<Name>/`.
- **See it:** serve the folder (`python3 -m http.server 4100 -d design`) and open http://localhost:4100/preview.html.
- **Copy:** every word a person sees follows [`COPY.md`](COPY.md).

- **Status (Nov 13):** `app/globals.css` and `app/page.tsx` still use the older Carbon-style styles. New UI work should move them onto these tokens and classes, not add more one-off styles.

To change the system, edit `design/tokens.json` or `design/components.css` and this file in the same commit, then ask Daniel to update the Claude Design copy.

ShiftProof looks like the paperwork a machine shop already trusts: a work instruction, an inspection tag, a first-article sheet. It is square, high-contrast and plain. The only bright colours are status colours, and each one means one thing. Build every screen from the tokens and classes below. If you need something they don't cover, add a token here first instead of writing a one-off value in a component.

## Who it is for

- **The veteran** (31 years on the mills) reads findings on a shop PC and answers follow-up questions. Big type, plain words, nothing clever.
- **The quality lead** confirms and approves guide cards. They need to see the status and the source of every claim at a glance.
- **The apprentice** asks questions on a phone at the machine. Everything works at 375px wide, and every tap target is at least `control-min` (44px).

## Principles

1. **Show the source.** Words the app quotes from a document are set in `quote` (mono) inside a source quote, with the document and step named. Words the app or the model writes are set in `body`. A reader can always tell which is which.
2. **Status is a tag, not a tint.** Card status, quote checks and answer scope each use an inspection-tag colour together with a word: CANDIDATE, EXPERT CONFIRMED, APPROVED, VERIFIED IN SOURCE, QUOTE NOT FOUND, NO APPROVED GUIDANCE. Never show colour without the word.
3. **One accent, for the next action.** `dykem` goes on the primary button of a step and on links. Nothing decorative is blue.
4. **Never dress up sample output.** Sample (offline) output always carries the hazard-striped banner. Live output carries the source line with the model ID.
5. **Square and ruled.** `radius-0` everywhere. Panels are outlined with a `border-hairline` in `rule`, and controls with `border-control` in `ink`. No shadows, gradients or glass.

## Colour

- Page: `paper`. Panels and fields: `surface`. Source document panes and quote bodies: `surface-sunken`.
- Text: `ink` on paper, surface and surface-sunken. Secondary text: `ink-muted` on the same grounds.
- Header band: `granite`, with `on-granite` text and `on-granite-muted` for the demo-roles note. Controls in the header use `sp-btn--on-granite` and the `focus-on-granite` ring.
- Accent: `dykem` fill with `on-dykem` text for primary buttons. `dykem-tint` for hover on secondary buttons and quick-question rows.
- Status, always with a word:
  - `accept` on `accept-bg`: approved cards, verified quotes, answers from approved guidance.
  - `hold` on `hold-bg`: expert-confirmed cards waiting on quality, and the text strip of the sample banner.
  - `reject` on `reject-bg`: unverified quotes, out-of-scope answers, failed model calls. Use a dashed `border-stamp` so the state also shows in greyscale.
- Highlighted spans inside a source pane: `highlight` behind `ink` text.
- `hazard` with `hazard-ink` only as the diagonal stripes on the sample banner. Never put text on `hazard`.
- Every text pair above meets 4.5:1 in both themes. Rules, control borders and focus rings meet 3:1.

## Type

Three IBM Plex families, loaded from Google Fonts by `components.css`:

- `display` (Plex Sans Condensed) for `title`, `heading` and `label`. `label` is always uppercase with 0.06em tracking (`sp-label`), like the lettering on a stamp or a drawing title block.
- `sans` (Plex Sans) for `body`, `body-strong` and `note`. Inputs are 16px so phones don't zoom.
- `mono` (Plex Mono) for `quote` (text copied from a source) and `data` (dimensions, tolerances, step numbers, model and card IDs, with tabular figures).

Keep answers and card steps under `measure` (68ch). Headings use `text-wrap: balance`.

## Space, shape and layout

- Spacing steps: `space-1` 4, `space-2` 8, `space-3` 12, `space-4` 16, `space-6` 24, `space-8` 32. Lay out siblings with flex or grid and `gap`. Avoid per-element margins.
- Page: max width 1100px, side gutter `space-4`. Panels stack with `space-4` between them.
- Compare shows the two sources side by side and stacks them below 720px. Findings stack the same way.
- Corners: `radius-0`. Only inspection tags and verify stamps use `radius-tag` (2px), and only the tag's punch hole uses `radius-hole`.

## Components

| Component | Class | Use it for |
|---|---|---|
| Button | `sp-btn`, `sp-btn--primary`, `sp-btn--on-granite` | Every action. One primary per step. |
| StepTabs | `sp-tabs`, `sp-tabs__tab` | The three operations: 1 Compare, 2 Review, 3 Ask. Numbered because the order matters. |
| SourceQuote | `sp-quote` | Any words copied from the work instruction or the veteran's notes. |
| VerifyStamp | `sp-stamp--ok`, `sp-stamp--bad` | The app's check that a quote appears in its source. |
| InspectionTag | `sp-tag`, `sp-tag--hold`, `sp-tag--accept` | Guide card status. |
| FindingCard | `sp-panel sp-finding` | One gap the model found, with both quotes and a follow-up question. |
| SourceBanner | `sp-source`, `sp-banner`, `sp-banner--fail` | Where a result came from: live Granite, sample output, or a failed call. |
| AnswerPanel | `sp-answer`, `sp-answer--out` | The apprentice's answer, or the refusal. |
| Field | `sp-field` | Labelled inputs and text areas. Every input has a visible label. |

## States

- **Focus:** a 3px solid `focus` outline with a 2px offset on every interactive element. Never remove it.
- **Busy:** the button keeps its size and shows the action in progress ("Finding gaps..."), and it is disabled while the call runs.
- **Disabled:** 45% opacity and a not-allowed cursor. Explain nearby why it is disabled when the reason is a role or a status, as the Review screen does.
- **Empty:** say what will appear here and give the action that fills it ("No cards yet. Find gaps, then draft a guide card from a verified finding.").
- **Error:** a `sp-banner--fail` with what failed and what the screen shows instead.

## Iconography

ShiftProof uses no icon set. Meaning is carried by words in `label` style and by the tag shapes. The only glyphs are ✓ in a verified stamp and × in an unverified one, always next to their words. Don't add emoji or decorative icons.

## Writing

All user-facing text follows the copy contract (the Copy section, `COPY.md` in the repository). In short: plain shop words, verbs on buttons, never say a part is good, never present sample output as live, and quote the veteran's words exactly.

## Don't

- Don't use the accent for anything but the next action.
- Don't add rounded cards, shadows, gradients, coloured left-border accents or emoji.
- Don't show a status by colour alone.
- Don't restyle source quotes so they look like the app's own words, or the reverse.
- Don't write a hex value, a font name or a pixel size in a component. Use a token.
