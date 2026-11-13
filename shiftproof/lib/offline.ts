// Recorded sample output for offline development and as a clearly labeled fallback if watsonx.ai is down.
// The UI must show "Sample output (offline)" whenever these are used. Never present them as live.
import type { AskResult, CardDraft, CompareResult } from "./schemas";

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

export const SAMPLE_DRAFT: CardDraft = {
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
};

export function sampleAsk(question: string, cardId: string): AskResult {
  const q = question.toLowerCase();
  const inScope = /(measur|over|long|offset|mic|warm|hot|cool|first part|pocket)/.test(q);
  if (!inScope) {
    return {
      in_scope: false,
      answer: "No approved guidance covers this yet. Ask your lead or quality before you change anything.",
      missing_information: [],
      cited_card_ids: [],
      cited_quotes: [],
    };
  }
  return {
    in_scope: true,
    answer:
      "Don't change the wear offset yet. A warm first part can read about two thousandths long, so let it cool to shop temperature and measure again. If it is still over once it's cool, follow Step 7 and tell quality.",
    missing_information: [],
    cited_card_ids: [cardId],
    cited_quotes: ["A 4 inch bracket that's maybe 40 degrees over shop temperature will read about two thousandths long."],
  };
}
