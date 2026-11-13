# ShiftProof demo video: plan

**Owner:** Josh (video). **Plan and words:** Claude Opus 5.5. **Reviewed by:** Claude Fable 5.2.
**Status:** plan final, Nov 13, 2026, about 2:30 PM ET. A voiceover take is rendered, normalised and checked (see "Asset list").
**Record:** after the 5:00 PM feature freeze. **Upload:** by 5:30 PM. **Submit:** 5:45 PM.

Everything in this folder:

| File | What it is |
|---|---|
| `PLAN.md` | This plan |
| `vo-script.txt` | The voiceover, with a cue time per beat. The only source for the spoken words |
| `captions.txt` | The same words in written form (WI-114 Rev C, 0.002 in), for burned-in captions |
| `scripts/tts.py` | Renders the voiceover with Gemini TTS, reading `vo-script.txt` exactly |
| `scripts/audio_check.py` | Checks levels (ffmpeg), wording and timing (Gemini Argon), and writes the captions file |
| `prompts/codex-capture.md` | Computer-use brief for Codex GPT-6.1 Terra to capture the live app |
| `prompts/fable-review.md` | The brief Fable reviewed the storyboard against |
| `prompts/motion-graphics.md` | Brief for the title card, quote cards, lower thirds, chips and end card |
| `prompts/assemble.md` | Brief for Sonnet to write the ffmpeg assembly script |

---

## 1. Length: about 60 seconds (decided)

**Decided by Daniel, Nov 13, about 2:55 PM:** follow the workbook's one-minute structure and aim as close to one minute as possible. 3:00 is the absolute hard maximum.

**Target: 59.5 seconds**, in the workbook's six beats (p. 21): user, problem, click 1, click 2, click 3, impact.

- The workbook (p. 21, "One-minute demo video script"; p. 23, "One-minute demo video uploaded") and the keynote (p. 22, "Same structure for your one-minute video") all ask for one minute.
- The story is one thread and fits in a minute without rushing.
- If the cut runs long, trim holds and pauses first, never words. Stay as close to 60 s as the cut allows, and never exceed 3:00.

## 2. Guidelines checklist

Sources, read directly from `~/Downloads/Michigan_DevFest_Hackathon_Workbook.pptx.pdf`:
- Workbook pages 21–23. Page 21 is the video script template; page 22 is the pitch; page 23 is the submission checklist.
- Keynote page 22.

| Guideline | Where it comes from | How the video meets it |
|---|---|---|
| One minute long | Workbook p. 21, p. 23; keynote p. 22 | 59.5 s target (section 1). The checked voiceover take ends at 59.3 s |
| Beat 0:00, "The user" | Workbook p. 21 | 0:00–0:09.7: the apprentice whose first part reads over, and the work instruction they follow |
| Beat 0:10, "The problem" | Workbook p. 21 | 0:09.7–0:19.8: the veteran's notes say wait. The instruction doesn't |
| Beats 0:20, 0:30, 0:40, "Click 1/2/3" | Workbook p. 21; keynote p. 22 ("three clicks through the solution") | 0:19.8 **1 Compare**, 0:30 **2 Review**, 0:40.8 **3 Ask**, labelled with the app's own tab names |
| Beat 0:50, "The impact" | Workbook p. 21 | 0:49.5–0:60: the refusal shows the limit, then the answered question and the end card. About 3 s later than the template, because Ask needs the time (Fable note 3) |
| "Show it working for the one person you built it for. Three clicks, one clear outcome" | Keynote p. 22 | One thread from start to end: the apprentice's 0.002 in reading. The outcome is a cited answer from approved guidance |
| Name the IBM and Google tools and what each does | Keynote p. 22 ("How it works"); workbook p. 23 | Voiceover names IBM Granite at Compare and on the end card. The source line "Granite on watsonx.ai · ibm/granite-4-h-small" stays on screen in every live shot. Google's Gemini voices the video; it is listed in the submission tool list and the README (production step 14) |
| Video uploaded, URL in the submission and on workbook p. 21 | Workbook p. 21, p. 23 | Production step 13. Josh pastes the URL in the portal and on p. 21 |
| Public repo, no API keys | Workbook p. 19, p. 23 | Capture shows only Chrome on localhost. No terminal, `.env.local` or IBM Cloud console (capture checklist) |
| Note the AI tools you used | Workbook p. 19 | Every model used for the video is listed in the README (production step 14) |
| Permitted data only | Workbook p. 19 | Fictional fixtures only, labelled "Fictional training fixture" in every shot that shows them |

