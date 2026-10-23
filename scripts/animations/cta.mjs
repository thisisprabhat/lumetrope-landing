// Download call-to-action glyph (no background; the page supplies the label and it sits straight
// on the amber primary button, so it is drawn in dark ink). Rest: the arrow breathes. Hover: it
// bounces into the tray and a soft light halo swells. Press: the arrow drops into the tray, then
// Done pops a check mark with sparks and the arrow drops back in.
import { C, Doc, ev, is } from "./lib.mjs";

export const name = "cta";

const s2 = (n) => [n, n];
const CX = 40;
const CY = 25;

export function build() {
  const d = new Doc("Cta", 80, 50, 30, 150);
  d.segment("rest", 0, 60, true);
  d.segment("hover", 60, 90, true);
  d.segment("pressed", 90, 100, false);
  d.segment("done", 100, 150, false);

  d.shape({ type: "ellipse", name: "Halo", position: [CX, CY], size: [44, 44], fill: C.lumeHi });
  d.radial("Halo", [{ offset: 0, color: C.lumeHi, opacity: 0.7 }, { offset: 1, color: C.lumeHi, opacity: 0 }], { start: [0, 0], end: [22, 0] });

  // Arrow into a tray (stroked, round caps).
  d.line("Arrow", [CX, CY], [[CX, 10], [CX, 28]], C.bg0, 4);
  d.addLine("Arrow", [[-7, -4], [0, 3], [7, -4]], C.bg0, 4);
  d.line("Tray", [CX, CY], [[27, 30], [27, 37], [53, 37], [53, 30]], C.bg0, 4);
  d.line("Check", [CX, CY], [[29, 24], [37, 32], [52, 15]], C.bg0, 4.5);
  // Three sparks that fly out on Done.
  const sparks = [[-17, -13], [0, -19], [17, -13]];
  sparks.forEach(([x, y], i) => d.shape({ type: "ellipse", name: `Spark ${i + 1}`, position: [CX + x * 0.5, CY + y * 0.5], size: [4, 4], fill: C.bg0 }));

  d.anim("Halo", "opacity", 0, { rest: [[0, 0], [30, 18]], hover: [[0, 70], [15, 100]], pressed: 100, done: [[0, 100], [30, 60], [49, 0]] });
  d.anim("Halo", "scale", s2(80), { rest: [[0, s2(80)], [30, s2(90)]], hover: [[0, s2(100)], [15, s2(112)]], pressed: s2(112), done: [[0, s2(112)], [12, s2(130), "ease_out"], [49, s2(80)]] });

  const up = [CX, CY];
  d.anim("Arrow", "position", up, {
    rest: [[0, up], [30, [CX, CY + 1.5]]],
    hover: [[0, up], [8, [CX, CY + 4.5], "ease_in"], [16, up, "ease_out_back"]],
    pressed: [[0, up], [9, [CX, CY + 7], "ease_in"]],
    done: [[0, [CX, CY - 22]], [36, [CX, CY - 22]], [48, up, "ease_out_back"]],
  });
  d.anim("Arrow", "opacity", 100, { pressed: [[0, 100], [9, 0]], done: [[0, 0], [36, 0], [44, 100]] });
  d.anim("Tray", "scale", s2(100), {
    hover: [[0, s2(100)], [8, s2(100)], [11, [108, 92]], [18, s2(100), "ease_out_back"]],
    pressed: [[0, s2(100)], [8, s2(100)], [9, [112, 88]]],
    done: [[0, [112, 88]], [10, s2(100), "ease_out_back"]],
  });
  d.anim("Tray", "opacity", 100, { done: [[0, 100], [6, 0], [36, 0], [44, 100]] });
  d.anim("Check", "opacity", 0, { done: [[0, 0], [6, 100], [36, 100], [42, 0]] });
  d.anim("Check", "scale", s2(40), { done: [[0, s2(40)], [10, s2(118), "ease_out_back"], [18, s2(100)]] });
  sparks.forEach(([x, y], i) => {
    const n = `Spark ${i + 1}`;
    const from = [CX + x * 0.5, CY + y * 0.5];
    d.anim(n, "opacity", 0, { done: [[0, 0], [6, 100], [22, 0]] });
    d.anim(n, "position", from, { done: [[0, from], [22, [CX + x * 1.25, CY + y * 1.1], "ease_out"]] });
  });

  const m = d.machine("Cta");
  d.input(m, "hover", "boolean", false);
  d.input(m, "press", "event");
  d.input(m, "done", "event");
  d.state(m, "Rest", "rest", true);
  d.state(m, "Hover", "hover", true);
  d.state(m, "Pressed", "pressed", false);
  d.state(m, "Done", "done", false);
  d.go(m, "Rest", "Hover", is("hover", true));
  d.go(m, "Hover", "Rest", is("hover", false));
  d.go(m, "Rest", "Pressed", ev("press"));
  d.go(m, "Hover", "Pressed", ev("press"));
  d.go(m, "Pressed", "Done", ev("done"));
  d.go(m, "Pressed", "Done"); // fallback on complete so a press always ends in the check mark
  d.go(m, "Done", "Rest");
  d.hoverSets(m);
  d.on(m, "Click", [{ type: "fire", input: "press" }]);
  return d;
}
