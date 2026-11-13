# Assembly script brief

**Model:** Claude Sonnet 5.5 (Claude Code subagent, model `sonnet`, default effort). This is routine scripting; it adds no words.
**Due:** 4:15 PM for the dry run, then rerun at 4:35 PM and 5:10 PM with real clips.
**Output:** `~/ShiftProof-video/edit/assemble.sh` and `~/ShiftProof-video/edit/shots.tsv`, outside git.

---

Write a bash script, `assemble.sh`, that builds the ShiftProof demo video from a shot list with ffmpeg, so the final cut can be rebuilt in a minute when a clip changes.

Inputs, all under `~/ShiftProof-video/`:
- `edit/shots.tsv`, one row per shot. Columns:
  - `id`
  - `start` (video time, seconds)
  - `dur`
  - `file`
  - `in` (seconds into the source)
  - `speed` (1 = real time; 4 for sped-up typing)
  - `crop` (`w:h:x:y` in source pixels, or `-`)
  - `overlays` (comma-separated PNG or ProRes 4444 files with alpha, each `file@offset`)
- `audio/vo-final.wav` (already normalised) and `audio/vo-final.srt`.
- `motion/*.mov` for S1, S2 and S6.

Rules:
- Output `export/shiftproof-demo.mp4`: 1920 × 1080, 30 fps, H.264 (`-crf 18 -preset slow -pix_fmt yuv420p`), AAC 48 kHz 192 kb/s, `+faststart`.
- Scale live captures to fit 1920 × 1080 with `lanczos` after the crop. The Ask capture (375 wide) goes inside the phone frame overlay, centred, not stretched.
- Burn in captions from the `.srt` with the `subtitles` filter. Font: IBM Plex Sans, 36 px, `ink` text on a `surface` box at 90% opacity, bottom centre, 64 px margin. Read the colour values from `shiftproof/design/tokens.css`, don't type them.
- Mix only the voiceover. Mute the screen-capture audio.
- Fail if the total runs past 60.0 s, and print the total.
- When `DRYRUN=1`, use solid-colour placeholders for missing clips, with the shot ID drawn on them, and name the output `export/DRYRUN-shiftproof-demo.mp4`.
- Don't add transitions beyond hard cuts, plus the 200 ms fades already in the motion graphics.
- Don't write or change any on-screen text. All text comes from the overlays and the `.srt`.
- Support `OFFLINE=1` for the offline fallback (PLAN.md section 10). It switches the whole cut, never part of it:
  - voiceover and captions come from `audio/vo-offline-final.wav` and `.srt`;
  - the bug overlay is the offline one, and `S6b-offline.mov` replaces `S6b.mov`;
  - every "Granite call" chip overlay is dropped;
  - the output is `export/shiftproof-demo-OFFLINE.mp4`.

  The script must refuse to mix live and offline inputs.

Fill in `shots.tsv` from the storyboard in `shiftproof/docs/video/PLAN.md` section 4, using its times. Leave `file` and `in` as `TODO` for live shots until the capture exists.

Return the two files, the dry-run command and its output (total length), and nothing else. Don't commit.