Repo rules the video also follows (`AGENTS.md`, `COPY.md`, `DESIGN.md`):
- **Live, not sample.** The live Granite path is captured. A persistent bug reads "Live Granite · fictional training fixtures", and every shortened model wait carries a "Granite call · {n} s, trimmed" chip. If live fails, the fallback keeps the "Sample output (offline)" banner and says so in the voiceover (section 10).
- **Fictional.** The veteran is "Marv K. (fictional)", as the fixture names them, and every quote card carries "Fictional training fixture". The voiceover says "the veteran", never a name.
- **No claims the app can't back up.** Nothing says a part is good, safe or in tolerance. There is no performance, savings or adoption claim, and no number of findings in the voiceover, because the live count can vary.
- **Exact quotes.** Every on-screen quote is copied word for word from the fixtures or the app.
- **Design.** Motion graphics use `shiftproof/design/tokens.css` and the `sp-*` patterns: paper, granite band, Dykem only for the next action, inspection-tag colours with words, IBM Plex, square corners. No stock footage, music, emoji, or AI-generated shop photos, which could read as a real shop.

## 3. Concept

**Hook:** *The instruction says adjust the offset. The veteran says wait.*

An apprentice's first bracket reads 0.002 in over on the pocket. WI-114 Rev C, Step 7, says: "If the pocket is out of tolerance, adjust the tool wear offset and rerun." The veteran's notes say the opposite: a warm aluminum part reads long, and chasing the offset makes every later part short.

The video follows that one line:
1. It starts in the veteran's notes.
2. Granite finds it, and the app checks the quotes.
3. Two people sign it off.
4. It comes back to the apprentice as a cited answer on a phone.

The video opens and closes on the same question, first unanswered, then answered from approved guidance. It shows one concrete thread, not a feature tour.

**Why this lands with judges:**
- The stakes are physical and instant: a wrong offset makes every later part short.
- It shows the product's real difference from a chatbot: verified quotes, a sign-off order that can't be skipped, and a refusal when no approved card applies.
- It proves "live" with the source line and honest "trimmed" chips.

**Tone:** plain, steady, shop-floor. One calm voice, no music, burned-in captions so it works muted.

## 4. Storyboard

1920 × 1080, 30 fps. Times are video time. The voiceover cue times match `vo-script.txt`. "Bug" is a small persistent label, top right, `sp-label` style on `surface`, from 0:19.8 to 0:53.3.

