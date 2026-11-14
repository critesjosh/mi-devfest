import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { chatJson, isOffline, modelId } from "@/lib/watsonx";
import { DRAFT_SYSTEM, draftUser } from "@/lib/prompts";
import { CardDraftSchema, type Card } from "@/lib/schemas";
import { PROCEDURE, PROCEDURE_REVISION } from "@/lib/fixtures";
import { sampleDraft } from "@/lib/offline";
import { readState, writeState } from "@/lib/store";
import { err, msgOf, parseBody } from "../_util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ finding_id: z.string().min(1), expert_answer: z.string().default("") });

export async function POST(req: Request) {
  const p = await parseBody(req, Body);
  if (!p.ok) return p.res;
  const { finding_id, expert_answer } = p.data;
  const state = readState();
  const finding = state.compare?.findings.find((f) => f.id === finding_id);
  if (!finding) return err(`Finding "${finding_id}" not found. Run Find gaps first.`, 404);
  if (!finding.instruction_quote_verified || !finding.veteran_quote_verified) {
    return err("This finding has a quote that was not found in the source, so it cannot become a card.", 422);
  }

  let draft = sampleDraft(finding);
  let source: "live" | "sample" = "sample";
  let error: string | undefined;
  if (!isOffline()) {
    try {
      draft = await chatJson(
        DRAFT_SYSTEM,
        draftUser({ procedure: `${PROCEDURE} ${PROCEDURE_REVISION}`, finding, expertAnswer: expert_answer }),
        CardDraftSchema,
      );
      source = "live";
    } catch (e) {
      error = msgOf(e);
    }
  }

  const card: Card = {
    ...draft,
    id: `card-${randomUUID().slice(0, 8)}`,
    finding_id,
    procedure: PROCEDURE,
    procedure_revision: PROCEDURE_REVISION,
    source_quotes: [
      ...(finding.instruction_step === "none" ? [] : [{ source: "instruction" as const, text: finding.instruction_quote }]),
      { source: "veteran" as const, text: finding.veteran_quote },
    ],
    expert_answer,
    status: "candidate",
    updated_at: new Date().toISOString(),
  };
  state.cards.push(card);
  writeState(state);
  return NextResponse.json({ source, model: modelId(), ...(error ? { error } : {}), card });
}
