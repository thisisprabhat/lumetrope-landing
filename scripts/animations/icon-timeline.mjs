// Feature icon: timeline & keyframes. A playhead drifts over three tracks; on
// hover it sweeps across and each keyframe diamond pops as it is passed.
import { icon } from "./icon-kit.mjs";

export const name = "icon-timeline";

const TRACKS = [30, 48, 66];
const DIAMONDS = [[30, 30], [62, 30], [42, 48], [72, 48], [24, 66], [54, 66]];
const X0 = 16;
const X1 = 80;

export function build() {
  return icon("timeline", "#ffb340", (d, k) => {
    TRACKS.forEach((y, i) => k.line(`Track ${i + 1}`, [48, y], [[18, y], [78, y]], k.C.text2, 4));
    DIAMONDS.forEach(([x, y], i) => {
      const nm = `Key ${i + 1}`;
      d.shape({ type: "polygon", name: nm, position: [x, y], radius: 6.5, points: 4, roundness: 12, fill: k.C.text });
      // The playhead passes x at this active-loop frame.
      const t = Math.round(4 + ((x - X0) / (X1 - X0)) * 32);
      d.anim(nm, "scale", [100, 100], {
        rest: i === 2 ? [[0, [100, 100]], [30, [118, 118]]] : [100, 100],
        active: [[0, [100, 100]], [t - 2, [100, 100], "ease_out_back"], [t + 3, [150, 150]], [t + 10, [100, 100]]],
      });
      d.anim(nm, "color", k.C.text, { active: [[0, k.C.text], [t - 1, k.C.text], [t + 2, k.C.lume], [50, k.C.lume], [56, k.C.text]] }, { shape: "1" });
    });
    k.line("Playhead", [46, 48], [[46, 20], [46, 76]], k.C.lume, 4);
    d.add("Playhead", { type: "ellipse", position: [0, -28], size: [12, 12], fill: k.C.lume });
    d.anim("Playhead", "position", [46, 48], {
      rest: [[0, [44, 48]], [30, [52, 48]]],
      active: [[0, [44, 48], "ease_in_out"], [4, [X0, 48], "ease_in_out"], [36, [X1, 48]], [46, [X1, 48]]],
    });
  });
}
