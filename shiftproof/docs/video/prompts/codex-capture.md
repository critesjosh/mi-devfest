# Codex capture brief (computer use, live app)

**Model:** Codex GPT-6.1 Terra, reasoning **medium**. Pin both: `codex -m gpt-6.1-terra -c model_reasoning_effort=medium`, or pick them in the Codex app before you start. Don't rely on the default.
**Tool:** Codex Computer Use (installed at `~/.codex/computer-use`). Give it access to Google Chrome only.
**Who runs it:** Josh or Daniel, after the 5:00 PM feature freeze. The person starts the dev server and the screen recording. Codex only drives Chrome.

Before you paste the prompt, do these yourself:

1. `git switch main && git pull` in the main checkout. Check that `shiftproof/.env.local` exists. Don't open it on screen.
2. In a terminal that won't be recorded: `npm --prefix shiftproof run smoke`, then `npm --prefix shiftproof run dev`. **Don't set `SHIFTPROOF_OFFLINE`.**
3. Turn on Do Not Disturb, hide the Dock, and close every other window.
4. Start the macOS screen recording for the Chrome window: `Cmd+Shift+5` → Record Selected Window, Options → Show Mouse Clicks on. Leave it running for the whole session; the edit trims it.

Then paste the prompt below into Codex. Codex returns a log with the real timings, and the editor uses them to label the trimmed waits.

---

You are driving Google Chrome with computer use to record a demo of a web app running at http://localhost:3000. A person is screen-recording the Chrome window. Your job is clean, deliberate clicks and accurate notes. Nothing else.

Rules:
- Only use Google Chrome, and only `http://localhost:3000`. Don't open any other site, tab, terminal, file, or the IBM Cloud console. Never open `.env.local` or anything that shows a key, token or project ID.
- Don't change any code or files.
- Don't type anything except the exact text given below.
- Move the pointer slowly and pause 1 second before and after every click, so the editor can cut cleanly.
- If any screen shows "Sample output (offline)" or "watsonx.ai call failed", stop and report it. Don't continue: that take can't be used as live.
- Record the wall-clock time (to the second) when you click each button and when its result appears. Read each wait off the clock, not from memory.

Set up:
1. Open a new Chrome window. Use a Guest profile if you can: no bookmarks bar, no extensions. Set zoom to 100%.
2. Resize the window so the page area is 1280 × 720 CSS pixels. Check with DevTools, then close DevTools.
3. Go to http://localhost:3000. Click "Reset demo" in the header and wait until the page settles.

Take A, Compare (desktop):
4. Make sure the role picker in the header says "Veteran" and the "1 Compare" tab is open. Hold still for 3 seconds on the two source panes.
5. Click "Find gaps". Note the time. Wait until the findings appear, and note the time.
6. Check the source line says "Granite on watsonx.ai · ibm/granite-4-h-small" (or the model ID the app shows). Note exactly what it says.
7. Slowly scroll through all findings and hold 2 seconds on each. Note how many findings there are, their topics and steps, and whether each quote shows "verified in source".

Take B, Review (desktop):
8. On the finding about letting the part cool before measuring (Step 6), click the "Expert answer" field and type exactly:
   `About ten minutes on the granite plate, until it feels the same temperature as the plate. I never touch the offset off a warm part.`
9. Click "Draft guide card". Note the click time and the time the card appears.
10. Open "2 Review". Hold 2 seconds on the card and its CANDIDATE status.
11. With the role still "Veteran", click "Confirm my account is accurate". Hold 2 seconds on the new status.
12. Switch the role picker to "Quality lead". Click "Approve for training". Hold 3 seconds on the APPROVED status.

Take C, Ask (phone width):
13. Switch the role picker to "Apprentice". Open "3 Ask".
14. Open DevTools device toolbar (`Cmd+Shift+M`), choose a 375 × 812 viewport, zoom 100%. Reload if the layout doesn't change, and check the role is still "Apprentice".
15. Tap the quick question "My first bracket measured 0.002 over on the pocket. Should I bump the wear offset?" Note the click time and the time the answer appears. Hold 3 seconds on the answer. Scroll so the cited card and the veteran's quoted words are visible, and hold 3 seconds.
16. Tap the quick question "What spindle speed should I run for the roughing pass?" Note the times. Hold 3 seconds on the answer.

Take D, spare (desktop):
17. Close the device toolbar. Click "Reset demo". Repeat steps 4–12 once more, so the editor has a second take.

Report back, as a Markdown table, one row per click: take, step, button, click time, result time, wait in seconds, and exactly what the screen said (status, source line, finding topics, answer heading). Then list anything that looked wrong or different from these steps. Don't summarise what the app does.
