// "Open the web app" glyph (no background; it sits straight on the dark ghost and nav buttons): a browser window with an arrow leaving it up and to the right. Same
// machine contract as cta.lottie (Rest/Hover/Pressed/Done, `hover` + `press`), so CtaLink can use
// either. Hover: the arrow nudges out on a loop and the window lights up. Press: the arrow flies
// off; Done: the window flashes and the arrow slides back in.
import { C, Doc, ev, is } from "./lib.mjs";

export const name = "cta-open";

const s2 = (n) => [n, n];
const CX = 40;
const CY = 25;

export function build() {
  const d = new Doc("Cta", 80, 50, 30, 150);
  d.segment("rest", 0, 60, true);
  d.segment("hover", 60, 90, true);
  d.segment("pressed", 90, 100, false);
  d.segment("done", 100, 150, false);

  d.shape({ type: "ellipse", name: "Halo", position: [CX, CY], size: [44, 44], fill: C.cyan });
  d.radial("Halo", [{ offset: 0, color: C.cyan, opacity: 0.45 }, { offset: 1, color: C.cyan, opacity: 0 }], { start: [0, 0], end: [22, 0] });

  // Window: frame + title bar + two dots.
  d.line("Window", [CX - 3, CY + 2], [[24, 14], [50, 14], [50, 38], [24, 38]], C.text, 3.2, true);
  d.addLine("Window", [[-13, -6], [13, -6]], C.text, 2.4);
  d.shape({ type: "ellipse", name: "Dots", position: [29, 18], size: [2.6, 2.6], fill: C.lume });
  d.add("Dots", { type: "ellipse", position: [3.6, 0], size: [2.6, 2.6], fill: C.cyan });

  // Arrow up-right, pivot at its tail so it can slide along its own direction.
  d.line("Arrow", [44, 30], [[44, 30], [57, 17]], C.cyan, 3.6);
  d.addLine("Arrow", [[5, -13], [13, -13], [13, -5]], C.cyan, 3.6);

  d.anim("Halo", "opacity", 0, { rest: [[0, 0], [30, 15]], hover: [[0, 60], [15, 90]], pressed: 90, done: [[0, 100], [20, 50], [49, 0]] });
  d.anim("Halo", "scale", s2(80), { hover: [[0, s2(100)], [15, s2(110)]], pressed: s2(110), done: [[0, s2(110)], [12, s2(128), "ease_out"], [49, s2(80)]] });
  d.anim("Window", "scale", s2(100), {
    hover: s2(104),
    pressed: [[0, s2(104)], [5, s2(94)]],
    done: [[0, s2(94)], [10, s2(106), "ease_out_back"], [24, s2(100)]],
  });
  d.anim("Dots", "opacity", 100, { done: [[0, 100], [5, 40], [10, 100], [15, 40], [20, 100]] });

  const tail = [44, 30];
  const out = (k) => [44 + 3 * k, 30 - 3 * k];
  d.anim("Arrow", "position", tail, {
    rest: [[0, tail], [30, out(0.4)]],
    hover: [[0, tail], [10, out(1.2), "ease_out"], [20, tail, "ease_in_out"]],
    pressed: [[0, out(1.2)], [9, out(5), "ease_in"]],
    done: [[0, out(-3)], [30, out(-3)], [44, tail, "ease_out_back"]],
  });
  d.anim("Arrow", "opacity", 100, { pressed: [[0, 100], [9, 0]], done: [[0, 0], [30, 0], [38, 100]] });

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
  d.go(m, "Pressed", "Done");
  d.go(m, "Done", "Rest");
  d.hoverSets(m);
  d.on(m, "Click", [{ type: "fire", input: "press" }]);
  return d;
}
