import { NextResponse } from "next/server";
import { z } from "zod";
import { readState, writeState } from "@/lib/store";
import { err, parseBody } from "../../_util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  edits: z.object({
    title: z.string().min(1).optional(),
    scope: z.string().optional(),
    steps: z.array(z.string()).optional(),
    applies_when: z.array(z.string()).optional(),
    do_not_apply_when: z.array(z.string()).optional(),
    escalate_if: z.array(z.string()).optional(),
  }),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const p = await parseBody(req, Body);
  if (!p.ok) return p.res;
  const state = readState();
  const card = state.cards.find((c) => c.id === id);
  if (!card) return err(`Card "${id}" not found.`, 404);
  Object.assign(card, p.data.edits);
  card.status = "candidate";
  delete card.confirmed_by;
  delete card.approved_by;
  card.updated_at = new Date().toISOString();
  writeState(state);
  return NextResponse.json({ card });
}
