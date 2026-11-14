// Recorded sample output for offline development and as a clearly labeled fallback if watsonx.ai is down.
// The UI must show "Sample output (offline)" whenever these are used. Never present them as live.
import type { AskResult, Card, CardDraft, CompareResult, Finding } from "./schemas";

export const SAMPLE_COMPARE: CompareResult = {
  findings: [
    {
      id: "f1",
      type: "omission",
      topic: "Seat the part before clamping",
      instruction_step: "Step 2",
      instruction_quote: "Clamp the part in the vise against the fixed jaw, on 1/2 in parallels.",
      veteran_quote: "one chip under the part will tip it",
      why_it_matters: "A tipped part can make the pocket out of position or tapered, and the instruction gives no check for seating.",
      follow_up_question: "How do you tell the part is seated, and when is shimming acceptable instead of re-clamping?",
    },
    {
      id: "f2",
      type: "omission",
      topic: "Let the first part cool before measuring",
      instruction_step: "Step 6",
      instruction_quote: "Measure the pocket length with a 2-3 in micrometer.",
      veteran_quote: "A 4 inch bracket that's maybe 40 degrees over shop temperature will read about two thousandths long.",
      why_it_matters: "Measuring a warm part can make a good pocket read long, which leads to a wrong offset change for every part after it.",
      follow_up_question: "How do you know the part has cooled enough to measure, and how long does that usually take?",
    },
    {
      id: "f3",
      type: "ambiguity",
      topic: "Measure the pocket in more than one place",
      instruction_step: "Step 6",
      instruction_quote: "Measure the pocket length with a 2-3 in micrometer.",
      veteran_quote: "I always check the pocket in two places, not one",
      why_it_matters: "A single measurement can miss a tapered pocket caused by a tipped part.",
      follow_up_question: "Where do you take the two measurements, and how much difference between them makes you stop?",
    },
  ],
  confirmed_matches: ["Indicating the fixed jaw (Step 3): the veteran says the sheet has it right."],
};

type SampleKind = "seat" | "two_places" | "cooling";

// Which recorded card fits a finding. Live finding IDs can differ, so match on the words, not the ID.
function kindOf(text: string): SampleKind {
  const t = text.toLowerCase();
  if (/two places|taper|more than one place/.test(t)) return "two_places";
  if (/chip|tip|seat|clamp/.test(t)) return "seat";
  return "cooling";
}

const SAMPLE_DRAFTS: Record<SampleKind, CardDraft> = {
  seat: {
    title: "Seat the bracket before you clamp it",
    scope: "WI-114 Rev C, Op 20, BRK-2207 bracket, Step 2 (clamping in the vise)",
    applies_when: ["Every time you clamp a part in the vise for this operation"],
    do_not_apply_when: ["A different part or procedure revision"],
    steps: [
      "Run your hand along both vise jaws and the parallels and wipe off any chips.",
      "Tap the part down with a dead-blow, then try to slide the parallels.",
      "If either parallel moves, the part isn't seated. Unclamp it and seat it again.",
      "If it still rocks, put a piece of shim stock under the low corner.",
    ],
    escalate_if: ["The part still rocks after you shim it", "You are not sure the part is seated"],
  },
  two_places: {
    title: "Measure the pocket in two places",
    scope: "WI-114 Rev C, Op 20, BRK-2207 bracket, Step 6 (first-article measurement)",
    applies_when: ["You measure the pocket length on a first part"],
    do_not_apply_when: ["A different part or procedure revision"],
    steps: [
      "Measure the pocket in two places, not one.",
      "Compare the two readings before you record anything.",
      "If they differ, the part may have tipped in the vise and the pocket may be tapered.",
    ],
    escalate_if: ["The two readings differ", "You think the part tipped in the vise"],
  },
  cooling: {
    title: "Let the first bracket cool before you measure the pocket",
    scope: "WI-114 Rev C, Op 20, BRK-2207 bracket, Step 6 (first-article measurement)",
    applies_when: ["The first part has just come off the machine", "The part feels warm to the touch"],
    do_not_apply_when: ["A different part or procedure revision", "The part has already sat at shop temperature"],
    steps: [
      "Set the part on the granite plate, or flood it with coolant and wait about ten minutes.",
      "Measure the pocket only after the part is at shop temperature.",
      "If it is still out of tolerance once cool, follow Step 7 of the work instruction.",
    ],
    escalate_if: ["The pocket is still out of tolerance after the part has cooled", "You are not sure the part is at shop temperature"],
  },
};

function matchesDraft(card: CardDraft, draft: CardDraft): boolean {
  const keys = ["title", "scope", "applies_when", "do_not_apply_when", "steps", "escalate_if"] as const;
  return keys.every((k) => JSON.stringify(card[k]) === JSON.stringify(draft[k]));
}

export function sampleDraft(finding: Pick<Finding, "topic" | "veteran_quote">): CardDraft {
  return SAMPLE_DRAFTS[kindOf(`${finding.topic} ${finding.veteran_quote}`)];
}

const SAMPLE_ANSWERS: Record<SampleKind, { test: RegExp; answer: string }> = {
  seat: {
    test: /(clamp|seat|chip|rock|shim|vise|parallel|tip)/,
    answer:
      "Wipe the chips off the vise jaws and the parallels, tap the part down, and try to slide the parallels. If either one moves, unclamp and seat it again. If it still rocks after you shim the low corner, ask your lead.",
  },
  two_places: {
    test: /(two places|taper|one place|both ends|differ)/,
    answer:
      "Measure the pocket in two places, not one, and compare the readings before you record anything. If they differ, the part may have tipped in the vise. Tell your lead before you go on.",
  },
  cooling: {
    test: /(measur|over|long|offset|mic|warm|hot|cool|first part|pocket)/,
    answer:
      "Don't change the wear offset yet. A warm first part can read about two thousandths long, so let it cool to shop temperature and measure again. If it is still over once it's cool, follow Step 7 and tell quality.",
  },
};

// Answers only from the approved cards it is given, and cites the veteran's words from the card it used.
// The recorded answer is used only for an approved card that still says exactly what the recorded draft says.
// An edited card gets the refusal, so a recorded answer never contradicts what quality approved.
// The most specific question wins: "two places" before clamping words, and both before general measuring words.
export function sampleAsk(question: string, approved: Card[]): AskResult {
  const q = question.toLowerCase();
  // Pick the question's topic first. If its card is not approved, or was edited, refuse rather than answer from another card.
  const kind = (["two_places", "seat", "cooling"] as const).find((k) => SAMPLE_ANSWERS[k].test.test(q));
  const card = kind ? approved.find((c) => matchesDraft(c, SAMPLE_DRAFTS[kind])) : undefined;
  const quote = card?.source_quotes.find((s) => s.source === "veteran")?.text;
  if (kind && card && quote) {
    return { in_scope: true, answer: SAMPLE_ANSWERS[kind].answer, missing_information: [], cited_card_ids: [card.id], cited_quotes: [quote] };
  }
  return {
    in_scope: false,
    answer: "No approved guidance covers this yet. Ask your lead or quality before you change anything.",
    missing_information: [],
    cited_card_ids: [],
    cited_quotes: [],
  };
}
