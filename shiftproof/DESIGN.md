# ShiftProof design system

**Read this before you change any UI.** It applies to every agent and model provider (Claude, Codex, Gemini, DeepSeek and others) and to every person on the team.

- **Source of truth:** this file plus `design/` in this repository. The visual copy in Claude Design (https://claude.ai/artifact/VbcMDJWkw6FSUbdarRuTrD, private to the team) mirrors it. If they disagree, the repository wins.
- **Tokens:** `design/tokens.json`. Run `npm run tokens` to regenerate `design/tokens.css`; never edit `tokens.css` by hand.
- **Component classes:** `design/components.css`. One README and a live preview per component in `design/components/<Name>/`.
- **See it:** serve the folder (`python3 -m http.server 4100 -d design`) and open http://localhost:4100/preview.html.
- **Copy:** every word a person sees follows [`COPY.md`](COPY.md).

- **Status (Nov 13, craft pass):** the app uses the "traveler" direction below: shop paperwork on a surface plate. It replaces the earlier "Synchro" dashboard (lavender page, pill buttons, gradient source card, donut), which read as a generic dashboard. `app/page.tsx` and `app/globals.css` use these tokens and classes.

To change the system, edit `design/tokens.json` or `design/components.css` and this file in the same commit, then ask Daniel to update the Claude Design copy.

ShiftProof looks like the paperwork that travels with a job: flat sheets of paper stock on a grey-green surface plate, a dark rail for the three steps, condensed lettering like a drawing title block, and one ruled overview sheet in place of dashboard tiles. The work instruction reads as a printed sheet; the veteran's words sit on a ruled pad. Trust signals stay shop-floor plain: hanging inspection tags, rubber stamps pressed a touch off square, mono source quotes and the hazard-striped sample banner. Status colours each mean one thing. Build every screen from the tokens and classes below. If you need something they don't cover, add a token here first instead of writing a one-off value in a component.

## Who it is for

- **The veteran** (31 years on the mills) reads findings on a shop PC and answers follow-up questions. Big type, plain words, nothing clever.
- **The quality lead** confirms and approves guide cards. They need to see the status and the source of every claim at a glance.
- **The apprentice** asks questions on a phone at the machine. Everything works at 375px wide, and every tap target is at least `control-min` (44px).

## Principles

1. **Show the source.** Words the app quotes from a document are set in `quote` (mono) inside a source quote, with the document and step named. Words the app or the model writes are set in `body`. A reader can always tell which is which.
2. **Status is a tag, not a tint.** Card status, quote checks and answer scope each use an inspection-tag colour together with a word: CANDIDATE, EXPERT CONFIRMED, APPROVED, VERIFIED IN SOURCE, QUOTE NOT FOUND, NO APPROVED GUIDANCE. Never show colour without the word.
3. **One accent, for the next action.** `dykem` goes on the primary button of a step and on links. Nothing decorative is blue.
4. **Never dress up sample output.** Sample (offline) output always carries the hazard-striped banner. Live output carries the source line with the model ID.
5. **Paper, not bubbles.** Sheets use `radius-panel` (a cut corner) and the one hard-edged `shadow-panel`. Buttons, fields, tags and stamps use `radius-inner`. Nothing is a pill, and there are no gradients, glows or blurred shadows anywhere. Only two things are allowed to sit off square: verify stamps and the hanging tags on the rack.
6. **Real numbers only.** Every count, tick and tag comes from app state. No decorative charts, no invented machines or metrics. The one illustration (in `sp-hero__art`) carries no numbers or labels.
7. **Say it once, large.** The step name is the only big type on the page. Captions on the overview sheet are small sentence case. Uppercase `label` type is for tags, stamps, finding types and quote sources only, never for eyebrows above headings.

## Colour

- Page: flat `paper`. Sheets and fields: `surface`. Source document panes and quote bodies: `surface-sunken`.
- Hairlines: `rule` (decorative). Field and secondary-button outlines: `rule-strong` (3:1).
- Text: `ink` on paper, surface and surface-sunken. Secondary text: `ink-muted` on the same grounds.
- Side rail (bottom bar under 900px): `granite`, with `on-granite` for the current step text and `on-granite-muted` for the others. The current step fills with `dykem`.
- `ember` and `paper-glow` are for artwork only. The `glow-*` and `on-glow` tokens are retired with the gradient source card; don't use them.
- Accent: `dykem` (layout-fluid blue) fill with `on-dykem` text for primary buttons. `dykem-tint` for hover on secondary buttons and quick-question rows.
- Status, always with a word:
  - `accept` on `accept-bg`: approved cards, verified quotes, answers from approved guidance.
  - `hold` on `hold-bg`: expert-confirmed cards waiting on quality, and the text strip of the sample banner.
  - `reject` on `reject-bg`: unverified quotes, out-of-scope answers, failed model calls. Use a dashed `border-stamp` so the state also shows in greyscale.
- Highlighted spans inside a source pane: `highlight` behind `ink` text.
- `hazard` with `hazard-ink` only as the diagonal stripes on the sample banner. Never put text on `hazard`.
- Every text pair above meets 4.5:1 in both themes. Rules, control borders and focus rings meet 3:1.

## Type

Three IBM Plex families, loaded from Google Fonts by `components.css`:

- `display` (Plex Sans Condensed, weight 600) for the page title (`text-hero`), headings (`text-heading`), the gaps figure (`text-figure`), step numbers in the rail and `label`. `label` is 12px uppercase with 0.06em tracking (`sp-label`), like the lettering on a stamp.
- `sans` (Plex Sans) for `body`, `body-strong` and `note`. Inputs are 16px so phones don't zoom.
- `mono` (Plex Mono) for `quote` (text copied from a source) and `data` (dimensions, tolerances, step numbers, model and card IDs, with tabular figures).

Keep answers and card steps under `measure` (68ch). Headings use `text-wrap: balance`.

## Space, shape and layout

- Spacing steps: `space-1` 4, `space-2` 8, `space-3` 12, `space-4` 16, `space-6` 24, `space-8` 32. Lay out siblings with flex or grid and `gap`. Avoid per-element margins.
- Shell: the rail is `rail-width` wide at 900px and up; below that it becomes a fixed bottom bar and the page reserves room for it. Content max width `page-max`, side gutter `space-4` (phone) or `space-8`.
- Top strip (`sp-top`): the product name and `WI-114 Rev C` on the left; the role picker, Reset demo and the demo-roles note on the right. Quiet on purpose.
- Hero (`sp-hero`): the step name in `text-hero`, one line saying what happens here (`sp-hero__lede`, `text-lede`), and on Compare the primary button. At 900px and up the button sits beside the lede, not under it. At 900px and up an illustration slot (`sp-hero__art`, `hero-art` wide, `aria-hidden` content, token colours only) sits at the right and its bottom edge rests on the overview sheet's ink top rule, so the artwork stands on the sheet. It is hidden on smaller screens. The hero is then as tall as the illustration on every step, so the overview sheet starts at the same height on each, and the step's own content starts high enough to be seen without scrolling on a laptop screen.
- Source documents on Compare (`sp-src`): each scrolls in its own box, at most 22.5rem tall. At 900px and up the box is also at most the window height minus `src-fold-offset`, so both documents end above the fold on a laptop screen.
- Overview sheet (`sp-sheet`): one ruled form with three unequal cells, not three tiles. Gaps found (the figure, one tick box per finding via `sp-ticks`, and the verified count); guide cards (a count per status in words, and the tag rack `sp-rack` with one hanging tag `sp-hang` per card showing its status word on one line and up to two lines of title); model (the sample banner or the live source line). At 720px and up it sits above the step; on phones it stacks below the step, so the task comes first.
- Panels stack with `space-4` between them.
- Review card editor (`sp-card`): at 900px and up, title and scope share a row, as do the two applies-when fields, and the action row sticks to the bottom of the window while the card scrolls. Text areas grow with their content. "Edits not saved" shows in the action row while the form differs from the saved card. Below 900px the action row sticks above the bottom tab bar; on phones (under 600px) it is two rows, Save and Confirm side by side and Approve below, so it covers less of the card.
- Ask: when an answer arrives the page scrolls it into view under its source banner. The answer's first paragraph is set one step larger (`sp-answer__lead`), and each cited card sits in a `surface-sunken` row.
- Compare shows the two sources side by side and stacks them below 720px. Findings stack the same way.
- Corners: `radius-panel` (6px) for sheets and answers, `radius-inner` (3px) for buttons, fields, quotes, banners, tags and stamps. `radius-pill` only for round things: the tag punch hole and the live-source dot.
- Findings: the type is a plain label beside the step, the two quotes sit side by side, and "Why it matters" and "Follow-up" are a fact list (`sp-facts`) with the term in the margin (`facts-term`).
- Veteran's words: any quote from the veteran, and the veteran notes pane, adds `sp-quote--pad` (ruled lines at `quote-line` pitch on `surface`). Text stays mono. Highlighted spans look like a highlighter stroke. A short quote (`p.sp-quote__text`) has no top padding, so its text sits on the first rule with no stray rule under the header. Scrolling panes (`sp-scroll`) fade the edge that has more text and show a "More below" or "More above" cue.
- Sign-off: "Confirmed by" and "Approved by" sit on ruled sign-off lines (`sp-card__sign`).
- Motion: `dur-fast` with `ease-out` for hover and press (buttons scale to 0.97 on press, step tabs to 0.96), `dur-base` for the step change. Hanging tags straighten on hover (fine pointers only). All motion is off under `prefers-reduced-motion`.

## Components

| Component | Class | Use it for |
|---|---|---|
| Button | `sp-btn`, `sp-btn--primary` | Every action. One primary per step. (`sp-btn--on-granite` is kept for controls placed on the rail.) |
| OverviewSheet | `sp-sheet`, `sp-sheet__cell`, `sp-ticks`, `sp-rack`, `sp-hang` | The ruled overview form, built only from app state. |
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

ShiftProof uses no icon set. Meaning is carried by words in `label` style and by the tag shapes. The only glyphs are the brand mark in the rail (`sp-rail__brand`), ✓ in a verified stamp or tick box and × in an unverified one, always next to their words. Don't add emoji or decorative icons.

## Writing

All user-facing text follows the copy contract (the Copy section, `COPY.md` in the repository). In short: plain shop words, verbs on buttons, never say a part is good, never present sample output as live, and quote the veteran's words exactly.

## Don't

- Don't use the accent for anything but the next action.
- Don't add gradients, glows, blurred shadows, pills, coloured left-border accents, glass or emoji.
- Don't put an uppercase eyebrow above a heading, or split the overview back into equal tiles or a chart.
- Don't show a number, chart or list that isn't computed from app state.
- Don't show a status by colour alone.
- Don't restyle source quotes so they look like the app's own words, or the reverse.
- Don't write a hex value, a font name or a pixel size in a component. Use a token.
