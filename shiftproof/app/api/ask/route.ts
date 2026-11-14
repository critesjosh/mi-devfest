import { NextResponse } from "next/server";
import { z } from "zod";
import { chatJson, isOffline, modelId } from "@/lib/watsonx";
import { ASK_SYSTEM, askUser } from "@/lib/prompts";
import { AskResultSchema, type AskResult } from "@/lib/schemas";
import { PROCEDURE, PROCEDURE_REVISION } from "@/lib/fixtures";
import { sampleAsk } from "@/lib/offline";
import { quoteAppears } from "@/lib/verify";
import { approvedCardsFor, readState } from "@/lib/store";
import { buildReply } from "@/lib/reply";
import { err, msgOf, parseBody } from "../_util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ question: z.string().trim().min(1, "Type a question first.").max(1000) });

export async function POST(req: Request) {
  const p = await parseBody(req, Body);
  if (!p.ok) return p.res;
  const { question } = p.data;
  const approved = approvedCardsFor(PROCEDURE, PROCEDURE_REVISION, readState().cards);

  if (approved.length === 0) {
    const body = {
      source: "none" as const,
      model: modelId(),
      in_scope: false,
      no_guidance: true,
      answer: `No approved guidance for ${PROCEDURE} yet. Ask your lead or quality.`,
      missing_information: [],
      cited_cards: [],
      cited_quotes: [],
    };
    return NextResponse.json({ ...body, reply: buildReply(body) });
  }

  let result: AskResult;
  let source: "live" | "sample" = "sample";
  let error: string | undefined;
  result = sampleAsk(question, approved);
  if (!isOffline()) {
    try {
      result = AskResultSchema.parse(await chatJson(ASK_SYSTEM, askUser(JSON.stringify(approved, null, 2), question), AskResultSchema));
      source = "live";
    } catch (e) {
      error = msgOf(e);
    }
  }

  // The model answered from the approved cards as they were. If any of them was edited, re-approved or withdrawn
  // meanwhile, its old text may be in the answer, so don't show it.
  const now = new Map(approvedCardsFor(PROCEDURE, PROCEDURE_REVISION, readState().cards).map((c) => [c.id, c.updated_at]));
  if (approved.some((c) => now.get(c.id) !== c.updated_at)) {
    return err("A guide card changed while this answer was being written. Ask again.", 409);
  }
  const byId = new Map(approved.map((c) => [c.id, c]));
  const citedCards = result.in_scope ? result.cited_card_ids.filter((id, i, a) => byId.has(id) && a.indexOf(id) === i).map((id) => byId.get(id)!) : [];
  // An answer is shown only when it cites at least one approved card and says something. Otherwise the app, not the model,
  // writes the refusal, so an injected question can't put its own text on the apprentice's screen.
  const grounded = result.in_scope && citedCards.length > 0 && result.answer.trim().length > 0;
  // The quotes shown under "Veteran's words" are the cited cards' own veteran quotes, copied from the card, never the
  // model's string: a model "quote" can be a fragment, or the work instruction's words. Quotes the model matched come first.
  const veteranQuotes = citedCards.flatMap((c) => c.source_quotes.filter((s) => s.source === "veteran").map((s) => s.text));
  const matched = (t: string) => result.cited_quotes.some((q) => quoteAppears(q, t));
  const quotes = grounded ? [...new Set([...veteranQuotes.filter(matched), ...veteranQuotes])] : [];

  const body = {
    source,
    model: modelId(),
    in_scope: grounded,
    no_guidance: false,
    answer: grounded ? result.answer : "No approved guidance covers this. Ask your lead or quality.",
    missing_information: grounded ? result.missing_information : [],
    cited_cards: citedCards.map((c) => ({ id: c.id, title: c.title, status: c.status })),
    cited_quotes: quotes,
  };
  return NextResponse.json({ ...body, ...(error ? { error } : {}), reply: buildReply(body) });
}
