import { NextResponse } from "next/server";
import { chatJson, isOffline, modelId } from "@/lib/watsonx";
import { COMPARE_SYSTEM, compareUser } from "@/lib/prompts";
import { CompareReplySchema, keepUsableFindings } from "@/lib/schemas";
import { getFixtures } from "@/lib/fixtures";
import { checkFindings } from "@/lib/verify";
import { SAMPLE_COMPARE } from "@/lib/offline";
import { readState, writeState } from "@/lib/store";
import { msgOf } from "../_util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const { instruction, veteran } = getFixtures();
  let result = SAMPLE_COMPARE;
  let source: "live" | "sample" = "sample";
  let error: string | undefined;
  let dropped = 0;
  if (!isOffline()) {
    try {
      const reply = await chatJson(COMPARE_SYSTEM, compareUser(instruction, veteran), CompareReplySchema);
      const kept = keepUsableFindings(reply.findings);
      if (reply.findings.length > 0 && kept.findings.length === 0) throw new Error("Model returned no usable findings.");
      result = { findings: kept.findings, confirmed_matches: reply.confirmed_matches };
      dropped = kept.dropped;
      source = "live";
    } catch (e) {
      error = msgOf(e);
    }
  }
  const findings = checkFindings(result.findings, instruction, veteran);
  const compare = { findings, confirmed_matches: result.confirmed_matches, offline: source === "sample", at: new Date().toISOString() };
  const state = readState();
  state.compare = compare;
  writeState(state);
  return NextResponse.json({ source, model: modelId(), ...(error ? { error } : {}), dropped_findings: dropped, findings, confirmed_matches: result.confirmed_matches });
}
