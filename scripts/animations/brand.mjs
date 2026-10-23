// The Lumetrope brand mark, as the app draws it (apps/web/index.html favicon and the desktop
// icon in the Lumetrope repo): an amber ring broken into four slits, like a zoetrope drum seen
// from above, around a centre dot. Defined on the app's 32 px grid and scaled to `size`.
import { C } from "./lib.mjs";

const R = 13; // ring radius on the 32 px grid
const W = 5; // ring stroke
const DOT = 3.2; // centre dot radius
const DASH = [16.4, 4]; // four segments with four gaps round a 2*pi*13 = 81.7 ring

/** Draw the mark centred at `c`, `size` px across, as layers `${p} Ring` and `${p} Dot`. */
export function brandMark(d, p, c, size, color = C.lume) {
  const k = size / 32;
  const ring = `${p} Ring`;
  const dot = `${p} Dot`;
  d.shape({ type: "ellipse", name: ring, position: c, size: [2 * R * k, 2 * R * k], fill: null, stroke: color, stroke_width: W * k });
  d.op("set_stroke", { layer: ring, dash: DASH.map((n) => n * k), line_cap: "butt" });
  d.shape({ type: "ellipse", name: dot, position: c, size: [2 * DOT * k, 2 * DOT * k], fill: color });
  return { ring, dot };
}
