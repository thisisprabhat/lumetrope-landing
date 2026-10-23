// Re-encode posters (written lossless by writeAnimation) as lossy WebP (q 0.85, alpha kept) with
// the installed Google Chrome's encoder, keeping a file only when it gets smaller. The Lumi poster
// drops from ~80 KB to ~29 KB with no visible change, which the mobile LCP budget needs.
// build.mjs runs it after each build; without Chrome it warns and keeps the lossless files.
//   node scripts/animations/compress-posters.mjs [name ...]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib.mjs";

const QUALITY = 0.85;

export async function compressPosters(names) {
  let chromium;
  try {
    ({ chromium } = await import("@playwright/test"));
  } catch {
    console.warn("compress-posters: @playwright/test unavailable, posters stay lossless");
    return;
  }
  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } catch (e) {
    console.warn(`compress-posters: Chrome not found (${e.message.split("\n")[0]}), posters stay lossless`);
    return;
  }
  try {
    const page = await browser.newPage();
    for (const n of names) {
      const file = join(ROOT, "public/posters", `${n}.webp`);
      const src = readFileSync(file);
      const b64 = await page.evaluate(async ([b64, q]) => {
        const img = new Image();
        img.src = "data:image/webp;base64," + b64;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        c.getContext("2d").drawImage(img, 0, 0);
        const blob = await new Promise((r) => c.toBlob(r, "image/webp", q));
        if (blob.type !== "image/webp") throw new Error("browser cannot encode webp");
        const u8 = new Uint8Array(await blob.arrayBuffer());
        let s = "";
        for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
        return btoa(s);
      }, [src.toString("base64"), QUALITY]);
      const out = Buffer.from(b64, "base64");
      if (out.length < src.length) writeFileSync(file, out);
      console.log(`poster ${n}: ${src.length} -> ${Math.min(out.length, src.length)} bytes`);
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { readdirSync } = await import("node:fs");
  const all = readdirSync(join(ROOT, "public/posters")).filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5));
  const only = process.argv.slice(2);
  await compressPosters(only.length ? only : all);
}
