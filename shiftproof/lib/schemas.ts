import { z } from "zod";

export const FindingSchema = z.object({
  id: z.string(),
  type: z.enum(["omission", "ambiguity", "conflict"]),
  topic: z.string(),
  instruction_step: z.string().describe("e.g. 'Step 6' or 'none'"),
  instruction_quote: z.string(),
  veteran_quote: z.string(),
  why_it_matters: z.string(),
  follow_up_question: z.string(),
});
export type Finding = z.infer<typeof FindingSchema>;

export const CompareResultSchema = z.object({
  findings: z.array(FindingSchema),
  confirmed_matches: z.array(z.string()).default([]),
});
export type CompareResult = z.infer<typeof CompareResultSchema>;

/** Loose shape for the raw model reply: findings are checked one by one so a single malformed one doesn't sink the rest. */
export const CompareReplySchema = z.object({
  findings: z.array(z.unknown()),
  confirmed_matches: z.array(z.string()).default([]),
});

/** Keep only findings that match the schema and actually carry a veteran quote and a follow-up question. */
export function keepUsableFindings(raw: unknown[]): { findings: Finding[]; dropped: number } {
  const findings: Finding[] = [];
  for (const r of raw) {
    const p = FindingSchema.safeParse(r);
    if (!p.success) continue;
    const fu = p.data.follow_up_question.trim().toLowerCase();
    if (!p.data.veteran_quote.trim() || !fu || fu === "none" || fu === "n/a") continue;
    findings.push(p.data);
  }
  return { findings, dropped: raw.length - findings.length };
}

/** A finding after the app has checked that its quotes really appear in the sources. */
export type CheckedFinding = Finding & {
  instruction_quote_verified: boolean;
  veteran_quote_verified: boolean;
};

export const CardStatus = z.enum(["candidate", "expert_confirmed", "approved"]);
export type CardStatus = z.infer<typeof CardStatus>;

export const CardDraftSchema = z.object({
  title: z.string(),
  scope: z.string(),
  applies_when: z.array(z.string()),
  do_not_apply_when: z.array(z.string()),
  steps: z.array(z.string()),
  escalate_if: z.array(z.string()),
});
export type CardDraft = z.infer<typeof CardDraftSchema>;

export const CardSchema = CardDraftSchema.extend({
  id: z.string(),
  finding_id: z.string(),
  procedure: z.string(),
  procedure_revision: z.string(),
  source_quotes: z.array(z.object({ source: z.enum(["instruction", "veteran"]), text: z.string() })),
  expert_answer: z.string().default(""),
  status: CardStatus,
  confirmed_by: z.string().optional(),
  approved_by: z.string().optional(),
  updated_at: z.string(),
});
export type Card = z.infer<typeof CardSchema>;

export const AskResultSchema = z.object({
  in_scope: z.boolean(),
  answer: z.string(),
  missing_information: z.array(z.string()).default([]),
  cited_card_ids: z.array(z.string()).default([]),
  cited_quotes: z.array(z.string()).default([]),
});
export type AskResult = z.infer<typeof AskResultSchema>;