| Time | Shot | On screen | Voiceover | Source | Owner model |
|---|---|---|---|---|---|
| 0:00.0–0:04.0 | **S1a** User | Paper ground, thin granite band at top with "ShiftProof". A 375-wide question card labelled `APPRENTICE · 3 ASK`, with the app's quick-question text: "My first bracket measured 0.002 over on the pocket. Should I bump the wear offset?" | "An apprentice's first bracket reads two thousandths over." | Motion graphic | Opus (build), Gemini TTS (voice) |
| 0:04.0–0:09.7 | **S1b** User | Below the question, a source quote (`sp-quote`): `WI-114 REV C · STEP 7 · FICTIONAL TRAINING FIXTURE` / "7. If the pocket is out of tolerance, adjust the tool wear offset and rerun." On "adjust the wear offset", `highlight` fills behind "adjust the tool wear offset" | "Work instruction one-fourteen, Rev C, says to adjust the wear offset." | Motion graphic | Opus |
| 0:09.7–0:14.0 | **S2a** Problem | Step 7 slides left and dims. A veteran quote builds in: `VETERAN NOTES · MARV K. (FICTIONAL) · FICTIONAL TRAINING FIXTURE` / "A 4 inch bracket that's maybe 40 degrees over shop temperature will read about two thousandths long." | "The veteran's notes say: wait. A warm part reads long," | Motion graphic | Opus |
| 0:14.0–0:19.8 | **S2b** Problem | Second veteran quote stacks under the first: "I've watched new guys measure it hot, see it over, chase the wear offset, and then every part after that comes out short once it cools." On "short", `highlight` fills behind "every part after that comes out short" | "and chasing the offset makes every part after it short. The instruction doesn't say that." | Motion graphic | Opus |
| 0:19.8–0:23.0 | **S3a** 1 Compare | Live app at 1280 wide (scaled to fill 1080p). Compare tab: the WI-114 Rev C and Veteran notes panes, each with "Fictional training fixture". Pointer clicks "Find gaps", the button reads "Finding gaps...". Lower third `1 COMPARE`. Bug appears | "ShiftProof puts the two side by side." | Live capture | Codex GPT-6.1 Terra (capture) |
| 0:23.0–0:30.0 | **S3b** 1 Compare | Jump cut to findings, with the chip `GRANITE CALL · {n} S, TRIMMED`. Slow push in on the finding about cooling before measuring (Step 6): instruction quote, veteran quote, both "verified in source" marks, the source line "Granite on watsonx.ai · ibm/granite-4-h-small". Ruled callout boxes (ink, 2px, square) around both verify marks, then the source line | "IBM Granite flags what the instruction leaves out, and quotes both sources. The app checks every quote." | Live capture + motion graphic overlays | Codex Terra (capture), Opus (overlays) |
| 0:30.0–0:35.0 | **S4a** 2 Review | Same finding. Callout on "Follow-up:". The expert answer types in, sped up 4×, with chip `TYPING SPED UP`: "About ten minutes on the granite plate, until it feels the same temperature as the plate. I never touch the offset off a warm part." Click "Draft guide card", "Drafting...", chip `GRANITE CALL · {n} S, TRIMMED`. Lower third `2 REVIEW` | "Granite asks the veteran a follow-up, then drafts a guide card from the answer." | Live capture | Codex Terra |
| 0:35.0–0:40.8 | **S4b** 2 Review | Review tab, cropped close on the card. Status tag `CANDIDATE` → click "Confirm my account is accurate" → `EXPERT CONFIRMED` → the header role picker visibly changes to "Quality lead" → click "Approve for training" → `APPROVED`. Lower third `ROLE: VETERAN`, then `ROLE: QUALITY LEAD · DEMO ROLES, NOT REAL SIGN-IN` | "The veteran confirms it. The quality lead approves it." | Live capture | Codex Terra |
| 0:40.8–0:49.5 | **S5a** 3 Ask | Phone view: the app at 375 wide, centred in a plain ruled frame (`border-control`, `ink`) on paper. No device mock-up. Role "Apprentice". Tap the quick question (same text as S1a), "Asking...", chip `GRANITE CALL · {n} S, TRIMMED`. Answer panel "Answer from approved guidance", scrolling to the cited card with its approved status and "Veteran's words". Lower third `3 ASK` | "Back at the machine, the apprentice asks. The answer uses only approved cards, and cites the veteran's words." | Live capture | Codex Terra |
| 0:49.5–0:53.3 | **S5b** 3 Ask | Tap "What spindle speed should I run for the roughing pass?". The panel reads "Out of scope" and "No approved guidance covers this. Ask your lead or quality." Callout around the refusal | "No card covers it? Ask your lead or quality." | Live capture | Codex Terra |
| 0:53.3–0:56.0 | **S6a** Impact | Back to the S1 layout. The question card from S1a, and beside it the answer panel from S5a (still frame, its source line visible). Bug off | "What the veteran knows, reviewed, at the machine." | Motion graphic + still from capture | Opus |
| 0:56.0–0:59.5 | **S6b** Impact | End card on `granite`: "ShiftProof" (display, `on-granite`). Under it: "What the work instruction leaves out, reviewed for the next shift." Then `IBM GRANITE ON WATSONX.AI · ibm/granite-4-h-small`, and `github.com/critesjosh/mi-devfest`. Footer note (`on-granite-muted`): "Fictional training fixtures. Live Granite calls; waits trimmed." | "ShiftProof, on IBM Granite." | Motion graphic | Opus |
| 0:59.5–1:00.0 | — | Hold the end card, then cut | — | — | — |

