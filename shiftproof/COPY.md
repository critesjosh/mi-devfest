# Copy contract

**Read this before you add, change or remove any text a person sees**, including API error strings and `lib/prompts.ts`. It applies to every agent, model provider and teammate. Design rules are in [`DESIGN.md`](DESIGN.md).

This is the copy contract for ShiftProof. It covers every word a person sees: buttons, labels, headings, notes, banners, errors, empty states, fixed strings in the API routes, and the model output that `lib/prompts.ts` shapes. Agents and people from any team or model provider follow it.

## Who may change copy

- Only Anthropic models (Claude) or a person on the team write user-facing copy. Other models (Codex, Gemini, DeepSeek and others) may change logic and layout, but must not add, reword or remove user-facing text. If a change needs new text, leave the existing string or a clearly marked placeholder, and list the string you need under "Copy needed" in your summary or PR description.
- Every copy change needs approval from the project owner (Daniel) before it ships. List each changed string under "Copy changes" in the PR description: the old text, the new text, where it appears, and why.
- A prompt change in `lib/prompts.ts` that changes what Granite says to a user counts as a copy change.

## Readers

- **Veteran machinist.** Decades on the machines. Respect that. Use their words, not office words.
- **Quality lead.** Needs to see what is approved, by whom, and from which source.
- **Apprentice.** Reads on a phone at the machine. Short sentences, one action each.

## Voice

- Plain and direct, like a good lead explaining a job. Short sentences. Active voice. Second person ("you") when you speak to the reader.
- Shop words: part, pocket, offset, mic, first article, work instruction, step, lead, quality. Not "asset", "workflow", "insight", "knowledge base", "AI-powered", "smart" or "magic".
- No exclamation marks, emoji, jokes, hedging ("might possibly"), or apologies ("Sorry", "Oops").
- No marketing claims. Say what the screen does.
- Sentence case for headings and buttons. Uppercase only through the `label` style for tags and stamps.

## Trust rules (never break these)

1. **Never say or imply a part is good, in tolerance, or ready for production.** That is quality's decision. Never tell the reader to change an offset, a setting or the program unless an approved card says so.
2. **Never present sample output as live.** Sample output always shows: "Sample output (offline), not a live model call." Live output shows: "Granite on watsonx.ai · {model ID}".
3. **Quotes are exact.** Text in a source quote is copied word for word from the source. Never paraphrase inside quotation marks, fix the veteran's grammar, or merge quotes.
4. **"Verified in source" only when the app verified it.** Never write "verified", "approved" or "confirmed" for something that has not passed that check or status.
5. **When there is no approved answer, send the reader to a person.** Use the fixed refusal: "No approved guidance covers this. Ask your lead or quality." Don't guess, and don't add a number.
6. **Fictional fixtures stay labelled.** Demo documents carry "Fictional training fixture".

## Words we use

| Use | Not | Notes |
|---|---|---|
| work instruction, WI-114 Rev C | SOP, manual, procedure doc | Always with the revision. |
| veteran notes, the veteran's account | transcript, interview, tribal knowledge | |
| finding | insight, issue, discrepancy | One gap between the two sources. |
| gap | delta, diff | As in "Find gaps". |
| omission, ambiguity, conflict | missing, unclear, contradiction | The three finding types, shown as labels. |
| follow-up question | prompt, query | |
| expert answer | response, feedback | What the veteran types. |
| guide card | knowledge card, tip, article | |
| candidate, expert confirmed, approved | draft, pending, published | The three statuses, in this order, exactly. |
| quality lead | QA, reviewer, admin | |
| apprentice | junior, user, operator | |
| approved guidance | knowledge base, AI answer | |
| Step 6 | step six, #6 | Steps are numbered as in the work instruction. |

## Numbers and units

- Inches as `in` with a space: `0.002 in`, `2.500 in +/- 0.001 in`, `2-3 in micrometer`. Set them in the `data` style.
- In the app's own words, write thousandths as numbers (`0.002 in`). Inside a quote, keep the veteran's words ("about two thousandths long").
- Times as the source gives them ("about ten minutes"). Never round, convert or add precision the source doesn't have.

## Patterns

- **Buttons** start with a verb and name the result: "Find gaps", "Draft guide card", "Save edits", "Confirm my account is accurate", "Approve for training", "Ask question", "Reset demo". Not "Submit", "OK", "Continue" or "Go".
- **Busy states** reuse the verb: "Finding gaps...", "Drafting...", "Saving...", "Confirming...", "Approving...", "Asking...".
- **Errors** say what failed and what the screen shows instead, without blame: "watsonx.ai call failed: {reason} Showing sample output." Validation errors say what to do: "Type a question first."
- **Empty states** say what will appear and how to get it: "No cards yet. Find gaps, then draft a guide card from a verified finding."
- **Rule notes** explain a disabled control in one line: "Saving edits sends the card back to candidate. Confirm needs the Veteran role; approve needs the Quality lead role."
- **Refusals** use the fixed strings below. Never write a new refusal.

## Fixed strings (approved)

Change these only through the approval process above.

| Where | String |
|---|---|
| Ask, no approved cards yet | No approved guidance for {procedure} yet. Ask your lead or quality. |
| Ask, out of scope or uncited | No approved guidance covers this. Ask your lead or quality. |
| Ask, intro note | Answers come only from approved guide cards. |
| Sample banner | Sample output (offline), not a live model call. |
| Live source line | Granite on watsonx.ai · {model ID} |
| Quote check passed | verified in source |
| Quote check failed | quote not found in source |
| Unverified finding | Unverified. This finding cannot become a card. |
| Card blocked (API) | This finding has a quote that was not found in the source, so it cannot become a card. |
| Wrong-order approval (API) | Cannot move a {status} card to {status}. Cards move one step at a time: candidate, expert_confirmed, approved. |
| Header note | Demo roles, not real sign-in |
| Fixture label | Fictional training fixture |

## Before you ship copy

- [ ] It follows the trust rules.
- [ ] It uses the words in the table above.
- [ ] Buttons are verbs; errors say what to do next.
- [ ] Numbers carry units and match the source.
- [ ] It reads clearly at 375px wide.
- [ ] It was written by Claude or a teammate, and the owner approved it.
