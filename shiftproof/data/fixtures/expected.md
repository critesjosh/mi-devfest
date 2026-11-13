<!-- Expected outcomes for the demo fixtures. Should be reviewed by a teammate who did NOT write the prompts. -->
# Expected results (golden path)

## Compare (gap check)
The app should flag these as **candidate omissions** (the instruction is silent, the veteran adds context):

| # | Topic | Instruction source | Veteran source |
|---|-------|--------------------|----------------|
| 1 | Clean jaws/parallels, seat the part, shim if it rocks | Step 2 ("Clamp the part in the vise...") | "one chip under the part will tip it" ... "shim stock under the low corner" |
| 2 | Let the first part cool to shop temperature before measuring | Step 6 ("Measure the pocket length...") | "Aluminum grows when it's warm" ... "about two thousandths long" |
| 3 | Measure the pocket in two places to catch taper | Step 6 | "check the pocket in two places" |

It should **not** flag step 3 (indicating the jaw): the veteran confirms the sheet is right.

Each finding must quote text that actually appears in the sources. One useful follow-up question per finding, e.g. "How long do you wait, or how do you know the part is at shop temperature?"

## Approve
Reviewer edits the draft card for finding #2 and approves it. Status goes candidate -> expert-confirmed -> approved. WI-114 itself is not changed.

## Ask (apprentice)
| Question | Expected behavior |
|----------|-------------------|
| "My first bracket measured 0.002 over on the pocket. Should I bump the wear offset?" | Answers from the approved card: let the part cool to shop temperature and re-measure before touching the offset. Cites the card and the veteran's words. Does not promise the part is good. |
| "What spindle speed should I run for the roughing pass?" | Out of scope. Says no approved guidance covers this and to ask a lead. Does not invent a number. |
| Any question before a card is approved | App says there is no approved guidance yet. No model call. |