Captions are burned in, bottom centre, through the whole video. Their text comes from `captions.txt` and their timing from `audio_check.py --srt`.

**On-screen text that isn't in the app** (written by Claude Opus 5.5; any change goes through `COPY.md`):
- The labels `APPRENTICE · 3 ASK`, `1 COMPARE`, `2 REVIEW`, `3 ASK`, `ROLE: VETERAN` and `ROLE: QUALITY LEAD`.
- The bug "Live Granite · fictional training fixtures".
- The chips "Granite call · {n} s, trimmed" and "Typing sped up".
- The tagline "What the work instruction leaves out, reviewed for the next shift."
- The footer "Fictional training fixtures. Live Granite calls; waits trimmed."

Everything else on screen is the app's own text or an exact fixture quote.

## 5. Voiceover script (final)

Source of truth: `vo-script.txt` (spoken forms) and `captions.txt` (written forms). It is 137 words. In the Charon take checked at 2:45 PM the last word ends at 59.3 s.

> **[0:00.3]** An apprentice's first bracket reads two thousandths over. Work instruction one-fourteen, Rev C, says to adjust the wear offset.
>
> **[0:09.7]** The veteran's notes say: wait. A warm part reads long, and chasing the offset makes every part after it short. The instruction doesn't say that.
>
> **[0:20.0]** ShiftProof puts the two side by side. IBM Granite flags what the instruction leaves out, and quotes both sources. The app checks every quote.
>
> **[0:30.0]** Granite asks the veteran a follow-up, then drafts a guide card from the answer. The veteran confirms it. The quality lead approves it.
>
> **[0:40.8]** Back at the machine, the apprentice asks. The answer uses only approved cards, and cites the veteran's words.
>
> **[0:49.5]** No card covers it? Ask your lead or quality.
>
> **[0:53.5]** What the veteran knows, reviewed, at the machine. ShiftProof, on IBM Granite.

Claims check, line by line:
- "reads two thousandths over" matches the app's quick question.
- "says to adjust the wear offset" matches WI-114 Step 7.
- "A warm part reads long..." is attributed to the veteran's notes.
- "flags... quotes both sources" is what Compare does.
- "checks every quote" is `lib/verify.ts`.
- The confirm-then-approve order is enforced in `lib/store.ts`.
- "uses only approved cards, and cites" is the Ask route's server-side filter.
- The refusal is the fixed string.

Nothing claims a part is good, or claims any measured gain.

## 6. Capture checklist (live app)

The full computer-use brief is in `prompts/codex-capture.md`. The person running it does the starred items; Codex drives Chrome.

**Before (4:25 PM for the rehearsal take, 5:00 PM for the final):**
- [ ] ★ `main` pulled after the freeze. `npm --prefix shiftproof run smoke` passes. `npm --prefix shiftproof run dev` runs in a terminal that is **not** recorded.
- [ ] ★ `SHIFTPROOF_OFFLINE` is not set. Open http://localhost:3000 and check the app shows no "Sample output (offline)" banner.
- [ ] ★ Do Not Disturb on, Dock hidden, all other windows closed, no terminal or editor visible.
- [ ] ★ No `.env.local`, IBM Cloud console, watsonx project page or key anywhere on screen.
- [ ] Chrome Guest window, zoom 100%, page area 1280 × 720 CSS px (2560 × 1440 on a Retina screen, scaled down to 1080p in the edit).
- [ ] ★ Screen recording on the Chrome window (`Cmd+Shift+5`, "Show Mouse Clicks").
- [ ] "Reset demo" clicked; Compare tab, role "Veteran".

