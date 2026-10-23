// Shared scaffold for the 96×96 feature icons: a soft accent glow behind a bold
// glyph, a subtle `rest` loop and a lively `active` loop, and the `Icon` state
// machine (hover ⇄ Rest/Active, tweened 0.2 s).
import { C, Doc, SNAP_SETTLE, is } from "./lib.mjs";

export const SIZE = 96;
export const REST = [0, 60];
export const ACTIVE = [60, 120];

/** Build an icon: `glyph(d, k)` draws and animates the feature glyph. */
export function icon(feature, accent, glyph) {
  const d = new Doc(`Icon ${feature}`, SIZE, SIZE, 30, 120);
  d.segment("rest", ...REST, true);
  d.segment("active", ...ACTIVE, true);

  d.shape({ type: "ellipse", name: "Glow", position: [48, 48], size: [92, 92], fill: accent });
  d.radial("Glow", [{ offset: 0, color: accent, opacity: 0.26 }, { offset: 0.6, color: accent, opacity: 0.07 }, { offset: 1, color: accent, opacity: 0 }], { start: [0, 0], end: [46, 0] });
  d.anim("Glow", "opacity", 60, { rest: [[0, 55], [30, 85]], active: [[0, 100], [30, 80]] });
  d.anim("Glow", "scale", [100, 100], { rest: [[0, [96, 96]], [30, [104, 104]]], active: [[0, [112, 112]], [30, [122, 122]]] });

  glyph(d, kit(d));

  const m = d.machine("Icon");
  d.input(m, "hover", "boolean", false);
  d.state(m, "Rest", "rest", true);
  d.state(m, "Active", "active", true);
  const tween = { type: "tweened", duration: 0.2, easing: SNAP_SETTLE };
  d.go(m, "Rest", "Active", is("hover", true), tween);
  d.go(m, "Active", "Rest", is("hover", false), tween);
  d.hoverSets(m);
  return d;
}

/** Drawing shortcuts in absolute 96×96 coordinates. */
function kit(d) {
  const rel = (pivot, pts) => pts.map(([x, y]) => [x - pivot[0], y - pivot[1]]);
  return {
    C,
    /** Stroked polyline layer pivoting at `pivot`. */
    line(name, pivot, pts, color = C.text, width = 6, closed = false) {
      d.shape({ type: "path", name, position: pivot, closed, points: rel(pivot, pts), fill: null, stroke: color, stroke_width: width });
      d.op("set_stroke", { layer: name, line_cap: "round", line_join: "round" });
      return name;
    },
    /** Extra stroked polyline inside an existing layer. */
    addLine(layer, pivot, pts, color = C.text, width = 6, closed = false) {
      const s = d.add(layer, { type: "path", position: [0, 0], closed, points: rel(pivot, pts), fill: null, stroke: color, stroke_width: width });
      d.op("set_stroke", { layer, shape: s, line_cap: "round", line_join: "round" });
      return s;
    },
    /** Filled polygon layer from absolute points. */
    poly(name, pivot, pts, color) {
      d.shape({ type: "path", name, position: pivot, closed: true, points: rel(pivot, pts), fill: color });
      return name;
    },
    rel,
  };
}
