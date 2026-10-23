// Shared scaffold for the 96×96 feature icons: a soft accent glow behind a bold
// glyph, a subtle `rest` loop and a lively `active` loop, and the `Icon` state
// machine (hover ⇄ Rest/Active, tweened 0.2 s).
import { APP_ICONS, APP_STROKE } from "./app-icons.mjs";
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

/**
 * A feature icon drawn with one of the Lumetrope app's own icons (app-icons.mjs), imported through
 * the engine's import_svg tool. Rest: the glyph breathes in the page text colour. Active (hover):
 * an accent copy traces itself over it with a trim path while the glyph pops and the glow swells,
 * re-tracing every two seconds while hovered. `nodes` adds ringed dots (16 px grid) where the app
 * icon relies on round caps that vanish at this size (the graph's states).
 */
export function appIcon(feature, accent, iconName, { nodes = [] } = {}) {
  const path = APP_ICONS[iconName];
  if (!path) throw new Error(`unknown app icon ${iconName}`);
  return icon(feature, accent, (d) => {
    const SCALE = 380; // 16 px grid -> ~61 px of the 96 px tile
    const svg = (color) =>
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="${path}" fill="none" stroke="${color}" stroke-width="${APP_STROKE}" stroke-linecap="round" stroke-linejoin="round"/>${nodes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.9" fill="#0b0c0e" stroke="${color}" stroke-width="${APP_STROKE}"/>`).join("")}</svg>`;
    const s = (n) => [n, n];
    for (const [layer, color] of [["Glyph", C.text], ["Ink", accent]]) {
      d.op("import_svg", { svg: svg(color), name: layer, position: [48, 48] });
      d.anim(layer, "scale", s(SCALE), {
        rest: [[0, s(SCALE)], [30, s(SCALE * 1.03)]],
        active: [[0, s(SCALE * 0.96)], [10, s(SCALE * 1.1), "ease_out_back"], [24, s(SCALE * 1.06)], [50, s(SCALE * 1.06)]],
      });
    }
    d.anim("Glyph", "opacity", 100, { active: [[0, 100], [12, 45]] });
    // Trim at the layer level so it applies to every group the SVG import made (paths and nodes).
    const trim = d.op("add_trim_path", { layer: "Ink", end: 0 }).shape;
    d.anim("Ink", "end", 0, { active: [[0, 0], [22, 100, "ease_out"], [50, 100]] }, { shape: trim });
  });
}