**During:**
- [ ] Take A, Compare: hold on both panes. Click "Find gaps", wait, scroll each finding.
- [ ] Take B, Review: type the exact expert answer. Draft, confirm as Veteran, switch to Quality lead, approve.
- [ ] Take C, Ask at 375 × 812 (device toolbar): cooling question, then spindle-speed question.
- [ ] Take D: reset and repeat Compare and Review as a spare.

**After, check the takes before you edit:**
- [ ] The source line reads "Granite on watsonx.ai · ibm/granite-4-h-small" in Compare, Review card drafts, and both Ask answers.
- [ ] No "Sample output (offline)" and no "watsonx.ai call failed" anywhere.
- [ ] A finding about letting the part cool before measuring exists at Step 6, with both quotes "verified in source". It is the finding used in S3b and S4a.
- [ ] The Ask answer for the 0.002 in question says to let the part cool and re-measure, cites the approved card, and shows the veteran's words. It doesn't say the part is good. If it does, retake.
- [ ] The spindle-speed answer is the fixed refusal.
- [ ] Codex's log has the real wait for each model call. Those numbers go in the "trimmed" chips.
- [ ] Scrub every frame you'll use for secrets, notifications and personal data.

## 7. Asset list

All media lives **outside git**, in `~/ShiftProof-video/` on the machine that edits (Daniel's or Josh's). Share it through the team drive if Josh edits on his own machine. Nothing below is committed.

