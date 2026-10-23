// Zoetrope (benefits section): a lantern drum whose light leaks through
// turning slits and projects one benefit glyph at a time. Scroll progress
// picks the benefit (B1..B4); a click spins the drum and flicks through all
// four frames like a real zoetrope before landing back on the current one.
import { C, Doc, ev } from "./lib.mjs";

export const name = "zoetrope";

const CX = 360;
const RIM_Y = 220;
const BODY_Y = 270;
const GLYPH = [CX, 112];
const BENEFITS = ["b1", "b2", "b3", "b4"];
const SPIN_STEPS = 12; // slits that pass by during a spin

export function build() {
  const d = new Doc("Zoetrope", 720, 420, 30, 285);
  BENEFITS.forEach((b, i) => d.segment(b, i * 60, i * 60 + 60, true));
  d.segment("spin", 240, 285, false);

  // ------------------------------------------------------------- stage
  d.shape({ type: "ellipse", name: "Floor Glow", position: [CX, 378], size: [600, 80], fill: C.lume });
  d.radial("Floor Glow", [{ offset: 0, color: C.lume, opacity: 0.22 }, { offset: 1, color: C.lume, opacity: 0 }], { start: [0, 0], end: [300, 0] });

  d.shape({ type: "path", name: "Beam", position: [CX, RIM_Y], closed: true, points: [[-128, 0], [128, 0], [230, -210], [-230, -210]], fill: C.lume });
  d.linear("Beam", [{ offset: 0, color: C.lume, opacity: 0.26 }, { offset: 0.7, color: C.lume, opacity: 0.05 }, { offset: 1, color: C.lume, opacity: 0 }], [0, 0], [0, -210]);

  // Glyph halos, one per benefit colour.
  const accents = [C.ok, C.cyan, C.lume, C.violet];
  accents.forEach((a, i) => {
    d.shape({ type: "ellipse", name: `Halo ${i + 1}`, position: GLYPH, size: [250, 250], fill: a });
    d.radial(`Halo ${i + 1}`, [{ offset: 0, color: a, opacity: 0.32 }, { offset: 0.5, color: a, opacity: 0.1 }, { offset: 1, color: a, opacity: 0 }], { start: [0, 0], end: [125, 0] });
  });

  // B1 free & open source: </>
  d.line("Glyph 1", GLYPH, [[CX - 26, 88], [CX - 50, 112], [CX - 26, 136]], C.ok, 11);
  d.addLine("Glyph 1", [[26, -24], [50, 0], [26, 24]], C.ok, 11);
  d.addLine("Glyph 1", [[11, -34], [-11, 34]], C.ok, 11);
  // B2 works offline: a cloud with a slash through it.
  d.shape({ type: "rect", name: "Glyph 2", position: GLYPH, size: [96, 30], roundness: 15, fill: C.cyan });
  for (const [x, y, w, h] of [[-24, -4, 46, 40], [4, -18, 56, 54], [28, -2, 40, 36]]) d.add("Glyph 2", { type: "ellipse", position: [x, y + 8], size: [w, h], fill: C.cyan });
  d.addLine("Glyph 2", [[-30, -24], [22, 28]], C.bg0, 17);
  d.addLine("Glyph 2", [[-46, -40], [38, 44]], C.cyan, 7);
  // B3 interactive output: play button + pointer.
  d.shape({ type: "ellipse", name: "Glyph 3", position: GLYPH, size: [96, 96], fill: null, stroke: C.lume, stroke_width: 9 });
  d.add("Glyph 3", { type: "polygon", position: [0, 0], radius: 24, points: 3, roundness: 14, fill: C.lume });
  d.op("set_transform", { layer: "Glyph 3", shape: "0", rotation: 90, position: [5, 0] });
  d.add("Glyph 3", { type: "path", position: [34, 26], closed: true, points: [[0, 0], [0, 34], [9, 26], [16, 40], [23, 37], [16, 23], [27, 23]], fill: C.text, stroke: C.bg0, stroke_width: 4 });
  // B4 AI-ready: sparkles.
  d.shape({ type: "star", name: "Glyph 4", position: GLYPH, radius: 50, inner_radius: 12, points: 4, roundness: 0, fill: C.violet });
  d.add("Glyph 4", { type: "star", position: [52, -40], radius: 19, inner_radius: 5, points: 4, fill: C.violet });
  d.add("Glyph 4", { type: "star", position: [56, 34], radius: 12, inner_radius: 3.5, points: 4, fill: C.violet });

  // ------------------------------------------------------------- drum
  d.shape({ type: "rect", name: "Spindle", position: [CX, 350], size: [16, 44], roundness: 4, fill: C.raised, stroke: C.edge, stroke_width: 2 });
  d.shape({ type: "ellipse", name: "Base", position: [CX, 374], size: [180, 24], fill: C.bg3, stroke: C.edge, stroke_width: 3 });
  const drumFill = [{ offset: 0, color: "#121417" }, { offset: 0.5, color: "#2a3038" }, { offset: 1, color: "#121417" }];
  d.shape({ type: "ellipse", name: "Drum Bottom", position: [CX, 320], size: [330, 44], fill: C.bg3, stroke: C.edge, stroke_width: 3 });
  d.linear("Drum Bottom", drumFill, [-165, 0], [165, 0]);
  d.shape({ type: "rect", name: "Drum", position: [CX, BODY_Y], size: [330, 100], fill: C.bg3 });
  d.linear("Drum", drumFill, [-165, 0], [165, 0]);

  // Light through the slits; a repeater offset turns the drum.
  d.shape({ type: "rect", name: "Slits", position: [CX, BODY_Y + 2], size: [12, 76], roundness: 6, fill: C.lume });
  // Spare copies to the left feed in as the offset grows (the mask hides them).
  d.op("update_shape_item", { layer: "Slits", shape: "0", props: { position: [-208 - SPIN_STEPS * 32, 0] } });
  const rep = d.op("add_repeater", { layer: "Slits", copies: 15 + SPIN_STEPS, position: [32, 0] }).shape;
  d.linear("Slits", [{ offset: 0, color: C.lumeDeep }, { offset: 0.5, color: C.lumeHi }, { offset: 1, color: C.lumeDeep }], [0, -38], [0, 38]);
  d.op("add_mask", { layer: "Slits", shape: "rect", position: [0, -2], size: [326, 100], mode: "add" });
  d.shape({ type: "rect", name: "Curve Shade", position: [CX, BODY_Y], size: [330, 100], fill: C.bg0 });
  d.linear("Curve Shade", [{ offset: 0, color: C.bg0, opacity: 0.92 }, { offset: 0.28, color: C.bg0, opacity: 0 }, { offset: 0.72, color: C.bg0, opacity: 0 }, { offset: 1, color: C.bg0, opacity: 0.92 }], [-165, 0], [165, 0]);
  d.line("Drum Edge", [CX, BODY_Y], [[CX - 165, RIM_Y], [CX - 165, 320]], C.edge, 3);
  d.addLine("Drum Edge", [[165, -50], [165, 50]], C.edge, 3);

  d.shape({ type: "ellipse", name: "Rim", position: [CX, RIM_Y], size: [334, 48], fill: C.raised, stroke: C.edge, stroke_width: 3 });
  d.shape({ type: "ellipse", name: "Opening", position: [CX, RIM_Y + 1], size: [302, 32], fill: C.bg0 });
  d.shape({ type: "ellipse", name: "Inner Light", position: [CX, RIM_Y + 1], size: [302, 32], fill: C.lume });
  d.radial("Inner Light", [{ offset: 0, color: C.lumeHi, opacity: 0.9 }, { offset: 0.5, color: C.lume, opacity: 0.55 }, { offset: 1, color: C.lume, opacity: 0 }], { start: [0, 0], end: [150, 0] });

  // Progress pips under the stand.
  accents.forEach((a, i) => {
    const x = CX - 36 + i * 24;
    d.shape({ type: "ellipse", name: `Pip ${i + 1}`, position: [x, 404], size: [9, 9], fill: C.edge });
    d.shape({ type: "ellipse", name: `Pip ${i + 1} Lit`, position: [x, 404], size: [11, 11], fill: a });
  });

  // ------------------------------------------------------------- motion
  const flicker = (g) => {
    const pts = [[0, 0, "hold"]];
    for (let k = 0; 4 + 3 * k < 37; k++) if (k % 4 === g) pts.push([4 + 3 * k, 100, "hold"], [7 + 3 * k, 0, "hold"]);
    return pts;
  };
  BENEFITS.forEach((b, i) => {
    const on = (keys) => ({ [b]: keys });
    d.anim(`Glyph ${i + 1}`, "opacity", 0, { ...on(100), spin: flicker(i) });
    d.anim(`Halo ${i + 1}`, "opacity", 0, { ...on([[0, 75], [30, 100]]), spin: flicker(i) });
    d.anim(`Glyph ${i + 1}`, "position", GLYPH, { ...on([[0, GLYPH], [30, [CX, 104]]]) });
    d.anim(`Glyph ${i + 1}`, "scale", [100, 100], { ...on([[0, [100, 100]], [30, [105, 105]]]), spin: [[0, [86, 86]], [36, [112, 112]]] });
    d.anim(`Pip ${i + 1} Lit`, "opacity", 0, { ...on(100), spin: flicker(i) });
    d.anim(`Pip ${i + 1} Lit`, "scale", [100, 100], { ...on([[0, [100, 100]], [30, [125, 125]]]) });
  });
  d.anim("Glyph 4", "rotation", 0, { b4: [[0, 0], [30, 8]] });
  d.anim("Glyph 3", "scale", [100, 100], { b3: [[0, [100, 100]], [10, [108, 108], "ease_out_back"], [22, [100, 100]]], spin: [[0, [86, 86]], [36, [112, 112]]] });

  const turn = Object.fromEntries(BENEFITS.map((b) => [b, [[0, 0, "linear"], [59, 2]]]));
  d.anim("Slits", "offset", 0, { ...turn, spin: [[0, 0, "ease_in_out"], [44, SPIN_STEPS]] }, { shape: rep });
  const glow = Object.fromEntries(BENEFITS.map((b) => [b, [[0, 72], [30, 100]]]));
  d.anim("Inner Light", "opacity", 80, { ...glow, spin: [[0, 80], [14, 100], [44, 80]] });
  d.anim("Beam", "opacity", 80, { ...glow, spin: [[0, 72], [8, 100], [36, 100], [44, 72]] });
  d.anim("Beam", "scale", [100, 100], { spin: [[0, [100, 100]], [10, [112, 106]], [36, [112, 106]], [44, [100, 100]]] });
  d.anim("Floor Glow", "opacity", 80, { ...glow, spin: [[0, 72], [14, 100], [44, 72]] });
  // The drum wobbles as it spins up.
  d.anim("Rim", "scale", [100, 100], { spin: [[0, [100, 100]], [6, [101, 96]], [12, [100, 102]], [40, [100, 100]]] });

  // ------------------------------------------------------------- state machine
  const m = d.machine("Zoetrope");
  d.input(m, "progress", "numeric", 0);
  d.input(m, "spin", "event");
  BENEFITS.forEach((b, i) => d.state(m, `B${i + 1}`, b, true));
  d.state(m, "Spin", "spin", false);
  d.global(m, "Any");
  const range = (i) => {
    const g = [];
    if (i > 0) g.push({ input: "progress", condition: "greater_than_or_equal", value: i * 0.25 });
    if (i < 3) g.push({ input: "progress", condition: "less_than", value: (i + 1) * 0.25 });
    return g;
  };
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i !== j) d.go(m, `B${i + 1}`, `B${j + 1}`, range(j));
  d.go(m, "Any", "Spin", ev("spin"));
  d.go(m, "Spin", "B1"); // on complete; B1 then hands over to the benefit `progress` points at
  d.on(m, "Click", [{ type: "fire", input: "spin" }]);
  return d;
}
