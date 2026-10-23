// Lighthouse (mobile) against the production build, checked against the Global Constraints budgets.
//
//   pnpm build && pnpm lighthouse
//
// Uses the installed Google Chrome (chrome-launcher's default detection; set CHROME_PATH to override).
// Serves dist/ with `vite preview` on port 4180 unless LH_BASE points at a running server.
// Full reports go to reports/<page>.report.{html,json} (git-ignored, ~1 MB each); the scores go to
// reports/lighthouse-summary.json, which is committed.
import { spawn } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bin = (n) => join(root, "node_modules", ".bin", n);
const PORT = Number(process.env.LH_PORT ?? 4180);
const BASE = process.env.LH_BASE ?? `http://localhost:${PORT}`;
const RUNS = Math.max(1, Number(process.env.LH_RUNS ?? 1));
const PAGES = [
  { path: "/", name: "home" },
  { path: "/docs/getting-started/", name: "docs-getting-started" },
];
const BUDGET = { performance: 0.9, accessibility: 0.95, "best-practices": 0.95, seo: 1 };
const JS_BUDGET_KB = 180;
const outDir = join(root, "reports");
mkdirSync(outDir, { recursive: true });
// Clear earlier reports so reports/ only ever holds this run's results.
for (const f of readdirSync(outDir)) if (/\.report\.(json|html)$/.test(f) || f === "lighthouse-summary.json") rmSync(join(outDir, f));

const up = () => fetch(BASE).then((r) => r.ok, () => false);
const run = (cmd, args) =>
  new Promise((ok, fail) => {
    const p = spawn(cmd, args, { cwd: root, stdio: ["ignore", "inherit", "inherit"] });
    p.on("exit", (c) => (c === 0 ? ok() : fail(new Error(`${cmd} exited ${c}`))));
  });

/** gzip size of the JS the built HTML loads up front (entry + modulepreloads; lazy chunks excluded). */
function initialJs(htmlFile) {
  const html = readFileSync(htmlFile, "utf8");
  const srcs = [...html.matchAll(/<(?:script[^>]+src|link[^>]+rel="modulepreload"[^>]+href)="([^"]+\.js)"/g)].map((m) => m[1]);
  const files = [...new Set(srcs)];
  const bytes = files.reduce((n, f) => n + gzipSync(readFileSync(join(root, "dist", f))).length, 0);
  return { files, gzipKB: Math.round((bytes / 1024) * 10) / 10 };
}

let server;
if (!(await up())) {
  // Run vite's JS entry with node directly: killing the node_modules/.bin shim would orphan it.
  server = spawn(process.execPath, [join(root, "node_modules/vite/bin/vite.js"), "preview", "--port", String(PORT), "--strictPort"], { cwd: root, stdio: "ignore" });
  for (let i = 0; i < 100 && !(await up()); i++) await new Promise((r) => setTimeout(r, 150));
  if (!(await up())) throw new Error(`preview server did not start on ${BASE}`);
}

const summary = { date: new Date().toISOString(), base: BASE, formFactor: "mobile", runs: RUNS, budgets: BUDGET, pages: {} };
let failed = false;
try {
  for (const pg of PAGES) {
    const results = [];
    for (let i = 0; i < RUNS; i++) {
      const out = join(outDir, RUNS > 1 ? `${pg.name}-${i + 1}` : pg.name);
      await run(bin("lighthouse"), [
        BASE + pg.path,
        "--quiet",
        "--output=json",
        "--output=html",
        `--output-path=${out}`,
        "--chrome-flags=--headless=new --no-first-run",
      ]);
      results.push({ out, lhr: JSON.parse(readFileSync(`${out}.report.json`, "utf8")) });
    }
    // Median run by performance score.
    results.sort((a, b) => a.lhr.categories.performance.score - b.lhr.categories.performance.score);
    const median = results[Math.floor(results.length / 2)];
    const lhr = median.lhr;
    // The median run is also kept as reports/<page>.report.{json,html}.
    if (RUNS > 1) for (const ext of ["json", "html"]) copyFileSync(`${median.out}.report.${ext}`, join(outDir, `${pg.name}.report.${ext}`));
    const scores = Object.fromEntries(Object.keys(BUDGET).map((k) => [k, lhr.categories[k].score]));
    const audits = Object.fromEntries(
      ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"].map((k) => [k, lhr.audits[k].displayValue]),
    );
    const misses = Object.entries(BUDGET).filter(([k, min]) => scores[k] < min).map(([k]) => k);
    const html = join(root, "dist", pg.path.replace(/^\//, ""), "index.html");
    summary.pages[pg.path] = { scores, allRuns: results.map((r) => r.lhr.categories.performance.score), audits, initialJs: initialJs(html), misses };
    if (misses.length) failed = true;
  }
} finally {
  server?.kill();
}

writeFileSync(join(outDir, "lighthouse-summary.json"), JSON.stringify(summary, null, 2) + "\n");
for (const [path, r] of Object.entries(summary.pages)) {
  const s = Object.entries(r.scores).map(([k, v]) => `${k} ${Math.round(v * 100)}`).join(", ");
  console.log(`${path}: ${s} | initial JS ${r.initialJs.gzipKB} kB gzip${r.misses.length ? ` | MISSED: ${r.misses.join(", ")}` : ""}`);
  if (r.initialJs.gzipKB > JS_BUDGET_KB) failed = true;
}
const lazy = readdirSync(join(root, "dist", "assets")).filter((f) => f.endsWith(".wasm"));
console.log(`WASM (lazy): ${lazy.join(", ")}`);
process.exit(failed ? 1 : 0);
