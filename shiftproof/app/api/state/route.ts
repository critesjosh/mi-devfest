import { NextResponse } from "next/server";
import { getFixtures } from "@/lib/fixtures";
import { readState } from "@/lib/store";
import { isOffline, modelId } from "@/lib/watsonx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ fixtures: getFixtures(), state: readState(), offline: isOffline(), model: modelId() });
}
