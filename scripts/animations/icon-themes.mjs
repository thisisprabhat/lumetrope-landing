// Feature icon: themes & slots. Three overlapping colour swatches breathe at
// rest and swirl apart and back together on hover.
import { icon } from "./icon-kit.mjs";

export const name = "icon-themes";

export function build() {
  return icon("themes", "#b69cff", (d, k) => {
    d.null("Palette", [48, 50]);
    const dot = (deg, r) => [Math.round(r * Math.sin((deg * Math.PI) / 180) * 100) / 100, Math.round(-r * Math.cos((deg * Math.PI) / 180) * 100) / 100];
    [[k.C.lume, 0], [k.C.cyan, 120], [k.C.violet, 240]].forEach(([color, deg], i) => {
      const nm = `Swatch ${i + 1}`;
      d.shape({ type: "ellipse", name: nm, position: dot(deg, 11), size: [34, 34], fill: color });
      d.op("set_blend_mode", { layer: nm, mode: "screen" });
      d.set(nm, { opacity: 92 });
      d.parent(nm, "Palette");
      d.anim(nm, "position", dot(deg, 11), {
        rest: [[0, dot(deg, 11)], [30, dot(deg, 13)]],
        active: [[0, dot(deg, 11), "ease_out_back"], [12, dot(deg, 19)], [34, dot(deg, 19), "ease_in_out_back"], [50, dot(deg, 11)]],
      });
      d.anim(nm, "scale", [100, 100], { active: [[0, [100, 100]], [12, [82, 82]], [34, [82, 82]], [50, [100, 100]]] });
    });
    d.anim("Palette", "rotation", 0, { rest: [[0, 0], [30, 12]], active: [[0, 0], [50, 360]] });
  });
}
