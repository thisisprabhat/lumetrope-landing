// Contact sheet of a generated animation, for eyeballing the artwork:
//   node scripts/animations/preview.mjs <name[,name...]> <outDir> <frame,frame,...> [tileWidth]
// Frames are composited over the page background and written as <outDir>/<name>.png.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import { Engine } from "../../src/engine/vendor/lumetrope_wasm.js";
import { ROOT, initEngine } from "./lib.mjs";

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "latin1");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
/** Minimal RGB PNG encoder. */
function encodePngRgb(rgb, w, h) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    Buffer.from(rgb.buffer, rgb.byteOffset + y * w * 3, w * 3).copy(raw, y * (w * 3 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

const [name, outDir, frameList, tile] = process.argv.slice(2);
if (!name || !outDir || !frameList) {
  console.error("usage: preview.mjs <name> <outDir> <frame,frame,...> [tileWidth]");
  process.exit(1);
}
await initEngine();
// Several comma-separated names give one row per animation.
const names = name.split(",");
const engines = names.map((n) => {
  const e = new Engine();
  return [e, JSON.parse(e.load_file(`${n}.lottie`, readFileSync(join(ROOT, "public/animations", `${n}.lottie`))))];
});
const info = engines[0][1];
const frames = frameList.split(",").map(Number);
const tw = Number(tile ?? Math.min(360, Math.max(192, info.w)));
const th = Math.round((tw * info.h) / info.w);
const multi = names.length > 1;
const cols = multi ? frames.length : Math.min(4, frames.length);
const rows = multi ? names.length : Math.ceil(frames.length / cols);
const pad = 6;
const W = cols * (tw + pad) + pad;
const H = rows * (th + pad) + pad;
const sheet = new Uint8Array(W * H * 3).fill(40);
const bg = [0x0b, 0x0c, 0x0e];
const cells = multi ? engines.flatMap(([e], r) => frames.map((f, c) => [e, f, c, r])) : frames.map((f, i) => [engines[0][0], f, i % cols, Math.floor(i / cols)]);
for (const [e, f, col, row] of cells) {
  const px = e.render(f, tw, th);
  const ox = pad + col * (tw + pad);
  const oy = pad + row * (th + pad);
  for (let y = 0; y < th; y++)
    for (let x = 0; x < tw; x++) {
      const s = (y * tw + x) * 4;
      const d = ((oy + y) * W + ox + x) * 3;
      const a = px[s + 3] / 255;
      for (let c = 0; c < 3; c++) sheet[d + c] = Math.round(px[s + c] * a + bg[c] * (1 - a));
    }
}
const out = join(outDir, `${multi ? "sheet" : name}.png`);
writeFileSync(out, encodePngRgb(sheet, W, H));
console.log(`${name}: ${frames.join(",")} -> ${out}`);
