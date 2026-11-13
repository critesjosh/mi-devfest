// Minimal watsonx.ai chat client: IBM Cloud IAM token -> /ml/v1/text/chat.
import type { ZodTypeAny, z } from "zod";

type Msg = { role: "system" | "user" | "assistant"; content: string };

let cachedToken: { value: string; expiresAt: number } | null = null;

export function isOffline() {
  return process.env.SHIFTPROOF_OFFLINE === "1" || !process.env.WATSONX_API_KEY;
}

export function modelId() {
  return process.env.WATSONX_MODEL_ID || "ibm/granite-4-h-small";
}

async function iamToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.value;
  const res = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: process.env.WATSONX_API_KEY ?? "",
    }),
  });
  if (!res.ok) throw new Error(`IBM Cloud sign-in failed (${res.status}). Check WATSONX_API_KEY.`);
  const body = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return body.access_token;
}

export async function chat(messages: Msg[], maxTokens = 1200): Promise<string> {
  const base = (process.env.WATSONX_URL || "https://us-south.ml.cloud.ibm.com").replace(/\/$/, "");
  const res = await fetch(`${base}/ml/v1/text/chat?version=2024-10-08`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await iamToken()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model_id: modelId(),
      project_id: process.env.WATSONX_PROJECT_ID,
      messages,
      max_tokens: maxTokens,
      temperature: 0,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`watsonx.ai request failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  const body = (await res.json()) as { choices: { message: { content: string } }[] };
  return body.choices?.[0]?.message?.content ?? "";
}

/** Pull the first JSON object out of a model reply (tolerates code fences or stray prose). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Model reply contained no JSON object.");
  return JSON.parse(candidate.slice(start, end + 1));
}

/** Call the model, parse and validate JSON; on a bad reply, retry once with the error fed back. */
export async function chatJson<S extends ZodTypeAny>(system: string, user: string, schema: S): Promise<z.output<S>> {
  const messages: Msg[] = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const reply = await chat(messages);
    try {
      return schema.parse(extractJson(reply));
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      messages.push({ role: "assistant", content: reply });
      messages.push({
        role: "user",
        content: `That reply was not valid for the required JSON shape (${lastError.slice(0, 300)}). Reply again with JSON only.`,
      });
    }
  }
  throw new Error(`Model did not return valid JSON after a retry: ${lastError}`);
}
