// Builds the complete Ask reply as plain text, for channels that show text only (the watsonx Orchestrate agent).
// The server assembles it from fields it has already checked, so no model downstream writes or rewords it.
// It adds no words of its own: only the answer, card titles, verified quotes and the fixed source strings in COPY.md.

export type ReplyParts = {
  source: "live" | "sample" | "none";
  model: string;
  in_scope: boolean;
  answer: string;
  missing_information: string[];
  cited_cards: { title: string }[];
  cited_quotes: string[];
};

export function buildReply(p: ReplyParts): string {
  const lines: string[] = [p.answer];
  if (p.in_scope) {
    lines.push(...p.missing_information);
    lines.push(...p.cited_cards.map((c) => c.title));
    lines.push(...p.cited_quotes.map((q) => `"${q}"`));
  }
  if (p.source === "live") lines.push(`Granite on watsonx.ai · ${p.model}`);
  if (p.source === "sample") lines.push("Sample output (offline), not a live model call.");
  return lines.filter((l) => l.trim()).join("\n\n");
}
