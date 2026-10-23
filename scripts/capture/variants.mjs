// Responsive variants of the carousel shots: <name>-960.webp and <name>-1440.webp beside each
// full-size <name>.webp (2880 wide). The carousel serves them through srcset and the tour video
// uses the 1440 one as its poster, so phones don't download 2880 px screenshots.
//
// record.mjs calls writeVariants() after each capture. To rebuild them from the committed shots:
//   node scripts/capture/variants.mjs
// Encodes with the installed Google Chrome (canvas -> WebP), like record.mjs; no extra dependency.
import { chromium } from "@playwright/test";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const WIDTHS = [960, 1440];
const QUALITY = 0.82;

/** Write the variants for every full-size shot in `dir` using a Playwright `browser`. */
export async function writeVariants(browser, dir) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const shots = readdirSync(dir).filter((f) => f.endsWith(".webp") && !/-\d+\.webp$/.test(f));
  for (const f of shots) {
    const outs = await page.evaluate(async ([b64, widths, q]) => {
      const img = new Image();
      img.src = "data:image/webp;base64," + b64;
      await img.decode();
      const res = [];
      for (const w of widths) {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = Math.round((img.height * w) / img.width);
        const g = c.getContext("2d");
        g.imageSmoothingQuality = "high";
        g.drawImage(img, 0, 0, c.width, c.height);
        const blob = await new Promise((r) => c.toBlob(r, "image/webp", q));
        if (blob.type !== "image/webp") throw new Error("browser cannot encode webp");
        const u8 = new Uint8Array(await blob.arrayBuffer());
        let s = "";
        for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
        res.push(btoa(s));
      }
      return res;
    }, [readFileSync(join(dir, f)).toString("base64"), WIDTHS, QUALITY]);
    WIDTHS.forEach((w, k) => writeFileSync(join(dir, f.replace(/\.webp$/, `-${w}.webp`)), Buffer.from(outs[k], "base64")));
    console.log("variants", f);
  }
  await ctx.close();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    await writeVariants(browser, resolve(import.meta.dirname, "../../public/media/shots"));
  } finally {
    await browser.close();
  }
}
