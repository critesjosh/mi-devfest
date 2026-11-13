// Run: npm run smoke   (reads .env.local if present)
// Checks IBM Cloud sign-in and that the chosen Granite model answers.
const key = process.env.WATSONX_API_KEY;
const project = process.env.WATSONX_PROJECT_ID;
const base = (process.env.WATSONX_URL || "https://us-south.ml.cloud.ibm.com").replace(/\/$/, "");
const model = process.env.WATSONX_MODEL_ID || "ibm/granite-4-h-small";
if (!key || !project) {
  console.error("Set WATSONX_API_KEY and WATSONX_PROJECT_ID (see .env.example).");
  process.exit(1);
}
const tok = await fetch("https://iam.cloud.ibm.com/identity/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "urn:ibm:params:oauth:grant-type:apikey", apikey: key }),
});
if (!tok.ok) {
  console.error("IAM sign-in failed:", tok.status, await tok.text());
  process.exit(1);
}
const { access_token } = (await tok.json()) as { access_token: string };
console.log("IAM sign-in OK");
const res = await fetch(`${base}/ml/v1/text/chat?version=2024-10-08`, {
  method: "POST",
  headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model_id: model,
    project_id: project,
    max_tokens: 30,
    messages: [{ role: "user", content: "Reply with the single word: ready" }],
  }),
});
const text = await res.text();
if (!res.ok) {
  console.error(`Chat call failed for model ${model}:`, res.status, text.slice(0, 500));
  console.error(
    "If the model isn't found, list chat models at:",
    `${base}/ml/v1/foundation_model_specs?version=2024-10-08&filters=function_text_chat`,
  );
  process.exit(1);
}
console.log(`Model ${model} replied:`, JSON.parse(text).choices?.[0]?.message?.content);
