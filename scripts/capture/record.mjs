// Records tour.webm + carousel screenshots (.webp) from the real Lumetrope app.
// Usage: LUMETROPE_APP_URL=http://localhost:5173 node scripts/capture/record.mjs
//
// DEPENDENCY: the target app must be a dev build exposing the dev-only global
// `window.__lumetrope = { engine, store }`; this script uses `store.setState`
// to close dialogs. Production builds do not expose it.
//
// Privacy: displayed absolute paths are rewritten in-page, and every shot
// asserts that document.body.innerText holds neither the home dir nor the username.
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync, renameSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import os from "node:os";

const APP_URL = process.env.LUMETROPE_APP_URL || "http://localhost:5173";
const root = resolve(import.meta.dirname, "../..");
const out = join(root, "public/media");
const tmp = join(root, ".capture-tmp");
const stage = join(tmp, "media");
const shotsDir = join(stage, "shots");
const HOME = os.homedir();
const USER = os.userInfo().username;
const MCP_PATH = "~/Library/Application Support/com.waygosquad.lumetrope/mcp/lumetrope-mcp.mjs";

// Preflight: touch nothing if the app is unreachable.
try {
  const r = await fetch(APP_URL);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
} catch (e) {
  console.error(`Lumetrope app not reachable at ${APP_URL} (${e.message}). Start it with \`pnpm dev\` in the Lumetrope repo, or set LUMETROPE_APP_URL.`);
  process.exit(1);
}

rmSync(tmp, { recursive: true, force: true });
mkdirSync(shotsDir, { recursive: true });