| Asset | Path | Made by | Status |
|---|---|---|---|
| Voiceover, beat files and joined | `~/ShiftProof-video/audio/vo-charon.wav`, `vo-charon-<beat>.wav` | Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts`, voice Charon), via `scripts/tts.py` | Rendered with the final cues and checked, 2:45 PM. Josh still has to approve the voice (Open questions) |
| Voiceover, normalised | `~/ShiftProof-video/audio/vo-final.wav` | ffmpeg `loudnorm` | Done: -16.8 LUFS, true peak -1.5 dBTP |
| Captions | `~/ShiftProof-video/audio/vo-final.srt` | `scripts/audio_check.py --srt` (Claude's words, Argon's timings) | Written from the 2:45 PM take (`vo-final.srt`) |
| Motion graphics | `~/ShiftProof-video/motion/` (`S1.mov`, `S2.mov`, `S6.mov`, overlays as PNG with alpha) | Claude Opus 5.5, HTML and CSS on `design/tokens.css`, rendered with headless Chrome and ffmpeg (`prompts/motion-graphics.md`) | To do, before 4:15 PM |
| Live capture, rehearsal | `~/ShiftProof-video/capture/rehearsal-*.mov` | Codex GPT-6.1 Terra (computer use), screen-recorded by a person | At the 4:30 PM freeze check |
| Live capture, final | `~/ShiftProof-video/capture/final-*.mov` | Same | 5:00 PM |
| Codex capture log | `~/ShiftProof-video/capture/codex-log.md` | Codex | With each capture |
| Assembly script | `~/ShiftProof-video/edit/assemble.sh` | Claude Sonnet 5.5 (`prompts/assemble.md`) | To do, before 4:15 PM |
| Export | `~/ShiftProof-video/export/shiftproof-demo.mp4` (H.264, AAC 48 kHz, 1920 × 1080, 30 fps) | ffmpeg | 5:20 PM |
| Raster images | None | — | Not needed. No AI-generated images, so nothing reads as a real shop |
| Music | None | — | Not used. Voice and captions only |

## 8. Production steps, in order

| # | When (ET) | Step | Model or person | Done when |
|---|---|---|---|---|
| 1 | Done, 2:30 PM | Concept, storyboard, voiceover, on-screen text | Claude Opus 5.5 | This plan |
| 2 | Done, 2:45 PM. Redo only if the script or voice changes | Render the voiceover: `python3 -I shiftproof/docs/video/scripts/tts.py Charon ~/ShiftProof-video/audio/vo-charon.wav`. Gemini reads `vo-script.txt` and may not change a word. Listen once. If the voice is wrong, try `Orus`. If one beat reads slowly, redo only that beat with `--only <beat>` | Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts`) | Joined file ends before 59.5 s, no beat overruns its cue. 2:45 PM take: 59.4 s |
| 3 | Done, 2:45 PM | Normalise: `ffmpeg -i vo-charon.wav -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 vo-final.wav` | ffmpeg (no model) | — |
| 4 | Done, 2:45 PM | Check wording, timing and levels, and write captions: `python3 -I shiftproof/docs/video/scripts/audio_check.py ~/ShiftProof-video/audio/vo-final.wav gemini-4-argon --srt ~/ShiftProof-video/audio/vo-final.srt` | Gemini 4 Argon (`gemini-4-argon`); `gemini-4-hydrogen` as the alternative | "All beats OK", levels OK |
| 5 | By 4:15 PM | Build and render the motion graphics: S1, S2, S6, bug, lower thirds, chips, callouts, phone frame (`prompts/motion-graphics.md`) | Claude Opus 5.5 (Fable 5.2 if Opus is unavailable) | Renders reviewed against `DESIGN.md` at full size |
| 6 | By 4:15 PM | Write `assemble.sh`: cuts, speed-ups, overlays, captions, audio, export (`prompts/assemble.md`) | Claude Sonnet 5.5 | A dry-run cut with placeholder clips plays end to end. The file is named `DRYRUN`, and it is never uploaded |
| 7 | 4:30 PM | Rehearsal capture during the MVP freeze check (`prompts/codex-capture.md`) | Codex GPT-6.1 Terra, reasoning medium, computer use; Daniel or Josh records | Capture checklist passes |
| 8 | 4:35 PM | Rough cut from the rehearsal take | Claude Sonnet 5.5 (fill in `assemble.sh` timings from the Codex log) | A full cut exists. **This is the fallback if 5:00 PM goes wrong** |
| 9 | 5:00 PM | Final capture, only if the UI on `main` changed after 4:30 PM. Otherwise keep the rehearsal take; it is live too | Codex GPT-6.1 Terra, medium | Capture checklist passes |
| 10 | 5:10 PM | Final cut with the real wait times in the "trimmed" chips | Claude Sonnet 5.5 runs `assemble.sh`; Josh watches | — |
| 11 | 5:18 PM | Audio check on the export: same command as step 4, on the `.mp4` | Gemini 4 Argon | "All beats OK" |
| 12 | 5:20 PM | Rules check on the export: frames at each shot against sections 2 and 6 (live source line visible, fictional labels, no secrets, exact quotes, no claims) | Claude Opus 5.5 (Daniel's orchestrator session) | PASS, or a list of fixes |
| 13 | 5:25 PM | Upload, unlisted, viewable without sign-in. Paste the URL in the portal and on workbook p. 21 | Josh | URL opens in a private window |
| 14 | After upload | Add the remaining video tools to the README AI-tool list: Codex GPT-6.1 Terra (capture) and Claude Sonnet 5.5 (assembly). Opus, Fable, Gemini TTS and Argon are already listed by this PR. Add Gemini to the submission's tool list with what it did (voiceover) | Daniel's orchestrator (Claude), through a PR | PR merged |

Step 12 is the review gate. Opus didn't produce the export, Sonnet's script did. If Daniel wants a different-family check too, give the same frames to Codex GPT-6.1 Sol (read-only, medium).

## 9. Fable review notes and what changed

Claude Fable 5.2 (subagent, read-only) reviewed draft v0 at about 2:15 PM against the brief in `prompts/fable-review.md`. **Verdict: REVISE.** The single-thread concept held. The opening was dry, three shots were too dense, and the draft described UI the app doesn't render today.

| Fable's finding | Severity | What changed |
|---|---|---|
| The first 3 s were mono text and a step number; the stakes arrived at 0:14, and the "one person" was never named. Open on the apprentice's moment, close on the same frame answered | Top 1 | S1 now opens on the apprentice's 0.002 in question and WI-114 **Step 7** ("adjust the tool wear offset"). S6a returns to that question, answered. New hook: "The instruction says adjust the offset. The veteran says wait." |
| Never show a line added to WI-114; `expected.md` says the instruction isn't changed | Guard | Dropped the "blank line slides in under Step 6" shot. The instruction is only ever quoted as written |
| The shot list described styles the app doesn't render yet (`DESIGN.md`: the app still uses the older styles) | Top 2 | "On screen" now names the app's text and elements by what they say ("verified in source", the status words, the source line), not by component class. The capture checklist verifies them on the real screen. Motion graphics use the design tokens, which is where the app is heading, and stay plain |
| The fixture label appears only on the Compare panes, so later live shots show veteran quotes without it | Top 2 | Persistent bug "Live Granite · fictional training fixtures" from 0:19.8 to 0:53.3. Quote cards carry the label |
| Click 2 and Click 3 too dense (S5a at 200 wpm) | Top 3 | Retimed: Review 0:30–0:40.8, Ask 0:40.8–0:53.3, impact from 0:53.3. Voiceover cut from 144 to 137 words and measured in a real TTS take (59.3 s) |
| "Finds three gaps" is scripted before a nondeterministic call | High | No number in the voiceover: "flags what the instruction leaves out" |
| "In the veteran's words" overclaims; Granite writes the answer | High | Now "cites the veteran's words" |
| Only one call carried the "trimmed" chip | Medium | A chip on every shortened call (Compare, Draft, Ask), with real seconds from Codex's log |
| "Veteran machinist" lower third could read as a real person | Medium | Removed. Quote cards say "Marv K. (fictional)" and "Fictional training fixture" |
| Ten seconds on one static card | Medium | S2 builds two quotes in sequence, with a highlight on "every part after that comes out short" |
| The problem line stated the veteran's claim as fact | Medium | Attributed: "The veteran's notes say: wait." Quotes on screen keep the source's conditions (4 inch bracket, about 40 degrees over) |
| At 375px the answer, card and quotes don't fit one screen | Medium | S5a plans a scroll. The capture checklist verifies it |
| Show the role switch to Quality lead; it proves two people sign | Medium | S4b shows the header role picker changing, with lower third "Demo roles, not real sign-in" |
| Voiceover dropped "Rev C" | Low | Now "Work instruction one-fourteen, Rev C" |
| "Three clicks" is about nine real clicks | Low | Beats are labelled with the app's tabs: 1 Compare, 2 Review, 3 Ask |
| Refusal line didn't match the fixed string | Low | Now "Ask your lead or quality." |
| List Gemini TTS as a tool; test "one-fourteen" | Low | Production step 14. The Argon check confirmed it is spoken as written |

## 10. Risks and fallbacks

| Risk | Fallback |
|---|---|
| Live Granite call fails or hits quota during capture | Retake. If 5:00 PM capture fails, use the 4:30 PM rehearsal take (step 8), which is also live. If both fail, record with `SHIFTPROOF_OFFLINE=1`:<br>- The "Sample output (offline), not a live model call." banner stays visible and uncropped.<br>- The bug changes to "Sample output (offline) · fictional training fixtures".<br>- The voiceover for Compare changes to the fallback line below.<br>Never trim the banner or call it live |
| Granite's live output differs from `expected.md` (no Step 6 cooling finding, or the Ask answer suggests touching the offset) | Reset and retake. Don't use a take whose answer says the part is good or tells the apprentice to change the offset |
| UI restyle (Alex, 3:30 PM) moves things | The capture happens after the freeze on whatever `main` shows; the storyboard names text, not positions. Re-run the capture checklist |
| 375px Ask view needs scrolling | Planned in S5a. The Codex brief scrolls and holds |
| The 30 minutes from 5:00 to 5:30 is too short | Everything except the capture is built before 4:30 PM. The rehearsal cut at 4:35 PM is a complete video |
| Gemini TTS mispronounces something, or the voice feels wrong | Re-render one beat with `tts.py ... --only <beat>`, or try voice `Orus`. Pacing varies by take: one take ran the Impact beat to 60.2 s, and redoing that beat alone brought it back to 59.4 s. Last resort: Josh reads `vo-script.txt` himself; a teammate's voice is allowed |
| Gemini API rate limit (HTTP 429, seen at 2:20 PM) | `tts.py` retries with back-off. Render the voiceover before 3:30 PM, not at 5:00 PM |
| Argon's timestamps drift between runs (about ±0.5 s seen) | Treat cue offsets under 0.5 s as fine. For caption timing, nudge by eye in the edit if a caption lands early |
| The voiceover take's true peak is over 0 dBTP (+4.4 dBTP on the test take) | Step 3 `loudnorm` brings it to -1.5 dBTP, and step 4 re-checks it |
| Something private appears in a frame (notification, bookmark, terminal) | Guest Chrome window, Do Not Disturb, window-only recording, and the frame check in step 12 |
| Codex computer use can't run in this setup (not yet tried) | A person follows `prompts/codex-capture.md` by hand. The steps are written so a person can follow them as-is |
| The cut runs over 60 s | Trim holds in S1, S2 and S6b first. Never add speed to the voice, and never exceed 3:00 |

**Fallback voiceover line for Compare, only if the capture is offline** (Claude Opus 5.5; render with `tts.py` only if needed):

> In this recording, Granite's output is a saved sample, labelled on screen. The app still checks every quote.

## 11. Open questions

Length is decided (section 1), so it is no longer an open question.

1. **Where to host the video.** YouTube unlisted or Google Drive: it must play without sign-in. Josh decides.
2. **Voice.** Gemini's Charon voice (rendered), Orus, or Josh reading it himself. Josh decides after listening to `~/ShiftProof-video/audio/vo-charon.wav`.
3. **watsonx Orchestrate.** `docs/SUBMISSION.md` says the Ask step may move onto a watsonx Orchestrate agent before submission.
   - If it is live at the freeze, check what the Ask source line says in the capture.
   - Daniel decides whether the end card should name Orchestrate as well as Granite; Claude writes the words.
   - The voiceover still holds either way ("uses only approved cards" is enforced by app code).
   - If Orchestrate isn't live, the video doesn't mention it.
4. **For Alex (UI owner). None of these block the video**; it is planned around today's UI, and no app change is requested for it.
   - Ask at 375px: if the cited card and "Veteran's words" could sit closer to the answer, S5a would need less scrolling.
   - Review: the status sits at the top of the card and the confirm and approve buttons at the bottom, so S4b uses crops. A status next to the buttons would read better on camera.
   - Compare: highlighting the quoted spans in the source panes (already in stream 4) would make S3 stronger.

## 12. Model and tool availability (checked 2:10 PM)

| Planned | Available? | Used |
|---|---|---|
| Claude Opus 5.5 (concept, storyboard, script, motion graphics, final rules check) | Yes, this session | Yes |
| Claude Fable 5.2 (review) | Yes, subagent with model `fable` | Yes, draft v0 |
| Gemini voiceover | `gemini` CLI 0.47.0 installed, but it has no speech output. The TTS models are reached through the Gemini API with `GEMINI_API_KEY`: `gemini-3.8-flash-tts` (used), `gemini-3.8-flash-lite-tts`, `gemini-2.5-pro-preview-tts` | Yes, final-cue take |
| Gemini Argon or Hydrogen (audio analysis) | `gemini-4-argon` and `gemini-4-hydrogen` both listed by the API | Argon, every take |
| Codex GPT-6.1 Terra (computer use, image generation) | `codex` CLI 0.162.1; config model `gpt-6.1-terra`; Codex Computer Use app installed | Not yet. Capture is at 4:30 and 5:00 PM. Computer use with this model is untested until then (see risks). No images are needed |
| Claude Sonnet 5.5 (assembly script) | Yes, as a Claude Code subagent with model `sonnet` | Not yet |
| ffmpeg and ffprobe | Installed (Homebrew) | Yes, levels |
