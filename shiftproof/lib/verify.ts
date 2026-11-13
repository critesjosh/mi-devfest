// Application-side checks. The model proposes; this code decides what is shown as verified.
import type { CheckedFinding, Finding } from "./schemas";

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐‑‒–—−]/g, "-")
    // Keep signs and comparison symbols: "+0.002" and "-0.002" must not match each other.
    .replace(/[^a-z0-9.'"+\-/<>=% ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True if the quote appears in the source (case/whitespace-insensitive). Ellipses split the quote into parts, which must appear in order. */
export function quoteAppears(quote: string, source: string) {
  const src = normalize(source);
  const parts = quote
    .split(/\.\.\.|…/)
    .map(normalize)
    .filter((p) => p.length > 0);
  if (parts.length === 0) return false;
  let from = 0;
  for (const p of parts) {
    const at = src.indexOf(p, from);
    if (at === -1) return false;
    from = at + p.length;
  }
  return true;
}

export function checkFindings(findings: Finding[], instruction: string, veteran: string): CheckedFinding[] {
  return findings.map((f) => ({
    ...f,
    instruction_quote_verified: f.instruction_step === "none" || quoteAppears(f.instruction_quote, instruction),
    veteran_quote_verified: quoteAppears(f.veteran_quote, veteran),
  }));
}
