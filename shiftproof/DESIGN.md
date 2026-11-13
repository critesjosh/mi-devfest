# ShiftProof design system

**Read this before you change any UI.** It applies to every agent and model provider (Claude, Codex, Gemini, DeepSeek and others) and to every person on the team.

- **Source of truth:** this file plus `design/` in this repository. The visual copy in Claude Design (https://claude.ai/artifact/VbcMDJWkw6FSUbdarRuTrD, private to the team) mirrors it. If they disagree, the repository wins.
- **Tokens:** `design/tokens.json`. Run `npm run tokens` to regenerate `design/tokens.css`; never edit `tokens.css` by hand.
- **Component classes:** `design/components.css`. One README and a live preview per component in `design/components/<Name>/`.
- **See it:** serve the folder (`python3 -m http.server 4100 -d design`) and open http://localhost:4100/preview.html.
- **Copy:** every word a person sees follows [`COPY.md`](COPY.md).

- **Status (Nov 13):** the app uses the "Synchro" direction below (a soft industrial dashboard, adapted from a Dribbble reference and chosen over a second concept by an independent model judge). `app/page.tsx` and `app/globals.css` use these tokens and classes.

To change the system, edit `design/tokens.json` or `design/components.css` and this file in the same commit, then ask Daniel to update the Claude Design copy.

ShiftProof looks like a calm industrial dashboard: a dark side rail, a soft lavender page, rounded white panels that float a little, and one gradient source card. Inside that frame, the trust signals stay shop-floor plain: inspection tags, verify stamps, mono source quotes and the hazard-striped sample banner. Status colours each mean one thing. Build every screen from the tokens and classes below. If you need something they don't cover, add a token here first instead of writing a one-off value in a component.

## Who it is for

- **The veteran** (31 years on the mills) reads findings on a shop PC and answers follow-up questions. Big type, plain words, nothing clever.
- **The quality lead** confirms and approves guide cards. They need to see the status and the source of every claim at a glance.
- **The apprentice** asks questions on a phone at the machine. Everything works at 375px wide, and every tap target is at least `control-min` (44px).

## Principles

1. **Show the source.** Words the app quotes from a document are set in `quote` (mono) inside a source quote, with the document and step named. Words the app or the model writes are set in `body`. A reader can always tell which is which.
2. **Status is a tag, not a tint.** Card status, quote checks and answer scope each use an inspection-tag colour together with a word: CANDIDATE, EXPERT CONFIRMED, APPROVED, VERIFIED IN SOURCE, QUOTE NOT FOUND, NO APPROVED GUIDANCE. Never show colour without the word.
3. **One accent, for the next action.** `dykem` goes on the primary button of a step and on links. Nothing decorative is blue.
4. **Never dress up sample output.** Sample (offline) output always carries the hazard-striped banner. Live output carries the source line with the model ID.
5. **Soft frame, hard evidence.** Panels use `radius-panel` and the one `shadow-panel`. Buttons, tags and stamps are pills. The only gradient is the source card (`glow-a` to `glow-b`) and the findings meter. Evidence (quotes, stamps, banners) keeps hard edges, strong borders and mono type.
6. **Real numbers only.** Every count, meter and chart segment comes from app state. No decorative charts, no invented machines or metrics.

## Colour

- Page: `paper`, with `paper-glow` washed over the top. Panels and fields: `surface`. Source document panes and quote bodies: `surface-sunken`.
- Hairlines: `rule` (decorative). Field and secondary-button outlines: `rule-strong` (3:1).
- Text: `ink` on paper, surface and surface-sunken. Secondary text: `ink-muted` on the same grounds.
- Side rail (bottom bar under 900px): `granite`, with `on-granite` for the current step text and `on-granite-muted` for the others. The current step fills with `dykem`. `sp-btn--on-granite` is the dark Reset pill in the top bar.
- Source card: a `glow-a` to `dykem` to `glow-b` gradient with `on-glow` text. It shows the configured model line or the sample banner, never anything else.
- `ember` only as the warm end of gradients and the candidate segment of the card chart.
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

- `display` (Plex Sans, weight 500, tight tracking) for the page title, `title` and `heading`. `label` is 12px uppercase with 0.06em tracking (`sp-label`), like the lettering on a stamp.
- `sans` (Plex Sans) for `body`, `body-strong` and `note`. Inputs are 16px so phones don't zoom.
- `mono` (Plex Mono) for `quote` (text copied from a source) and `data` (dimensions, tolerances, step numbers, model and card IDs, with tabular figures).

Keep answers and card steps under `measure` (68ch). Headings use `text-wrap: balance`.

## Space, shape and layout

- Spacing steps: `space-1` 4, `space-2` 8, `space-3` 12, `space-4` 16, `space-6` 24, `space-8` 32. Lay out siblings with flex or grid and `gap`. Avoid per-element margins.
- Shell: the rail is `rail-width` wide at 900px and up; below that it becomes a fixed bottom bar and the page reserves room for it. Content max width `page-max`, side gutter `space-4` (phone) or `space-8`.
- Top bar: eyebrow (ShiftProof · WI-114 Rev C), the step as the page title, then the role pill, Reset pill and demo-roles note.
- Overview: three tiles (findings, guide cards donut, source card). At 720px and up they sit above the step; on phones they become a swipeable row below the step, so the task comes first.
- Panels stack with `space-4` between them.
- Compare shows the two sources side by side and stacks them below 720px. Findings stack the same way.
- Corners: `radius-panel` (20px) for panels and answers, `radius-inner` (12px) for quotes, fields, banners and tiles, `radius-pill` for buttons, tags, stamps and the role picker.
- Motion: `dur-fast` with `ease-out` for hover and press (buttons scale to 0.97 on press), `dur-base` for the step change and the chart. All motion is off under `prefers-reduced-motion`.

## Components

| Component | Class | Use it for |
|---|---|---|
| Button | `sp-btn`, `sp-btn--primary`, `sp-btn--on-granite` | Every action. One primary per step. |
| StepTabs | `sp-tabs`, `sp-tabs__tab` | The three operations: 1 Compare, 2 Review, 3 Ask, in the rail. Numbered because the order matters. Arrow keys, Home and End move between steps. |
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

ShiftProof uses no icon set. Meaning is carried by words in `label` style and by the tag shapes. The only glyphs are the four-point spark brand mark in the rail, ✓ in a verified stamp and × in an unverified one, always next to their words. Don't add emoji or decorative icons.

## Writing

All user-facing text follows the copy contract (the Copy section, `COPY.md` in the repository). In short: plain shop words, verbs on buttons, never say a part is good, never present sample output as live, and quote the veteran's words exactly.

## Don't

- Don't use the accent for anything but the next action.
- Don't add more shadows or gradients than the ones above, coloured left-border accents, glass or emoji.
- Don't show a number, chart or list that isn't computed from app state.
- Don't show a status by colour alone.
- Don't restyle source quotes so they look like the app's own words, or the reverse.
- Don't write a hex value, a font name or a pixel size in a component. Use a token.
