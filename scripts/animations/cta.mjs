// Download call-to-action pill (glyph only; the page supplies the label). Hover
// brightens it, press squashes it, done flashes a check mark and returns to rest.
import { C, Doc, ev, is } from "./lib.mjs";

export const name = "cta";

const s2 = (n) => [n, n];

export function build() {
  const d = new Doc("Cta", 220, 56, 30, 150);
  d.segment("rest", 0, 60, true);
  d.segment("hover", 60, 90, true);
  d.segment("pressed", 90, 100, false);
  d.segment("done", 100, 150, false);

  d.shape({ type: "rect", name: "Glow", position: [110, 28], size: [214, 52], roundness: 26, fill: C.lume });
  d.glow("Glow", 10);
  d.shape({ type: "rect", name: "Pill", position: [110, 28], size: [212, 50], roundness: 25, fill: C.lume });
  d.linear("Pill", [{ offset: 0, color: "#ffc766" }, { offset: 1, color: C.lumeDeep }], [0, -25], [0, 25]);
  d.shape({ type: "rect", name: "Shine", position: [110, 18], size: [196, 14], roundness: 7, fill: C.lumeHi });
  d.set("Shine", { opacity: 28 });

  // Download glyph: arrow into a tray.
  d.line("Arrow", [110, 28], [[110, 14], [110, 30]], C.bg0, 4.5);
  d.addLine("Arrow", [[-8, 8], [0, 16], [8, 8]], C.bg0, 4.5);
  d.line("Tray", [110, 28], [[95, 37], [95, 43], [125, 43], [125, 37]], C.bg0, 4.5);
  // Check mark for Done.
  d.line("Check", [110, 28], [[96, 29], [106, 38], [125, 18]], C.bg0, 5.5);

  d.anim("Glow", "opacity", 45, { rest: [[0, 40], [30, 60]], hover: [[0, 85], [15, 100]], pressed: 55, done: [[0, 55], [20, 90], [49, 45]] });
  for (const l of ["Pill", "Shine", "Arrow", "Tray", "Glow"]) {
    d.anim(l, "scale", s2(100), {
      rest: [[0, s2(100)], [30, s2(100.8)]],
      hover: s2(103),
      pressed: [[0, s2(103)], [5, s2(95)]],
      done: [[0, s2(95)], [14, s2(103), "ease_out_back"], [30, s2(100)]],
    });
  }
  d.anim("Arrow", "position", [110, 28], { rest: [[0, [110, 28]], [30, [110, 29.5]]], hover: [[0, [110, 28]], [15, [110, 31]]] });
  d.anim("Arrow", "opacity", 100, { pressed: 100, done: [[0, 100], [8, 0]] });
  d.anim("Tray", "opacity", 100, { done: [[0, 100], [8, 0], [38, 0], [46, 100]] });
  d.anim("Check", "opacity", 0, { done: [[0, 0], [8, 100], [38, 100], [46, 0]] });
  d.anim("Check", "scale", s2(60), { done: [[0, s2(60)], [10, s2(115), "ease_out_back"], [20, s2(100)]] });

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
