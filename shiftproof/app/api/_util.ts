import { NextResponse } from "next/server";
import type { ZodTypeAny, z } from "zod";

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<{ ok: true; data: z.output<S> } | { ok: false; res: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, res: err("Request body must be JSON.") };
  }
  const r = schema.safeParse(raw);
  if (!r.success) {
    const msg = r.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ");
    return { ok: false, res: err(`Invalid request. ${msg}`) };
  }
  return { ok: true, data: r.data };
}

export function msgOf(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
