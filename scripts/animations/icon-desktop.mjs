// Feature icon: desktop apps + web. A generic monitor whose screen content
// glows softly at rest and redraws itself on hover.
import { icon } from "./icon-kit.mjs";

export const name = "icon-desktop";

export function build() {
  return icon("desktop", "#6fd3ff", (d, k) => {
    d.shape({ type: "rect", name: "Screen Glow", position: [48, 41], size: [60, 40], roundness: 5, fill: k.C.cyan });
    d.anim("Screen Glow", "opacity", 0, { rest: [[0, 4], [30, 10]], active: [[0, 10], [14, 24], [40, 18]] });
    const lines = [[[30, 33], [52, 33], k.C.cyan], [[30, 42], [64, 42], k.C.text1], [[30, 51], [46, 51], k.C.text1]];
    lines.forEach(([a, b, color], i) => {
      const nm = `Line ${i + 1}`;
      k.line(nm, [48, a[1]], [a, b], color, 4);
      const trim = d.op("add_trim_path", { layer: nm, start: 0, end: 100 }).shape;
      const t0 = 8 + i * 5;
      d.anim(nm, "end", 100, { active: [[0, 100, "ease_in"], [5, 0], [t0, 0, "ease_out"], [t0 + 10, 100]] }, { shape: trim });
    });
    d.anim("Line 1", "opacity", 100, { rest: [[0, 70], [30, 100]] });
    d.shape({ type: "rect", name: "Monitor", position: [48, 42], size: [68, 48], roundness: 7, fill: null, stroke: k.C.text, stroke_width: 5 });
    k.line("Stand", [48, 72], [[48, 67], [48, 76]], k.C.text, 5);
    k.addLine("Stand", [48, 72], [[34, 78], [62, 78]], k.C.text, 5);
    d.anim("Monitor", "scale", [100, 100], { active: [[0, [100, 100]], [4, [104, 96]], [12, [100, 100]]] });
  });
}
