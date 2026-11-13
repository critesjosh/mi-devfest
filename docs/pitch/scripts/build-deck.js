// ShiftProof pitch deck for Michigan DevFest Hackathon 2026, built with pptxgenjs on the ShiftProof design tokens
// (shiftproof/design/tokens.json): paper, surface, ink, dykem accent, inspection-tag status colours, IBM Plex, square corners.
// Numbers come only from docs/SUBMISSION.md. Quotes are copied word for word from the fixtures.
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require("./apply-theme.js");

const CROPS = path.join(__dirname, "..", "captures", "crops");
const OUT = path.join(__dirname, "..", "ShiftProof-pitch.pptx");

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
/** Fit an image into a box, keeping its aspect ratio, anchored top-left. */
function fit(name, box) {
  const file = path.join(CROPS, name);
  const { w, h } = pngSize(file);
  const r = w / h;
  let W = box.w;
  let H = W / r;
  if (H > box.h) {
    H = box.h;
    W = H * r;
  }
  return { path: file, x: box.x, y: box.y, w: W, h: H };
}

// Theme slots map onto the design tokens.
const THEME = {
  name: "ShiftProof",
  headFontFace: "IBM Plex Sans Condensed",
  bodyFontFace: "IBM Plex Sans",
  colors: {
    dk1: "13171C", // ink
    lt1: "F2F4F6", // paper
    dk2: "48525D", // ink-muted
    lt2: "FFFFFF", // surface
    accent1: "2A44B0", // dykem
    accent2: "17663A", // accept
    accent3: "6A4C00", // hold
    accent4: "A51D17", // reject
    accent5: "1D2228", // granite
    accent6: "E7EBEF", // surface-sunken
    hlink: "2A44B0",
    folHlink: "48525D",
  },
};
// Fills that are not theme slots.
const HEX = {
  ink: "13171C",
  paper: "F2F4F6",
  surface: "FFFFFF",
  sunken: "E7EBEF",
  rule: "8B96A1",
  granite: "1D2228",
  onGranite: "EEF1F4",
  onGraniteMuted: "B4BEC8",
  dykemOnGranite: "9AADFF",
  accept: "17663A",
  acceptBg: "DCF3E4",
  hold: "6A4C00",
  holdBg: "FFF0B3",
  reject: "A51D17",
  rejectBg: "FDE5E2",
  highlight: "FFE073",
  dykem: "2A44B0",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "ShiftProof pitch, Michigan DevFest Hackathon 2026";
pres.author = "ShiftProof team";
const C = pres.SchemeColor;
const MONO = "IBM Plex Mono";
const COND = "IBM Plex Sans Condensed";

const FOOTER = "ShiftProof · Michigan DevFest Hackathon 2026 · All demo documents are fictional training fixtures";

pres.defineSlideMaster({
  title: "PAPER",
  background: { color: HEX.paper },
  objects: [
    {
      placeholder: {
        options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 9, h: 1.0, fontSize: 30, bold: true, color: C.text1, valign: "top", align: "left", margin: 0 },
      },
    },
    { text: { text: FOOTER, options: { x: 0.5, y: 5.2, w: 8.3, h: 0.3, fontSize: 10, color: C.text2, margin: 0, valign: "middle" } } },
  ],
  slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: C.text2, align: "right" },
});
pres.defineSlideMaster({ title: "GRANITE", background: { color: HEX.granite }, objects: [] });

// ---- helpers in the design system's vocabulary ----

