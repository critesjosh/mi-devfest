import { NextResponse } from "next/server";
import { z } from "zod";
import { CardStatus } from "@/lib/schemas";
import { canAdvance, readState, writeState } from "@/lib/store";
import { err, parseBody } from "../../../_util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ to: CardStatus });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const p = await parseBody(req, Body);
  if (!p.ok) return p.res;
  const state = readState();
  const card = state.cards.find((c) => c.id === id);
  if (!card) return err(`Card "${id}" not found.`, 404);
  if (!canAdvance(card.status, p.data.to)) {
    return err(`Cannot move a ${card.status} card to ${p.data.to}. Cards move one step at a time: candidate, expert_confirmed, approved.`, 409);
  }
  card.status = p.data.to;
  if (p.data.to === "expert_confirmed") card.confirmed_by = "Marv K. (veteran)";
  if (p.data.to === "approved") card.approved_by = "Quality lead";
  card.updated_at = new Date().toISOString();
  writeState(state);
  return NextResponse.json({ card });
}
