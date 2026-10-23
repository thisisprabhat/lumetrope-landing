// Feature icon: state machines. Three states joined by transitions; the
// current state glows at rest, and on hover a token runs the loop A → B → C.
import { icon } from "./icon-kit.mjs";

export const name = "icon-state-machines";

const A = [26, 30];
const B = [70, 30];
const Cn = [48, 70];

export function build() {
  return icon("state-machines", "#6fd3ff", (d, k) => {
    const cyan = k.C.cyan;
    k.line("Edge AB", [48, 30], [[38, 30], [58, 30]], k.C.text2, 4);
    k.line("Edge BC", [60, 50], [[64, 42], [55, 59]], k.C.text2, 4);
    k.line("Edge CA", [36, 50], [[41, 59], [32, 42]], k.C.text2, 4);
    // Arrowheads show the direction of each transition.
    k.line("Head AB", [56, 30], [[53, 25], [58, 30], [53, 35]], k.C.text2, 4);
    k.line("Head BC", [55, 59], [[53, 53], [55, 59], [60, 56]], k.C.text2, 4);
    k.line("Head CA", [32, 42], [[31, 48], [32, 42], [37, 44]], k.C.text2, 4);
    const node = (nm, [x, y], square) => {
      const geo = square ? { type: "rect", size: [24, 24], roundness: 7 } : { type: "ellipse", size: [24, 24] };
      d.shape({ ...geo, name: `${nm} Lit`, position: [x, y], fill: cyan });
      d.shape({ ...geo, name: nm, position: [x, y], fill: null, stroke: k.C.text, stroke_width: 5 });
    };
    node("Node A", A, false);
    node("Node B", B, true);
    node("Node C", Cn, false);
    d.anim("Node A Lit", "opacity", 100, { rest: [[0, 55], [30, 100]], active: [[0, 100], [8, 100], [14, 0], [44, 0], [48, 100]] });
    d.anim("Node B Lit", "opacity", 0, { active: [[0, 0], [14, 0], [17, 100], [26, 100], [32, 0]] });
    d.anim("Node C Lit", "opacity", 0, { active: [[0, 0], [28, 0], [31, 100], [40, 100], [46, 0]] });
    d.anim("Node A", "scale", [100, 100], { rest: [[0, [100, 100]], [30, [108, 108]]], active: [[0, [100, 100]], [44, [100, 100], "ease_out_back"], [48, [118, 118]], [54, [100, 100]]] });
    d.anim("Node B", "scale", [100, 100], { active: [[0, [100, 100]], [14, [100, 100], "ease_out_back"], [17, [118, 118]], [23, [100, 100]]] });
    d.anim("Node C", "scale", [100, 100], { active: [[0, [100, 100]], [28, [100, 100], "ease_out_back"], [31, [118, 118]], [37, [100, 100]]] });
    d.shape({ type: "ellipse", name: "Token", position: A, size: [11, 11], fill: "#ffffff" });
    d.anim("Token", "scale", [0, 0], { active: [[0, [0, 0]], [3, [0, 0], "ease_out_back"], [7, [100, 100]], [44, [100, 100]], [48, [0, 0]]] });
    d.anim("Token", "position", A, { active: [[0, A], [6, A, "ease_in_out"], [16, B], [19, B, "ease_in_out"], [30, Cn], [33, Cn, "ease_in_out"], [46, A]] });
  });
}
