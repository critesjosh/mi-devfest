// Generates design/tokens.css from design/tokens.json. Run: node design/build-tokens.mjs
// Never edit tokens.css by hand; change tokens.json and rerun.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const t = JSON.parse(readFileSync(join(here, "tokens.json"), "utf8"));

const resolve = (v, theme) =>
  v.replace(/\{([a-z-]+)\}/g, (_, ref) => {
    const tok = t.color.tokens.find((x) => x.name === ref);
    if (!tok) throw new Error(`Unknown token reference {${ref}}`);
    return resolve(tok.value[theme], theme);
  });
const colors = (theme) =>
  t.color.tokens.map((c) => `  --${c.name}: ${resolve(c.value[theme], theme)};`).join("\n");
const flat = ["spacing", "radius", "border", "size"]
  .flatMap((g) => t[g].tokens.map((x) => `  --${x.name}: ${x.value};`))
  .join("\n");
const fonts = Object.entries(t.type.families)
  .map(([k, v]) => `  --font-${k}: ${v};`)
  .join("\n");

const css = `/* ShiftProof — generated from tokens.json */
:root {
${colors("light")}
${fonts}
${flat}
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${colors("dark").replace(/^/gm, "  ")}
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
${colors("dark")}
  color-scheme: dark;
}
`;
writeFileSync(join(here, "tokens.css"), css);
console.log("Wrote design/tokens.css");
