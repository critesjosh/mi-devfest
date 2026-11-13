# Submission text

Text for the hackathon portal. Owner: Josh. Drafted with Claude Opus 5.5.

## Written problem and solution statement

*Portal limit: 500 words. This statement is 478.*

Michigan has about 583,000 manufacturing workers, and nationally a quarter of them are 55 or older. In machine shops it's closer to a third. Machinists carry know-how the written work instruction leaves out: how to seat a part, when a measurement can be trusted, where to check twice. When a veteran retires or moves shifts, that knowledge leaves with them. An apprentice who follows the sheet to the letter can still make scrap.

**The scenario.** Our demo uses WI-114 Rev C, a fictional work instruction for an aluminum bracket. A veteran's notes on the same job add three things the instruction never says. Seat the part and shim it if it rocks. Let the first part cool before measuring it, because a warm 4-inch aluminum part reads about 0.002 in long. Measure the pocket in two places. An apprentice who sees a pocket 0.002 over might bump the wear offset, and every part after that comes out wrong.

**The solution.** ShiftProof turns that gap into reviewed guidance in three steps.

1. **Compare.** IBM Granite reads the work instruction beside the veteran's notes. It flags what the instruction leaves out, quotes both sources, and asks the veteran a follow-up question instead of just summarizing. The app checks that every quote really appears in its source.
2. **Review.** The veteran answers the follow-up, Granite drafts a guide card, the veteran confirms it, and a quality lead approves it. A card can only move forward, from candidate to expert-confirmed to approved, and any edit sends it back to the start. The work instruction itself never changes.
3. **Ask.** At the machine, on a phone, an apprentice asks a question in their own words: "My first bracket measured 0.002 over. Should I bump the wear offset?" The answer comes only from approved cards for that procedure revision: let the part cool and re-measure first. It cites the veteran's own words. If nothing approved covers the question, such as a spindle speed, ShiftProof says so and sends the apprentice to a lead instead of guessing.

**Why it can be trusted.** On a shop floor, a confident wrong answer is worse than no answer, so the trust rules live in app code, not in the prompt. Quotes are verified against the sources. Unapproved findings never appear as guidance. Text hidden in a source document can't skip approval. When no approved card exists, Ask doesn't call the model at all. The AI reads and drafts; people make every decision that matters.

**Who it helps.** Veterans get their know-how preserved and credited without writing a manual. Quality leads decide what becomes guidance. Apprentices get answers they can trust at the machine.

**Next steps:** voice capture so veterans can talk instead of type, ingesting real manuals with Docling, blocking reuse when a procedure revision changes, and watsonx.governance for audit trails.

All demo documents are fictional training fixtures.

*Sources for the numbers: [Michigan LEO, Oct 2026](https://www.michigan.gov/leo/news/2026/10/05/michigan-manufacturing-industry-fuels-career-and-economic-growth) (583,000 workers) and [BLS CPS table 18b, 2025](https://www.bls.gov/cps/cpsaat18b.htm) (25.2% of US manufacturing workers and 31.6% in machine shops are 55+). Both figures for age are national, not Michigan-specific. See `ideas/shop-floor-knowledge-capture.md`.*

## Written statement on technology

**IBM Bob.** We built ShiftProof with IBM Bob as a coding assistant alongside our other AI tools. We list every AI tool we used in the repo's README, and our commit messages say which tool wrote each change.

**watsonx Orchestrate.** The core of ShiftProof is IBM Granite (`ibm/granite-4-h-small`) on watsonx.ai. Granite compares a work instruction against a veteran's notes, drafts guide cards, and answers apprentice questions. We're moving the Ask step onto a watsonx Orchestrate agent: approved guide cards become the agent's knowledge base, so an apprentice's question pulls only from guidance a veteran confirmed and a quality lead approved. Orchestrate also fits the hand-offs between people in the workflow, routing a draft card from the veteran to quality for approval. Next is voice capture through Watson Speech to Text, so a veteran can talk through a job at the machine and Orchestrate passes the transcript into Compare.

Whatever runs the model, ShiftProof's trust rules live in our app code, not the prompt. Every quote is checked against its source. A card can't skip a review step. Citations are filtered on the server. When no approved guidance exists, the model isn't called at all.

> **Before submitting:** as of this draft the app calls Granite directly and doesn't call Orchestrate. If the Orchestrate agent is live by submission, replace "We're moving the Ask step onto…" with "The Ask step runs as a watsonx Orchestrate agent whose knowledge base is the set of approved guide cards…". Add what Bob built to the Bob paragraph if you want more detail.
