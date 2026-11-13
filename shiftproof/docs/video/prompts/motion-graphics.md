# Motion graphics brief

**Model:** Claude Opus 5.5 (Fable 5.2 if Opus is unavailable). Only Anthropic models build these, because they carry on-screen words.
**Effort:** default. **Due:** 4:15 PM.
**Output:** `~/ShiftProof-video/motion/`, outside git. The HTML source may be committed later under `shiftproof/docs/video/motion/` if it is small. Rendered video never is.

Build every graphic as HTML and CSS that imports `shiftproof/design/tokens.css` and `shiftproof/design/components.css`. Write no hex colour, font name or pixel size outside the tokens. Animate with CSS keyframes, then render to video:
- Render frames with headless Chrome at 1920 × 1080, `deviceScaleFactor` 1, 30 fps, by stepping a `--t` custom property or the Web Animations API `currentTime`.
- Join the frames with `ffmpeg -framerate 30 -i %05d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le`, so overlays keep alpha.

## Look

`shiftproof/DESIGN.md` applies in full:
- Grounds are `paper` and `surface`. Quotes use `sp-quote`, on `surface-sunken`, in `font-mono`. Labels use `sp-label`, uppercase.
- The only band is `granite`. `dykem` goes nowhere except a click target. Status is shown only with its word.
- Corners are square. No shadows or gradients, except the hazard stripes, which appear only if the offline fallback is used.

Motion is quiet and mechanical:
- Elements enter with a 200 ms opacity-and-translate (8 px). Easing is `cubic-bezier(0.2, 0, 0, 1)`, and nothing bounces.
- Highlights fill left to right behind the text over 400 ms, like a marker.

Type is scaled for 1080p, not phone: quotes at 40 px, labels at 24 px, the end-card title at 120 px. Add tokens for these video sizes in a local `video.css`, not in `design/tokens.json`. They are video-only and must not change the app.

## Pieces (text is final; copy it exactly)

| ID | Length | Content |
|---|---|---|
| S1 | 9.7 s | Granite band with "ShiftProof". At 0.0 s a 375-wide question card enters, label `APPRENTICE · 3 ASK`, text "My first bracket measured 0.002 over on the pocket. Should I bump the wear offset?" At 3.7 s a source quote enters below: label `WI-114 REV C · STEP 7 · FICTIONAL TRAINING FIXTURE`, text "7. If the pocket is out of tolerance, adjust the tool wear offset and rerun." At 6.0 s `highlight` fills behind "adjust the tool wear offset" |
| S2 | 10.1 s | Step 7 card slides left and dims to `ink-muted`. At 0.3 s, quote 1: label `VETERAN NOTES · MARV K. (FICTIONAL) · FICTIONAL TRAINING FIXTURE`, text "A 4 inch bracket that's maybe 40 degrees over shop temperature will read about two thousandths long." At 4.3 s, quote 2 under it, same label, text "I've watched new guys measure it hot, see it over, chase the wear offset, and then every part after that comes out short once it cools." At 6.5 s `highlight` fills behind "every part after that comes out short" |
| S6a | 2.7 s | S1 layout again: the question card left, and on the right a still frame of the S5a answer panel (from the capture, scaled, its source line visible) in a `border-control` frame |
| S6b | 4.0 s | Full `granite` card:<br>- "ShiftProof", title, `on-granite`.<br>- "What the work instruction leaves out, reviewed for the next shift." (body, `on-granite`).<br>- `IBM GRANITE ON WATSONX.AI · ibm/granite-4-h-small` (label, then data style).<br>- `github.com/critesjosh/mi-devfest` (data).<br>- Footer: "Fictional training fixtures. Live Granite calls; waits trimmed." (note, `on-granite-muted`) |
| Bug | 33.5 s, alpha | Top right, `sp-label` on `surface` with a `rule` hairline: "Live Granite · fictional training fixtures". If the offline fallback is used: "Sample output (offline) · fictional training fixtures" |
| Lower thirds | 2.5 s each, alpha | `1 COMPARE`, `2 REVIEW`, `3 ASK` (`ink` tab block, like the active `sp-tabs__tab`), `ROLE: VETERAN`, `ROLE: QUALITY LEAD · DEMO ROLES, NOT REAL SIGN-IN` |
| Chips | 2.0 s each, alpha | "Granite call · {n} s, trimmed" (one per model call, `{n}` from the Codex log, whole seconds), "Typing sped up". `sp-label`, `hold` on `hold-bg`, `radius-tag` |
| Callout | 1.5 s, alpha | A square ruled box, `border-control` in `ink`, that draws on over 300 ms. Rendered at the size the edit needs |
| Phone frame | 12.5 s, alpha | A plain `border-control` `ink` rectangle sized to a 375 × 812 viewport scaled to fit 1000 px tall, centred on `paper`. Not a device mock-up |

## Check before handing off

- [ ] Every quote matches `shiftproof/data/fixtures/*.md` or the app character for character.
- [ ] No colour, font or size outside the tokens and `video.css`.
- [ ] Read every frame at full size once. No text under 24 px at 1080p.
- [ ] Each piece's length matches the table.
