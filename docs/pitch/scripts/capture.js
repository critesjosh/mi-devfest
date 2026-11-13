// Drives the ShiftProof golden path in offline mode and captures placeholder screenshots for the deck.
// Every capture shows the app's own "Sample output (offline)" banner; nothing is cropped off.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = process.env.BASE || "http://localhost:3000";
const OUT = process.env.OUT || path.join(__dirname, "..", "captures", "shots");
fs.mkdirSync(OUT, { recursive: true });

const EXPERT_ANSWER =
  "About ten minutes on the granite plate, until it feels the same temperature as the plate. I never touch the offset off a warm part.";

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE + "/api/state");
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Server not reachable at " + BASE);
}

async function main() {
  await waitForServer();
  await fetch(BASE + "/api/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });

  const browser = await chromium.launch();

  // Desktop, 1280 wide, 2x for crisp slides.
  const desk = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  const page = await desk.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Find gaps" }).waitFor();
  await page.screenshot({ path: path.join(OUT, "01-compare-sources-1280.png"), fullPage: false });

  await page.getByRole("button", { name: "Find gaps" }).click();
  await page.getByText("verified in source").first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "02-compare-findings-1280-full.png"), fullPage: true });

  // The cooling finding (Step 6) on its own, with the veteran's answer typed in.
  const cooling = page.locator(".finding", { hasText: "cool" }).first();
  await cooling.scrollIntoViewIfNeeded();
  const ta = cooling.locator("textarea");
  await ta.fill(EXPERT_ANSWER);
  await page.waitForTimeout(200);
  await cooling.screenshot({ path: path.join(OUT, "02b-finding-cooling-1280.png") });

  // Draft a card from that finding.
  await cooling.getByRole("button", { name: "Draft guide card" }).click();
  await page.getByRole("heading", { name: "Review guide cards" }).waitFor({ timeout: 30000 });
  await page.locator(".status").first().waitFor();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "03-review-candidate-1280-full.png"), fullPage: true });

  // Veteran confirms.
  await page.getByRole("button", { name: "Confirm my account is accurate" }).click();
  await page.locator(".status.expert_confirmed").waitFor({ timeout: 15000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "04-review-expert-confirmed-1280-full.png"), fullPage: true });

  // Quality lead approves.
  await page.selectOption("#role", "Quality lead");
  await page.getByRole("button", { name: "Approve for training" }).click();
  await page.locator(".status.approved").waitFor({ timeout: 15000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "05-review-approved-1280-full.png"), fullPage: true });
  const cardPanel = page.locator("main .panel").filter({ has: page.locator(".status.approved") }).first();
  await cardPanel.screenshot({ path: path.join(OUT, "05b-card-approved-1280.png") });

  await desk.close();

  // Phone, 375 wide, apprentice.
  const phone = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await phone.newPage();
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.selectOption("#role", "Apprentice");
  await p.getByRole("heading", { name: "Ask about WI-114" }).waitFor();
  await p.screenshot({ path: path.join(OUT, "06-ask-empty-375.png"), fullPage: false });

  await p.locator(".quick button").first().click();
  await p.getByRole("heading", { name: "Answer from approved guidance" }).waitFor({ timeout: 30000 });
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, "07-ask-answer-375-full.png"), fullPage: true });
  const answerPanel = p.locator(".answer-ok");
  await answerPanel.screenshot({ path: path.join(OUT, "07b-ask-answer-panel-375.png") });

  await p.locator(".quick button").nth(1).click();
  await p.getByRole("heading", { name: "Out of scope" }).waitFor({ timeout: 30000 });
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, "08-ask-refusal-375-full.png"), fullPage: true });
  const outPanel = p.locator(".answer-out");
  await outPanel.screenshot({ path: path.join(OUT, "08b-ask-refusal-panel-375.png") });

  await phone.close();
  await browser.close();
  console.log("Captured to", OUT);
  for (const f of fs.readdirSync(OUT)) console.log(" ", f, fs.statSync(path.join(OUT, f)).size, "bytes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
