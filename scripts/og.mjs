// `node scripts/og.mjs`: render frames of public/animations/og.lottie-source (scripts/animations/og.mjs)
// through the engine and write public/og/default.png (frame 0) and docs.png (frame 1).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, initEngine } from "./animations/lib.mjs";
import { build } from "./animations/og.mjs";
import { encodePng } from "./png.mjs";

await initEngine();
const doc = build();
mkdirSync(join(ROOT, "public/og"), { recursive: true });
for (const [file, frame] of [["default", 0], ["docs", 1]]) {
  writeFileSync(join(ROOT, "public/og", `${file}.png`), encodePng(doc.e.render(frame, 1200, 630), 1200, 630));
}
doc.e.free();
console.log("public/og/default.png public/og/docs.png");