const initScript = ({ home, user, mcpPath }) => {
  // Path scrubbing
  const scrub = (s) => {
    let t = s.replace(/\/(?:Users|home)\/[^\s"'\]]*?lumetrope-mcp\.mjs/g, mcpPath);
    t = t.split(home).join("~");
    t = t.replace(/\/Users\/[^\/\s"']+/g, "~");
    if (user) t = t.split(`/${user}/`).join("/~/");
    return t;
  };
  const walk = (n) => {
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    let x;
    while ((x = w.nextNode())) {
      const v = scrub(x.nodeValue);
      if (v !== x.nodeValue) x.nodeValue = v;
    }
  };
  const start = () => {
    walk(document.body);
    new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.type === "characterData") {
          const v = scrub(m.target.nodeValue);
          if (v !== m.target.nodeValue) m.target.nodeValue = v;
        } else m.addedNodes.forEach((n) => walk(n.nodeType === 3 ? n.parentNode : n));
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    // Fake cursor (video draws none)
    const c = document.createElement("div");
    c.id = "__fc";
    c.style.cssText = "position:fixed;left:0;top:0;width:22px;height:22px;pointer-events:none;z-index:2147483647;transform:translate(-100px,-100px);transition:scale .12s;";
    c.innerHTML = '<svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 2l14 8-6 1.5L8.5 18z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg><span style="position:absolute;left:-9px;top:-9px;width:22px;height:22px;border-radius:50%;border:2px solid #ffb02e;opacity:0;"></span>';
    document.body.appendChild(c);
    const ring = c.querySelector("span");
    addEventListener("mousemove", (e) => { c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, true);
    addEventListener("mousedown", () => { c.style.scale = ".8"; ring.animate([{ opacity: 0.9, transform: "scale(.4)" }, { opacity: 0, transform: "scale(1.6)" }], 380); }, true);
    addEventListener("mouseup", () => { c.style.scale = "1"; }, true);
  };
  if (document.body) start(); else addEventListener("DOMContentLoaded", start);
};

const shots = [];
const pngs = [];
let browser, ctx;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: { dir: tmp, size: { width: 1152, height: 720 } },
  });
  await ctx.addInitScript(initScript, { home: HOME, user: USER, mcpPath: MCP_PATH });
  const page = await ctx.newPage();
  const wait = (ms) => page.waitForTimeout(ms);
  const move = async (x, y, steps = 18) => { await page.mouse.move(x, y, { steps }); };
  async function click(loc, { dbl = false } = {}) {
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    const b = await loc.boundingBox();
    if (!b) throw new Error("no box for " + loc);
    await move(b.x + b.width / 2, b.y + b.height / 2);
    await wait(250);
    if (dbl) await page.mouse.dblclick(b.x + b.width / 2, b.y + b.height / 2);
    else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  }
  const tool = (name) => page.locator(`button.icon-btn[data-tip^="${name}"]`).first();
  const setState = (s) => page.evaluate((s) => window.__lumetrope.store.setState(s), s);
  async function shot(name, alt, caption) {
    const text = await page.evaluate(() => document.body.innerText);
    for (const bad of [HOME, USER]) {
      if (bad && text.includes(bad)) throw new Error(`Privacy check failed in "${name}": page text contains "${bad}"`);
    }
    await page.evaluate(() => { const c = document.getElementById("__fc"); if (c) c.style.display = "none"; });
    const buf = await page.screenshot({ type: "png" });
    await page.evaluate(() => { const c = document.getElementById("__fc"); if (c) c.style.display = ""; });
    pngs.push({ name, buf });
    shots.push({ name, src: `/media/shots/${name}.webp`, alt, caption });
  }
  const goHome = async () => { await page.goto(APP_URL); await page.getByText("New project").first().waitFor(); await wait(1200); };

  // 1 Dashboard
  await goHome();
  await move(300, 300, 40); await wait(800);
  await shot("dashboard", "The Lumetrope dashboard with canvas presets, sample projects and an MCP entry.", "Start from a preset size or a ready-made interactive sample.");

  // 2 New project, draw shapes
  await click(page.getByText("Landscape HD"));
  await page.locator("canvas").first().waitFor(); await wait(1500);
  const cv = await page.locator("canvas").first().boundingBox();
  const cx = cv.x + cv.width / 2, cy = cv.y + cv.height / 2;
  const drag = async (x1, y1, x2, y2) => {
    await move(x1, y1); await page.mouse.down(); await move(x2, y2, 20); await page.mouse.up(); await wait(400);
  };
  await click(tool("Rectangle")); await drag(cx - 200, cy - 80, cx - 40, cy + 70);
  await click(tool("Ellipse")); await drag(cx + 20, cy - 90, cx + 190, cy + 80);
  await click(tool("Star")); await drag(cx - 60, cy - 160, cx + 20, cy - 100);
  await click(tool("Select"));
  await move(cx, cy + 230, 30); await wait(700);
  await shot("draw", "A new project in the Lumetrope editor with a rectangle, ellipse and star drawn on the canvas.", "Draw shapes on the canvas with the vector tools.");

  // 3 Keyframes / timeline / easing (Bloom sample)
  await goHome();
  await click(page.getByText("Bloom").first());
  await page.locator("canvas").first().waitFor(); await wait(2000);
  const row = page.locator(".tl-name", { hasText: "Swatch Mint" }).first();
  await click(row); await wait(400);
  await click(row.locator(".tl-caret")); await wait(600);
  await click(page.locator(".tl-row.prop .kf").nth(2), { dbl: true });
  await wait(900);
  await shot("timeline", "The Lumetrope timeline with keyframes per property and the easing curve editor open on a keyframe.", "Keyframes, segments and easing curves on a precise timeline.");
  await page.keyboard.press("Escape"); await wait(500);
  await move(720, 300, 20); await page.mouse.click(720, 300); await wait(600);

  // 4 State machine
  await click(page.getByText("State Machine", { exact: true }));
  await wait(1800);
  await shot("state-machine", "The state machine graph with colour-coded state nodes and transitions.", "Wire states and transitions on a colour-coded graph.");

  // 5 Preview
  await click(page.getByText("Preview", { exact: true }).first());
  await wait(1500);
  const pc = await page.locator("canvas").first().boundingBox();
  await move(pc.x + pc.width / 2, pc.y + pc.height / 2); await wait(300);
  await page.mouse.click(pc.x + pc.width / 2, pc.y + pc.height / 2);
  await wait(900);
  await shot("preview", "Preview mode where clicking the artwork drives the state machine.", "Preview it: clicks and hovers drive the states for real.");
  await wait(1500);

  // 6 Export
  await setState({ mode: "animate" }); await wait(600);
  await click(page.getByText("Export", { exact: true }).first());
  await wait(1500);
  await shot("export", "The export dialog offering GIF, WebP and WebM output.", "Export to Lottie, GIF, WebP and WebM.");
  await page.keyboard.press("Escape"); await setState({ exportOpen: false }); await wait(700);

  // 7 MCP
  await click(page.getByText("MCP", { exact: true }).first());
  await wait(1500);
  await page.evaluate(() => {
    const b = document.querySelector('[role="dialog"] .modal-body');
    if (b) b.scrollTo({ top: 150, behavior: "smooth" });
  });
  await wait(1200);
  await shot("mcp", "The MCP dialog with ready-to-copy commands for connecting an AI agent to the editor.", "Connect an AI agent over MCP and let it animate for you.");
  await page.keyboard.press("Escape"); await setState({ mcpHelpOpen: false }); await wait(700);

  // 8 Full screen
  await click(page.getByLabel("Play full screen").first());
  await wait(1800);
  await shot("fullscreen", "The full-screen player running the animation.", "Hit full screen to present the finished piece.");
  await wait(1500);

  const video = page.video();
  await ctx.close(); ctx = null;
  renameSync(await video.path(), join(stage, "tour.webm"));

  // Encode PNG -> WebP q0.85 via a canvas in a plain context
  const ectx = await browser.newContext();
  const ep = await ectx.newPage();
  for (const { name, buf } of pngs) {
    const b64 = await ep.evaluate(async (b64) => {
      const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
      const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      const blob = await new Promise((r) => c.toBlob(r, "image/webp", 0.85));
      if (blob.type !== "image/webp") throw new Error("browser cannot encode webp");
      const u8 = new Uint8Array(await blob.arrayBuffer()); let s = "";
      for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
      return btoa(s);
    }, buf.toString("base64"));
    writeFileSync(join(shotsDir, `${name}.webp`), Buffer.from(b64, "base64"));
  }
  await ectx.close();

  const poster = shots.find((s) => s.name === "timeline").src;
  const json = { shots: shots.map(({ src, alt, caption }) => ({ src, alt, caption })), video: { webm: "/media/tour.webm", poster } };
  // Success: swap into place
  rmSync(out, { recursive: true, force: true });
  renameSync(stage, out);
  writeFileSync(join(root, "src/sections/media.json"), JSON.stringify(json, null, 2) + "\n");
  console.log("done:", shots.map((s) => s.name).join(", "));
} catch (e) {
  console.error("capture failed:", e.message);
  process.exitCode = 1;
} finally {
  if (ctx) await ctx.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
  rmSync(tmp, { recursive: true, force: true });
}
