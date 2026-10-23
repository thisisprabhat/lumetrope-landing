// Rebuilds the Lumetrope WASM engine and vendors it into src/engine/vendor.
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(process.env.LUMETROPE_REPO ?? "/Users/prabhatkumar/Projects/creations/apps/lottie_editor");
const vendor = join(root, "src/engine/vendor");
const tmp = mkdtempSync(join(tmpdir(), "lumetrope-wasm-"));
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: "inherit" });
const out = (args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();

run("wasm-pack", ["build", "crates/wasm", "--target", "web", "--release", "--out-dir", tmp], repo);
mkdirSync(vendor, { recursive: true });
for (const f of ["lumetrope_wasm.js", "lumetrope_wasm_bg.wasm", "lumetrope_wasm.d.ts", "lumetrope_wasm_bg.wasm.d.ts"]) {
  copyFileSync(join(tmp, f), join(vendor, f));
}
const commit = out(["rev-parse", "--short", "HEAD"]);
const dirty = out(["status", "--porcelain"]) !== "";
const src = readFileSync(join(repo, "apps/web/src/gpu/CanvasRenderer.ts"), "utf8");
writeFileSync(
  join(vendor, "CanvasRenderer.ts"),
  `// VENDORED from lottie_editor apps/web/src/gpu/CanvasRenderer.ts @ ${commit}${dirty ? " (dirty)" : ""}.\n// Do not edit - run \`pnpm sync:engine\`.\n${src}`,
);
copyFileSync(join(repo, "packages/mcp/catalog.json"), join(root, "src/content/mcp-catalog.json"));
writeFileSync(join(vendor, "VERSION.json"), JSON.stringify({ commit, dirty, builtAt: new Date().toISOString() }, null, 2) + "\n");
console.log(`vendored engine @ ${commit}${dirty ? " (dirty)" : ""}`);
