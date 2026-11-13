import { readFileSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data", "fixtures");

function load(name: string) {
  // Strip the HTML comment that labels the file as fictional; the UI shows its own label.
  return readFileSync(path.join(dir, name), "utf8").replace(/<!--[\s\S]*?-->\s*/g, "").trim();
}

export const PROCEDURE = "WI-114";
export const PROCEDURE_REVISION = "Rev C";

export function getFixtures() {
  return { instruction: load("work-instruction.md"), veteran: load("veteran-notes.md") };
}
