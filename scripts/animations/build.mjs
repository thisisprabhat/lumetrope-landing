// `pnpm animations`: regenerate every .lottie in public/animations and its poster.
// Each sibling module that exports `name` and `build()` (returning a Doc) is one
// output file; helpers (lib, icon-kit, preview) export no `build` and are skipped.
// Pass names to build only some: `pnpm animations lumi cta`.
import { readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ROOT, initEngine, writeAnimation } from "./lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const only = new Set(process.argv.slice(2));
const skip = new Set(["build.mjs", "lib.mjs", "preview.mjs"]);

await initEngine();
for (const file of readdirSync(here).filter((f) => f.endsWith(".mjs") && !skip.has(f)).sort()) {
  const mod = await import(pathToFileURL(join(here, file)).href);
  if (typeof mod.build !== "function" || !mod.name) continue;
  if (only.size && !only.has(mod.name)) continue;
  const doc = mod.build();
  const out = writeAnimation(mod.name, doc, mod.options);
  doc.e.free();
  console.log(`${relative(ROOT, out.anim)}  ${relative(ROOT, out.poster)}`);
}
