// Writes the deck's theme colours and fonts into ppt/theme/theme1.xml after pptxgenjs has written the file,
// so scheme colours (text1, text2, accent1...) resolve to the ShiftProof tokens instead of Office's stock palette.
const fs = require("fs");
const JSZip = require("jszip");

async function applyTheme(file, theme) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const name = "ppt/theme/theme1.xml";
  let xml = await zip.file(name).async("string");
  for (const [slot, hex] of Object.entries(theme.colors)) {
    xml = xml.replace(new RegExp(`<a:${slot}>[\\s\\S]*?</a:${slot}>`), `<a:${slot}><a:srgbClr val="${hex}"/></a:${slot}>`);
  }
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  xml = xml.replace(/(<a:majorFont>\s*<a:latin typeface=")[^"]*(")/, `$1${esc(theme.headFontFace)}$2`);
  xml = xml.replace(/(<a:minorFont>\s*<a:latin typeface=")[^"]*(")/, `$1${esc(theme.bodyFontFace)}$2`);
  xml = xml.replace(/(<a:clrScheme name=")[^"]*(")/, `$1${esc(theme.name)}$2`);
  zip.file(name, xml);
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}
module.exports = { applyTheme };
