// Records tour.webm + carousel screenshots from the real Lumetrope app.
// Usage: LUMETROPE_APP_URL=http://localhost:5173 node scripts/capture/record.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync, renameSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const URL = process.env.LUMETROPE_APP_URL || "http://localhost:5173";
const root = resolve(import.meta.dirname, "../..");
const out = join(root, "public/media");
const shotsDir = join(out, "shots");
const tmp = join(root, ".capture-tmp");
rmSync(out, { recursive: true, force: true });
rmSync(tmp, { recursive: true, force: true });
mkdirSync(shotsDir, { recursive: true });
mkdirSync(tmp, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  recordVideo: { dir: tmp, size: { width: 1440, height: 900 } },
});
const page = await ctx.newPage();
const wait = (ms) => page.waitForTimeout(ms);
const shots = [];
let mx = 720, my = 450;
async function move(x, y, steps = 25) { await page.mouse.move(x, y, { steps }); mx = x; my = y; }
async function clickAt(loc) {
  const b = await loc.boundingBox();
  await move(b.x + b.width / 2, b.y + b.height / 2);
  await wait(250);
  await page.mouse.down(); await page.mouse.up();
}
async function shot(name, alt, caption) {
  const file = `${name}.jpg`;
  await page.screenshot({ path: join(shotsDir, file), type: "jpeg", quality: 85 });
  shots.push({ src: `/media/shots/${file}`, alt, caption });
}
const setState = (s) => page.evaluate((s) => window.__lumetrope.store.setState(s), s);
const goHome = async () => { await page.goto(URL); await page.getByText("New project").first().waitFor(); await wait(1200); };

// 1 Dashboard
await goHome();
await move(300, 300); await wait(800);
await shot("dashboard", "The Lumetrope dashboard with canvas presets, sample projects and an MCP entry.", "Start from a preset size or a ready-made interactive sample.");

// 2 New project, draw shapes
await clickAt(page.getByText("Landscape HD"));
await page.locator("canvas").first().waitFor(); await wait(1500);
const cv = await page.locator("canvas").first().boundingBox();
const cx = cv.x + cv.width / 2, cy = cv.y + cv.height / 2;
const toolBtn = (x) => ({ boundingBox: async () => ({ x: x - 15, y: 7, width: 30, height: 30 }) });
const drag = async (x1, y1, x2, y2) => {
  await move(x1, y1); await page.mouse.down(); await move(x2, y2, 20); await page.mouse.up(); await wait(400);
};
await clickAt(toolBtn(489));
await drag(cx - 200, cy - 80, cx - 40, cy + 70);
await clickAt(toolBtn(522));
await drag(cx + 20, cy - 90, cx + 190, cy + 80);
await clickAt(toolBtn(591));
await drag(cx - 60, cy - 160, cx + 20, cy - 100);
await clickAt(toolBtn(454));
await wait(600);
await shot("draw", "A new project in the Lumetrope editor with a rectangle, ellipse and star drawn on the canvas.", "Draw shapes on the canvas with the vector tools.");

// 3 Keyframes / timeline / easing (Bloom sample)
await goHome();
await clickAt(page.getByText("Bloom").first());
await page.locator("canvas").first().waitFor(); await wait(2000);
await clickAt(page.getByText("Swatch Mint").first()); await wait(500);
await shot("timeline", "The Lumetrope timeline showing keyframes per layer and named animation segments.", "Keyframes, segments and easing live on a precise timeline.");
await wait(800);

// 4 State machine
await clickAt(page.getByText("State Machine", { exact: true }));
await wait(1800);
await shot("state-machine", "The state machine graph with colour-coded state nodes and transitions.", "Wire states and transitions on a colour-coded graph.");

// 5 Preview
await clickAt(page.getByText("Preview", { exact: true }).first());
await wait(1500);
const pc = await page.locator("canvas").first().boundingBox();
await clickAt({ boundingBox: async () => ({ x: pc.x + pc.width / 2 - 5, y: pc.y + pc.height / 2 - 5, width: 10, height: 10 }) });
await wait(900);
await shot("preview", "Preview mode where clicking the artwork drives the state machine.", "Preview it: clicks and hovers drive the states for real.");
await wait(1500);

// 6 Export
await setState({ mode: "animate" }); await wait(600);
await clickAt(page.getByText("Export", { exact: true }).first());
await wait(1500);
await shot("export", "The export dialog offering GIF, WebP and WebM output.", "Export to Lottie, GIF, WebP and WebM.");
await page.keyboard.press("Escape"); await setState({ exportOpen: false }); await wait(700);

// 7 MCP
await clickAt(page.getByText("MCP", { exact: true }).first());
await wait(1500);
await shot("mcp", "The MCP dialog explaining how to connect an AI agent to the editor.", "Connect an AI agent over MCP and let it animate for you.");
await page.keyboard.press("Escape"); await setState({ mcpHelpOpen: false }); await wait(700);

// 8 Full screen
await clickAt(page.getByLabel("Play full screen").first());
await wait(1800);
await shot("fullscreen", "The full-screen player running the animation.", "Hit full screen to present the finished piece.");
await wait(1500);

const video = page.video();
await ctx.close();
await browser.close();
renameSync(await video.path(), join(out, "tour.webm"));
rmSync(tmp, { recursive: true, force: true });
writeFileSync(
  join(root, "src/sections/media.json"),
  JSON.stringify({ shots, video: { webm: "/media/tour.webm", poster: `/media/shots/${shots[3].src.split("/").pop()}` } }, null, 2) + "\n",
);
console.log("done", readdirSync(shotsDir));
