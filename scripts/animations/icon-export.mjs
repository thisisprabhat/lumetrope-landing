// Feature icon: export to GIF / WebP / WebM. An arrow lifts out of a tray; on
// hover it launches and three format tiles fan out.
import { icon } from "./icon-kit.mjs";

export const name = "icon-export";

export function build() {
  return icon("export", "#6fd3ff", (d, k) => {
    const tiles = [[k.C.lume, [30, 20], -18], [k.C.cyan, [48, 13], 0], [k.C.violet, [66, 20], 18]];
    tiles.forEach(([color], i) => d.shape({ type: "rect", name: `Tile ${i + 1}`, position: [48, 40], size: [12, 12], roundness: 3, fill: color }));
    const A = [48, 44];
    k.line("Arrow", A, [[48, 64], [48, 24]], k.C.cyan, 6);
    k.addLine("Arrow", A, [[36, 36], [48, 24], [60, 36]], k.C.cyan, 6);
    k.line("Tray", [48, 72], [[22, 52], [22, 74], [74, 74], [74, 52]], k.C.text, 6);
    d.anim("Arrow", "position", A, {
      rest: [[0, A], [30, [48, 39]]],
      active: [[0, A, "ease_in"], [9, [48, 16]], [10, [48, 66], "ease_out_back"], [24, A], [59, A]],
    });
    d.anim("Arrow", "opacity", 100, { active: [[0, 100], [6, 100, "ease_in"], [9, 0], [12, 0, "ease_out"], [20, 100]] });
    d.anim("Tray", "scale", [100, 100], { active: [[0, [100, 100], "ease_out"], [3, [104, 92]], [10, [100, 100]], [22, [100, 100], "ease_out"], [25, [103, 95]], [30, [100, 100]]] });
    tiles.forEach(([, to, rot], i) => {
      const nm = `Tile ${i + 1}`;
      const t0 = 6 + i * 3;
      d.anim(nm, "position", [48, 40], { active: [[0, [48, 40]], [t0, [48, 40], "ease_out_back"], [t0 + 12, to], [44, to, "ease_in"], [54, [48, 40]]] });
      d.anim(nm, "scale", [0, 0], { active: [[0, [0, 0]], [t0, [0, 0], "ease_out_back"], [t0 + 10, [100, 100]], [44, [100, 100], "ease_in"], [54, [0, 0]]] });
      d.anim(nm, "rotation", 0, { active: [[0, 0], [t0, 0, "ease_out"], [t0 + 14, rot], [54, 0]] });
    });
  });
}