/** Uppercase condensed label, like the lettering on a drawing title block. */
function label(slide, text, o) {
  slide.addText(text.toUpperCase(), {
    x: o.x, y: o.y, w: o.w, h: o.h || 0.3,
    fontFace: COND, fontSize: o.size || 11, bold: true,
    color: o.color || C.text2, margin: 0, valign: "middle", align: o.align || "left", isTextBox: true,
  });
}
/** Inspection tag: a bordered chip whose colour always comes with a word. */
function tag(slide, text, o) {
  slide.addText(text.toUpperCase(), {
    shape: pres.ShapeType.rect,
    x: o.x, y: o.y, w: o.w, h: o.h || 0.36,
    fill: { color: o.fill || HEX.surface }, line: { color: o.line || HEX.ink, width: 1.5 },
    fontFace: COND, fontSize: o.size || 11, bold: true,
    color: o.color || HEX.ink, align: "center", valign: "middle", margin: [2, 6, 2, 6],
  });
}
/** Surface panel outlined with a hairline rule. Square corners, no shadow. */
function card(slide, o) {
  slide.addShape(pres.ShapeType.rect, { x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: o.fill || HEX.surface }, line: { color: o.line || HEX.rule, width: 0.75 } });
}
/** Words copied from a source document: mono on the sunken surface. */
function quote(slide, runs, o) {
  slide.addText(runs, {
    shape: pres.ShapeType.rect,
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: HEX.sunken }, line: { color: HEX.sunken, width: 0 },
    fontFace: MONO, fontSize: o.size || 13, color: C.text1, valign: "middle", margin: [6, 8, 6, 8],
  });
}
function bullets(slide, items, o) {
  const runs = items.map((t, i) => ({
    text: t,
    options: { bullet: { indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: o.gap == null ? 8 : o.gap },
  }));
  slide.addText(runs, { x: o.x, y: o.y, w: o.w, h: o.h, fontSize: o.size || 14, color: C.text1, valign: "top", margin: 0, isTextBox: true });
}
function body(slide, text, o) {
  slide.addText(text, { x: o.x, y: o.y, w: o.w, h: o.h, fontSize: o.size || 14, bold: !!o.bold, color: o.color || C.text1, valign: o.valign || "top", align: o.align || "left", margin: 0, isTextBox: true, fontFace: o.fontFace });
}
function caption(slide, text, o) {
  body(slide, text, { ...o, size: 10, color: C.text2 });
}
function arrowDown(slide, x, y, h) {
  slide.addShape(pres.ShapeType.line, { x, y, w: 0, h, line: { color: HEX.ink, width: 1.5, endArrowType: "triangle" } });
}
function arrowRight(slide, x, y, w) {
  slide.addShape(pres.ShapeType.line, { x, y, w, h: 0, line: { color: HEX.ink, width: 1.5, endArrowType: "triangle" } });
}

// ==================================================================
// 1. Title
// ==================================================================
pres.addSection({ title: "Opening" });
let s = pres.addSlide({ masterName: "GRANITE", sectionTitle: "Opening" });
label(s, "Michigan DevFest Hackathon 2026 · Manufacturing track", { x: 0.6, y: 0.6, w: 8.8, h: 0.3, color: HEX.onGraniteMuted, size: 12 });
s.addText("ShiftProof", { x: 0.6, y: 1.35, w: 8.8, h: 1.1, fontFace: COND, fontSize: 60, bold: true, color: HEX.onGranite, margin: 0, isTextBox: true });
s.addText("What the work instruction leaves out, reviewed for the next shift.", { x: 0.6, y: 2.5, w: 8.8, h: 0.7, fontSize: 22, color: HEX.onGranite, margin: 0, isTextBox: true });
s.addText("Josh · Daniel · Alex · Jason", { x: 0.6, y: 4.15, w: 8.8, h: 0.35, fontSize: 14, color: HEX.onGranite, margin: 0, isTextBox: true });
s.addText("Built on IBM Granite on watsonx.ai · ibm/granite-4-h-small", { x: 0.6, y: 4.55, w: 8.8, h: 0.35, fontFace: MONO, fontSize: 12, color: HEX.onGraniteMuted, margin: 0, isTextBox: true });
s.addNotes(
  "0:00 to 0:05. Say the name and the one line: ShiftProof. What the work instruction leaves out, reviewed for the next shift. Then go straight to the problem.",
);

// ==================================================================
// 2. Problem (20 s)
// ==================================================================
s = pres.addSlide({ masterName: "PAPER", sectionTitle: "Opening" });
s.addText("The instruction says adjust the offset. The veteran says wait.", { placeholder: "title" });

card(s, { x: 0.5, y: 1.4, w: 4.4, h: 3.15 });
label(s, "Work instruction WI-114 Rev C · Step 7", { x: 0.65, y: 1.52, w: 4.1 });
quote(
  s,
  [{ text: "If the pocket is out of tolerance, " }, { text: "adjust the tool wear offset", options: { highlight: HEX.highlight } }, { text: " and rerun." }],
  { x: 0.65, y: 1.9, w: 4.1, h: 1.0, size: 14 },
);
body(s, "Step 6 says to measure the pocket. It does not say when.", { x: 0.65, y: 3.05, w: 4.1, h: 0.6, size: 14, color: C.text2 });
tag(s, "Fictional training fixture", { x: 0.65, y: 4.1, w: 2.3, h: 0.32, size: 9, line: HEX.rule, color: HEX.ink });

card(s, { x: 5.1, y: 1.4, w: 4.4, h: 3.15 });
label(s, "Veteran notes · Marv K. (fictional)", { x: 5.25, y: 1.52, w: 4.1 });
quote(s, [{ text: "A 4 inch bracket that's maybe 40 degrees over shop temperature will read about two thousandths long." }], { x: 5.25, y: 1.9, w: 4.1, h: 0.95, size: 13 });
quote(
  s,
  [
    { text: "I've watched new guys measure it hot, see it over, chase the wear offset, and then " },
    { text: "every part after that comes out short", options: { highlight: HEX.highlight } },
    { text: " once it cools." },
  ],
  { x: 5.25, y: 2.95, w: 4.1, h: 1.1, size: 13 },
);
tag(s, "Fictional training fixture", { x: 5.25, y: 4.1, w: 2.3, h: 0.32, size: 9, line: HEX.rule, color: HEX.ink });

body(s, "An apprentice who follows the sheet to the letter can still make scrap.", { x: 0.5, y: 4.65, w: 9, h: 0.45, size: 18, bold: true });
s.addNotes(
  "0:05 to 0:25, the problem. An apprentice's first bracket reads two thousandths over. Work instruction WI-114, Rev C, says: adjust the wear offset. The veteran's notes say: wait. A warm aluminum part reads long, and chasing the offset makes every part after it short. The instruction doesn't say that. That is the gap: machinists carry know-how the written instruction leaves out, and when they retire or move shifts it leaves with them.",
);

// ==================================================================
// 3. Why we care (20 s)
// ==================================================================
s = pres.addSlide({ masterName: "PAPER", sectionTitle: "Opening" });
s.addText("Every retirement is a knowledge handoff, and most shops have no system for it", { placeholder: "title" });

const tiles = [
  { big: "583,000", small: "manufacturing workers in Michigan", src: "Michigan LEO, Oct 2026 ¹" },
  { big: "1 in 4", small: "US manufacturing workers are 55 or older (25.2%)", src: "BLS CPS table 18b, 2025 ²" },
  { big: "1 in 3", small: "machine shop workers are 55 or older (31.6%)", src: "BLS CPS table 18b, 2025 ²" },
];
tiles.forEach((t, i) => {
  const x = 0.5 + i * 3.2;
  card(s, { x, y: 1.45, w: 2.9, h: 2.0 });
  s.addText(t.big, { x: x + 0.2, y: 1.55, w: 2.5, h: 0.75, fontFace: COND, fontSize: 40, bold: true, color: C.text1, margin: 0, valign: "middle", isTextBox: true });
  body(s, t.small, { x: x + 0.2, y: 2.32, w: 2.5, h: 0.65, size: 14 });
  caption(s, t.src, { x: x + 0.2, y: 3.02, w: 2.5, h: 0.3 });
});
body(
  s,
  "Machinists carry know-how the written work instruction leaves out: how to seat a part, when a measurement can be trusted, where to check twice. When a veteran retires or moves shifts, that knowledge leaves with them.",
  { x: 0.5, y: 3.65, w: 9, h: 0.95, size: 15 },
);
caption(
  s,
  "¹ Michigan Department of Labor and Economic Opportunity, Oct 2026. ² US Bureau of Labor Statistics, Current Population Survey table 18b, 2025. The age figures are national, not Michigan-specific.",
  { x: 0.5, y: 4.68, w: 9, h: 0.45 },
);
s.addNotes(
  "0:25 to 0:45, why we care. Michigan has about 583,000 manufacturing workers. Nationally a quarter of manufacturing workers are 55 or older, and in machine shops it is closer to a third. Say the age numbers are national, not Michigan-specific, if asked. Every one of those retirements is a knowledge handoff, and a 30-person shop has nobody to run a documentation program. The veteran should only have to talk.",
);

// ==================================================================
// 4. The demo in three clicks (10 s, stays up if the demo runs live)
// ==================================================================
pres.addSection({ title: "Demo" });
s = pres.addSlide({ masterName: "PAPER", sectionTitle: "Demo" });
s.addText("The demo is three clicks: Compare, Review, Ask", { placeholder: "title" });

const steps = [
  {
    head: "1 Compare",
    who: "Veteran",
    text: "Granite reads the work instruction beside the veteran's notes. It flags what the instruction leaves out, quotes both sources, and asks a follow-up question. The app checks every quote.",
  },
  {
    head: "2 Review",
    who: "Veteran · Quality lead",
    text: "Granite drafts a guide card from the veteran's answer. The veteran confirms it. The quality lead approves it. A card only moves forward.",
  },
  {
    head: "3 Ask",
    who: "Apprentice",
    text: "At the machine, on a phone. The answer comes only from approved cards and cites the veteran's words. Nothing approved covers it? Ask your lead or quality.",
  },
];
steps.forEach((st, i) => {
  const x = 0.5 + i * 3.2;
  card(s, { x, y: 1.45, w: 2.9, h: 3.2 });
  s.addShape(pres.ShapeType.rect, { x, y: 1.45, w: 2.9, h: 0.5, fill: { color: HEX.ink }, line: { color: HEX.ink, width: 0 } });
  s.addText(st.head.toUpperCase(), {
    x: x + 0.2, y: 1.45, w: 2.5, h: 0.5, fontFace: COND, fontSize: 16, bold: true,
    color: HEX.onGranite, align: "left", valign: "middle", margin: 0, isTextBox: true,
  });
  tag(s, st.who, { x: x + 0.2, y: 2.1, w: st.who.length > 12 ? 2.2 : 1.3, h: 0.32, size: 9 });
  body(s, st.text, { x: x + 0.2, y: 2.58, w: 2.5, h: 1.95, size: 14 });
});
body(s, "The work instruction itself never changes. ShiftProof adds reviewed context next to it.", { x: 0.5, y: 4.78, w: 9, h: 0.35, size: 14, color: C.text2 });
s.addNotes(
  "0:45 to 0:55. Three clicks. Compare finds the gap. Review turns it into a card two people sign off. Ask gives the apprentice an answer from approved cards only. If the live demo runs, leave this slide up and drive the app; the next three slides are the fallback and show the same path.",
);

// ==================================================================
// 5. Compare
// ==================================================================
s = pres.addSlide({ masterName: "PAPER", sectionTitle: "Demo" });
s.addText("Compare: Granite flags what the instruction leaves out, and the app checks every quote", { placeholder: "title" });
const finding = fit("finding.png", { x: 3.35, y: 1.45, w: 6.15, h: 3.2 });
s.addImage(finding);
bullets(
  s,
  [
    "WI-114 Rev C beside the veteran's notes, both labelled fictional",
    "One finding per gap: omission, ambiguity or conflict",
    "Both quotes copied word for word, and each one verified against its source by the app",
    "A follow-up the veteran can answer from experience",
  ],
  { x: 0.5, y: 1.45, w: 2.65, h: 3.3 },
);
caption(s, "Placeholder capture from the app in offline mode. Replace with the live run from the freeze check.", { x: 3.35, y: finding.y + finding.h + 0.08, w: 6.15, h: 0.3 });
s.addNotes(
  "0:55 to 1:25, Compare. The work instruction sits beside the veteran's notes. Click Find gaps. Granite flags the cooling gap at Step 6, quotes both sources, and the app stamps each quote verified in source. If a quote is not found in the source, the finding is marked and cannot become a card. Then Granite asks the veteran a follow-up, and the veteran types a plain answer.",
);

// ==================================================================
// 6. Review
// ==================================================================
s = pres.addSlide({ masterName: "PAPER", sectionTitle: "Demo" });
s.addText("Review: the veteran confirms, quality approves, and the order can't be skipped", { placeholder: "title" });
const top = fit("card-top.png", { x: 3.6, y: 1.45, w: 5.9, h: 2.0 });
s.addImage(top);
const bottom = fit("card-bottom.png", { x: 3.6, y: top.y + top.h + 0.12, w: 5.9, h: 1.05 });
s.addImage(bottom);
caption(s, "Placeholder capture from the app in offline mode. Replace with the live run from the freeze check.", { x: 3.6, y: bottom.y + bottom.h + 0.08, w: 5.9, h: 0.3 });

tag(s, "Candidate", { x: 0.5, y: 1.45, w: 2.3, h: 0.36 });
arrowDown(s, 1.65, 1.84, 0.22);
tag(s, "Expert confirmed", { x: 0.5, y: 2.09, w: 2.3, h: 0.36, fill: HEX.holdBg, line: HEX.hold, color: HEX.hold });
arrowDown(s, 1.65, 2.48, 0.22);
tag(s, "Approved", { x: 0.5, y: 2.73, w: 2.3, h: 0.36, fill: HEX.acceptBg, line: HEX.accept, color: HEX.accept });
bullets(
  s,
  ["Granite drafts the card from the veteran's answer", "Any edit sends the card back to candidate", "Skipping a step is rejected by the server"],
  { x: 0.5, y: 3.3, w: 2.9, h: 1.6 },
);
s.addNotes(
  "1:25 to 1:50, Review. Granite drafts a guide card from the answer: scope, steps, when it applies, when it doesn't, when to escalate. The veteran confirms the account is accurate. Switch role to Quality lead and approve it for training. Status goes candidate, expert confirmed, approved, one step at a time, and any edit sends it back to the start. The server rejects a skipped step. The work instruction itself never changes.",
);

// ==================================================================
// 7. Ask
// ==================================================================
s = pres.addSlide({ masterName: "PAPER", sectionTitle: "Demo" });
s.addText("Ask: the apprentice gets an answer from approved cards only, or a refusal", { placeholder: "title" });
label(s, "Approved guidance", { x: 0.5, y: 1.45, w: 2.6, h: 0.28, size: 9 });
const ans = fit("ask-answer.png", { x: 0.5, y: 1.78, w: 2.45, h: 3.05 });
s.addImage(ans);
label(s, "Out of scope", { x: 3.15, y: 1.45, w: 2.6, h: 0.28, size: 9 });
const ref = fit("ask-refusal.png", { x: 3.15, y: 1.78, w: 2.45, h: 1.6 });
s.addImage(ref);
caption(s, "Placeholder captures, offline mode, 375 px wide. Replace with the live run.", { x: 3.15, y: ref.y + ref.h + 0.1, w: 2.5, h: 0.5 });
bullets(
  s,
  [
    "The apprentice asks in their own words, on a phone at the machine",
    "The answer uses only approved cards for WI-114 Rev C and cites the veteran's words",
    "Nothing approved covers it? The app says so and sends them to a lead. No guesses, no invented numbers.",
    "No approved card, no model call",
  ],
  { x: 5.9, y: 1.45, w: 3.6, h: 3.4 },
);
s.addNotes(
  "1:50 to 2:15, Ask. Back at the machine, the apprentice asks: my first bracket measured 0.002 over, should I bump the wear offset? The answer comes only from the approved card: let it cool, measure again, then follow the work instruction. It cites the veteran's own words. Then the spindle-speed question: no approved card covers it, so the app says so and sends them to a lead. It never invents a number, and it never says a part is good. That is quality's call.",
);

// ==================================================================
// 8. How it works (30 s)
// ==================================================================
pres.addSection({ title: "How it works" });
s = pres.addSlide({ masterName: "PAPER", sectionTitle: "How it works" });
s.addText("Granite proposes. App code decides.", { placeholder: "title" });

const flow = [
  { head: "Sources", text: "Work instruction and veteran notes, as text" },
  { head: "Granite proposes", text: "Finds gaps, asks follow-ups, drafts cards, answers" },
  { head: "App code checks", text: "Quotes, status order, scope, citations" },
  { head: "People decide", text: "Veteran confirms. Quality lead approves." },
];
flow.forEach((f, i) => {
  const x = 0.5 + i * 2.35;
  card(s, { x, y: 1.4, w: 1.95, h: 1.35, fill: i === 2 ? HEX.sunken : HEX.surface, line: i === 2 ? HEX.ink : HEX.rule });
  body(s, f.head, { x: x + 0.12, y: 1.48, w: 1.75, h: 0.3, size: 14, bold: true });
  body(s, f.text, { x: x + 0.12, y: 1.8, w: 1.75, h: 0.9, size: 14 });
  if (i < flow.length - 1) arrowRight(s, x + 1.98, 2.07, 0.34);
});
caption(s, "IBM Granite ibm/granite-4-h-small on watsonx.ai · Next.js and TypeScript · model JSON validated with zod", { x: 0.5, y: 2.8, w: 9, h: 0.25 });
label(s, "Trust rules, enforced in app code, not in the prompt", { x: 0.5, y: 3.06, w: 9, h: 0.26 });
const rules = [
  "Every quote is checked against its source. A finding with an unverified quote can't become a card.",
  "Cards move one way: candidate, expert confirmed, approved. The server rejects a skipped step.",
  "Ask uses only approved cards for WI-114 Rev C. When none exist, the model isn't called at all.",
  "Citations are filtered on the server, and the app writes the refusal itself, never the model.",
];
rules.forEach((r, i) => {
  const x = 0.5 + (i % 2) * 4.6;
  const y = 3.36 + Math.floor(i / 2) * 0.92;
  card(s, { x, y, w: 4.4, h: 0.84 });
  s.addText(String(i + 1), { x: x + 0.12, y: y + 0.22, w: 0.4, h: 0.4, shape: pres.ShapeType.rect, fill: { color: HEX.ink }, line: { color: HEX.ink, width: 0 }, fontFace: COND, fontSize: 14, bold: true, color: HEX.onGranite, align: "center", valign: "middle", margin: 0 });
  body(s, r, { x: x + 0.65, y: y + 0.06, w: 3.68, h: 0.72, size: 14, valign: "middle" });
});
s.addNotes(
  "2:15 to 2:45, how it works. Next.js and TypeScript, with IBM Granite on watsonx.ai, ibm/granite-4-h-small. Granite reads and drafts. The app decides what counts: it checks every quote against the source, it only lets a card move forward, it only answers from approved cards for the right revision, and it filters citations on the server. If nothing is approved, Granite isn't even called. On a shop floor a confident wrong answer is worse than no answer, so those rules live in code, not in the prompt.",
);

// ==================================================================
// 9. Limits and next (15 s)
// ==================================================================
s = pres.addSlide({ masterName: "PAPER", sectionTitle: "How it works" });
s.addText("Limits today, and what comes next", { placeholder: "title" });
card(s, { x: 0.5, y: 1.45, w: 4.4, h: 3.45 });
label(s, "Limits today", { x: 0.7, y: 1.57, w: 4.0 });
bullets(
  s,
  [
    "Demo roles, not real sign-in. The review order is enforced in code; who clicks is a demo switch.",
    "One procedure, one revision: WI-114 Rev C, a fictional fixture.",
    "Text in, no audio capture yet.",
    "Checks pass by hand. Scripted acceptance tests are in progress.",
  ],
  { x: 0.7, y: 1.95, w: 4.0, h: 2.85, size: 14, gap: 10 },
);
card(s, { x: 5.1, y: 1.45, w: 4.4, h: 3.45 });
label(s, "Next", { x: 5.3, y: 1.57, w: 4.0 });
bullets(
  s,
  [
    "Voice capture, so a veteran can talk through a job at the machine",
    "Ingest real manuals and work instructions with Docling",
    "Block reuse when a procedure revision changes",
    "Move the Ask step and the veteran-to-quality hand-off onto watsonx Orchestrate",
    "watsonx.governance for audit trails",
  ],
  { x: 5.3, y: 1.95, w: 4.0, h: 2.85, size: 14, gap: 10 },
);
s.addNotes(
  "2:45 to 3:00, limits and next. Be straight about what it doesn't do yet: demo roles, one revision, text only, scripted tests still in progress. Next is voice capture so the veteran talks instead of types, real manuals through Docling, blocking reuse when a revision changes, and moving Ask and the hand-offs onto watsonx Orchestrate. Don't say Orchestrate is wired up: as of this deck it isn't.",
);

// ==================================================================
// 10. Close
// ==================================================================
pres.addSection({ title: "Close" });
s = pres.addSlide({ masterName: "GRANITE", sectionTitle: "Close" });
s.addText("What the veteran knows, reviewed, at the machine.", { x: 0.6, y: 1.3, w: 8.8, h: 1.3, fontFace: COND, fontSize: 40, bold: true, color: HEX.onGranite, margin: 0, valign: "middle", isTextBox: true });
label(s, "ShiftProof · built on IBM Granite on watsonx.ai", { x: 0.6, y: 2.8, w: 8.8, h: 0.3, color: HEX.onGraniteMuted, size: 12 });
s.addText("github.com/critesjosh/mi-devfest", { x: 0.6, y: 3.25, w: 8.8, h: 0.4, fontFace: MONO, fontSize: 16, color: HEX.dykemOnGranite, margin: 0, isTextBox: true, hyperlink: { url: "https://github.com/critesjosh/mi-devfest" } });
s.addText("Josh · Daniel · Alex · Jason", { x: 0.6, y: 4.15, w: 8.8, h: 0.35, fontSize: 14, color: HEX.onGranite, margin: 0, isTextBox: true });
s.addText("AI tools used are listed in the repo README. All demo documents are fictional training fixtures.", { x: 0.6, y: 4.55, w: 8.8, h: 0.35, fontSize: 12, color: HEX.onGraniteMuted, margin: 0, isTextBox: true });
s.addNotes("Hold this slide for questions. The repo has the code, the fixtures, the design system and the AI-tool disclosure.");

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("Wrote", OUT, fs.statSync(OUT).size, "bytes");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
