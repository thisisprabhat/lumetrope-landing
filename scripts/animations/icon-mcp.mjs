// Feature icon: MCP for AI agents. A plug bobs under its port while a small
// agent sparkle twinkles; on hover it plugs in with a spark.
import { icon } from "./icon-kit.mjs";

export const name = "icon-mcp";

export function build() {
  return icon("mcp", "#b69cff", (d, k) => {
    const violet = k.C.violet;
    // Plug (drawn first so the port covers the prongs once it is plugged in).
    const P = [48, 60];
    d.shape({ type: "rect", name: "Plug", position: P, size: [30, 22], roundness: 7, fill: null, stroke: k.C.text, stroke_width: 5 });
    for (const x of [-7, 7]) d.add("Plug", { type: "rect", position: [x, -17], size: [5, 12], roundness: 2, fill: k.C.text });
    k.addLine("Plug", P, [[48, 71], [48, 78], [54, 86]], k.C.text, 5);
    d.anim("Plug", "position", P, {
      rest: [[0, P], [30, [48, 63]]],
      active: [[0, P, "ease_out_back"], [8, [48, 49]], [30, [48, 49]], [36, [48, 52]], [42, [48, 49]], [52, [48, 49]]],
    });
    // Port.
    d.shape({ type: "rect", name: "Port", position: [48, 24], size: [46, 16], roundness: 8, fill: "#16191d", stroke: k.C.text, stroke_width: 5 });
    for (const x of [-7, 7]) d.add("Port", { type: "rect", position: [x, 0], size: [4, 7], roundness: 1.5, fill: k.C.text2 });
    d.anim("Port", "scale", [100, 100], { active: [[0, [100, 100]], [7, [100, 100], "ease_out"], [9, [104, 94]], [14, [100, 100]]] });
    // Spark on contact.
    d.shape({ type: "star", name: "Spark", position: [70, 38], radius: 9, inner_radius: 2.5, points: 4, fill: violet });
    d.anim("Spark", "scale", [0, 0], { active: [[0, [0, 0]], [7, [0, 0], "ease_out_back"], [11, [140, 140]], [20, [0, 0]], [36, [0, 0], "ease_out_back"], [40, [90, 90]], [48, [0, 0]]] });
    d.anim("Spark", "rotation", 0, { active: [[0, 0], [7, 0, "ease_out"], [20, 90], [36, 90, "ease_out"], [48, 180]] });
    // Agent sparkle.
    d.shape({ type: "star", name: "Agent", position: [78, 62], radius: 10, inner_radius: 2.8, points: 4, fill: violet });
    d.anim("Agent", "scale", [100, 100], { rest: [[0, [80, 80]], [30, [112, 112]]], active: [[0, [100, 100]], [10, [150, 150], "ease_out_back"], [30, [100, 100]], [40, [140, 140]]] });
    d.anim("Agent", "rotation", 0, { rest: [[0, 0], [30, 20]], active: [[0, 0, "ease_out"], [30, 90], [59, 180]] });
  });
}
