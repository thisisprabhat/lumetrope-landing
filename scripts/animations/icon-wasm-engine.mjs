// Feature icon: Lumetrope's own WASM engine. Two meshing gears turn slowly at
// rest and spin up on hover.
import { gear } from "./lib.mjs";
import { icon } from "./icon-kit.mjs";

export const name = "icon-wasm-engine";

export function build() {
  return icon("wasm-engine", "#ffb340", (d, k) => {
    const BIG = [42, 54];
    const SMALL = [69, 27];
    d.shape({ type: "path", name: "Small Gear", position: SMALL, closed: true, points: gear(6, 10, 15), fill: null, stroke: k.C.lume, stroke_width: 4 });
    d.op("set_stroke", { layer: "Small Gear", line_join: "round" });
    d.add("Small Gear", { type: "ellipse", position: [0, 0], size: [7, 7], fill: k.C.lume });
    d.shape({ type: "path", name: "Big Gear", position: BIG, closed: true, points: gear(8, 20, 28), fill: "#16191d", stroke: k.C.text, stroke_width: 5 });
    d.op("set_stroke", { layer: "Big Gear", line_join: "round" });
    d.add("Big Gear", { type: "ellipse", position: [0, 0], size: [16, 16], fill: null, stroke: k.C.text, stroke_width: 5 });
    // One tooth per rest loop, three per active loop: seamless at any speed (8:6 teeth).
    d.anim("Big Gear", "rotation", 0, { rest: [[0, 0, "linear"], [59, 45]], active: [[0, 0, "linear"], [59, 135]] });
    d.anim("Small Gear", "rotation", 0, { rest: [[0, 0, "linear"], [59, -60]], active: [[0, 0, "linear"], [59, -180]] });
    d.anim("Big Gear", "scale", [100, 100], { active: [[0, [100, 100]], [6, [106, 106]], [30, [104, 104]]] });
  });
}
