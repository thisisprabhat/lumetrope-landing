// Feature icon: local version history. A clock inside a rewind arrow; the
// minute hand ticks at rest and the whole dial rewinds on hover.
import { arc } from "./lib.mjs";
import { icon } from "./icon-kit.mjs";

export const name = "icon-version-history";

export function build() {
  return icon("version-history", "#7ee2a8", (d, k) => {
    const O = [48, 48];
    const R = 29;
    const from = -62;
    // Ring with a counter-clockwise arrowhead at its upper-left end.
    k.line("Ring", O, arc(48, 48, R, from, 236, 30), k.C.text, 6);
    const a = (from * Math.PI) / 180;
    const end = [48 + R * Math.sin(a), 48 - R * Math.cos(a)];
    const t = [-Math.cos(a), -Math.sin(a)]; // counter-clockwise tangent
    const n = [-t[1], t[0]];
    const p = (u, v) => [end[0] + t[0] * u + n[0] * v, end[1] + t[1] * u + n[1] * v];
    const head = d.add("Ring", { type: "path", position: [0, 0], closed: true, points: k.rel(O, [p(7, 0), p(-4, 8), p(-4, -8)]), fill: k.C.text, stroke: k.C.text, stroke_width: 2 });
    d.op("set_stroke", { layer: "Ring", shape: head, line_join: "round" });
    k.line("Hour", O, [[48, 48], [58, 55]], k.C.text, 5);
    k.line("Minute", O, [[48, 48], [48, 31]], k.C.ok, 5);
    d.shape({ type: "ellipse", name: "Hub", position: O, size: [9, 9], fill: k.C.ok });
    d.anim("Minute", "rotation", 0, { rest: [[0, 0, "snappy"], [6, -15], [30, -15, "snappy"], [36, 0]], active: [[0, 0], [44, -720]] });
    d.anim("Hour", "rotation", 0, { active: [[0, 0], [44, -60], [52, -60], [59, 0]] });
    d.anim("Ring", "rotation", 0, { rest: [[0, 0], [30, -8]], active: [[0, 0], [44, -360]] });
    d.anim("Ring", "scale", [100, 100], { active: [[0, [100, 100]], [8, [94, 94]], [40, [94, 94], "ease_out_back"], [50, [100, 100]]] });
  });
}
