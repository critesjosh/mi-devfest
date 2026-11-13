# Fable review prompt (concept and storyboard)

Model: Claude Fable 5.2 (`fable`), run as a Claude Code subagent, read-only. Effort: the agent's default; the user pinned no effort for this delegate.
Used: Nov 13, 2026, about 2:15 PM ET, on draft v0 of the storyboard (draft v0 is kept in the PR history, not in the repo; the final version is `PLAN.md`).

---

You are reviewing the concept and storyboard for a one-minute hackathon demo video. You are read-only: don't edit files. Return a critique, not a rewrite.

Read first, in the repository at `<worktree>`:
- `shiftproof/README.md`: what the product does
- `shiftproof/COPY.md`: voice and trust rules; they apply to every word in the video
- `shiftproof/DESIGN.md`: the visual system the video must match
- `shiftproof/data/fixtures/*.md`: the fictional work instruction, veteran notes and expected results
- the draft: `<scratchpad>/draft-v0.md`

The event rules (Michigan DevFest 2026 workbook, pages 21–23, and keynote page 22):
- One-minute demo video. The workbook template has six 10-second beats: the user (0:00), the problem (0:10), click 1 (0:20), click 2 (0:30), click 3 (0:40), the impact (0:50). The keynote says: "Same structure for your one-minute video: user, problem, three clicks through the solution, impact." It also says to show the product working for the one person you built it for: three clicks, one clear outcome.
- The submission needs the video URL, IBM/Google tools listed with what each does, a public repo with no keys.

Hard rules the video must follow:
- Never present sample (offline) output as live. The capture is the live Granite path.
- Show no secrets or IBM Cloud console pages.
- The fixtures are fictional and the veteran is not a real person. Never imply otherwise.
- No claim ShiftProof can't back up. Never say a part is good or safe. Never claim measured worker-performance gains.
- No app code changes for the video.
- The Review step uses this exact expert answer: "About ten minutes on the granite plate, until it feels the same temperature as the plate. I never touch the offset off a warm part."

Judge the draft on:
1. **Captivating:** does the first 3 seconds earn the next 57? Is there one clear thread a judge remembers afterwards? Where does attention sag?
2. **Compelling:** does a judge come away believing it works live, and that it is trustworthy, not just another chatbot?
3. **Rules:** any breach of the hard rules or COPY.md (words, claims, quotes not exact, fictional status hidden, sample-vs-live honesty).
4. **Feasibility:** can each shot be captured from the real app in one afternoon? Is any shot too dense for its seconds? Is the voiceover too long for the time (count words; ~150 words per minute is a natural pace)? Name the tightest shots.
5. **Workbook fit:** does each beat land where the template puts it?

Return, in this order:
- A verdict in one line: SHIP AS IS, REVISE or RETHINK.
- The three highest-impact changes, each with the reason and a concrete replacement (new shot, new timing or new line). Mark any replacement wording as a suggestion; the author (Opus) writes the final words.
- Then any other findings, each with severity (high, medium, low), shot ID, problem, and fix.
- Word count of the voiceover, and the estimated read time at 150 wpm.

Keep it under 700 words.
