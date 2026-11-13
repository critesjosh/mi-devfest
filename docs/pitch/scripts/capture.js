// Drives the ShiftProof golden path and captures screenshots for the deck.
// Run it against live Granite. In offline mode every capture shows the app's "Sample output (offline)" banner.
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
  await page.getByText("verified in source").first().waitFor({ timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "02-compare-findings-1280-full.png"), fullPage: true });

  // The cooling finding on its own, with the veteran's answer typed in.
  const cooling = page.locator("article.sp-finding", { hasText: /cool|warm|therm/i }).first();
  await cooling.scrollIntoViewIfNeeded();
  await cooling.locator("textarea").fill(EXPERT_ANSWER);
  await page.mouse.click(5, 5);
  await page.waitForTimeout(300);
  await cooling.screenshot({ path: path.join(OUT, "02b-finding-cooling-1280.png") });

  // Draft a card from that finding. The app moves to Review.
  await cooling.getByRole("button", { name: "Draft guide card" }).click();
  const card = page.locator("article.sp-card").first();
  await card.waitFor({ timeout: 60000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, "03-review-candidate-1280-full.png"), fullPage: true });

  // Veteran confirms.
  await card.getByRole("button", { name: "Confirm my account is accurate" }).click();
  await card.getByText("expert confirmed").first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "04-review-expert-confirmed-1280-full.png"), fullPage: true });

  // Quality lead approves.
  await page.selectOption("#role", "Quality lead");
  await card.getByRole("button", { name: "Approve for training" }).click();
  await card.getByText("Approved by").waitFor({ timeout: 15000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "05-review-approved-1280-full.png"), fullPage: true });
  await card.screenshot({ path: path.join(OUT, "05b-card-approved-1280.png") });
  // The card's head (status, title, scope, steps) and its tail (source quotes, sign-off), for the slide.
  const box = await card.boundingBox();
  const form = await card.locator(".sp-card__form").boundingBox();
  const quotes = await card.getByText("Source quotes").boundingBox();
  const sign = await card.locator(".sp-card__sign").boundingBox();
  // boundingBox() is relative to the viewport; a full-page clip needs page coordinates.
  const sy = await page.evaluate(() => window.scrollY);
  for (const b of [box, form, quotes, sign]) b.y += sy;
  await page.screenshot({ path: path.join(OUT, "05c-card-top-1280.png"), fullPage: true, clip: { x: box.x, y: box.y, width: box.width, height: form.y + form.height - box.y + 8 } });
  await page.screenshot({ path: path.join(OUT, "05d-card-bottom-1280.png"), fullPage: true, clip: { x: box.x, y: quotes.y - 16, width: box.width, height: sign.y + sign.height - quotes.y + 32 } });

  await desk.close();

  // Phone, 375 wide, apprentice.
  const phone = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await phone.newPage();
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.selectOption("#role", "Apprentice");
  await p.locator(".sp-quick__btn").first().waitFor();
  await p.screenshot({ path: path.join(OUT, "06-ask-empty-375.png"), fullPage: false });

  await p.locator(".sp-quick__btn").first().click();
  await p.getByText("Answer from approved guidance").waitFor({ timeout: 60000 });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(OUT, "07-ask-answer-375-full.png"), fullPage: true });
  await p.locator("section.sp-answer").screenshot({ path: path.join(OUT, "07b-ask-answer-panel-375.png") });

  await p.locator(".sp-quick__btn").nth(1).click();
  await p.locator("section.sp-answer--out").waitFor({ timeout: 60000 });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(OUT, "08-ask-refusal-375-full.png"), fullPage: true });
  await p.locator("section.sp-answer--out").screenshot({ path: path.join(OUT, "08b-ask-refusal-panel-375.png") });

  await phone.close();
  await browser.close();
  console.log("Captured to", OUT);
  for (const f of fs.readdirSync(OUT)) console.log(" ", f, fs.statSync(path.join(OUT, f)).size, "bytes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
