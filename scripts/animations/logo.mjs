// Logo: the Lumetrope brand mark (brand.mjs, the same ring-and-dot the app uses) with a warm glow.
// The slit ring turns slowly and spins up on hover, like a zoetrope drum.
import { brandMark } from "./brand.mjs";
import { C, Doc } from "./lib.mjs";

export const name = "logo";

export function build() {
  const d = new Doc("Logo", 40, 40, 30, 90);
  d.segment("idle", 0, 60, true);
  d.segment("fast", 60, 90, true);

  d.shape({ type: "ellipse", name: "Glow", position: [20, 20], size: [40, 40], fill: C.lume });
  d.radial("Glow", [{ offset: 0, color: C.lume, opacity: 0.3 }, { offset: 1, color: C.lume, opacity: 0 }], { start: [0, 0], end: [20, 0] });
  const { ring, dot } = brandMark(d, "Mark", [20, 20], 40);

  d.track(ring, "rotation", [[0, 0, "linear"], [59, 88.5, "hold"], [60, 0, "linear"], [89, 348, "hold"]]);
  d.track(dot, "scale", [[0, [100, 100]], [30, [112, 112]], [59, [100, 100], "hold"], [60, [100, 100]], [75, [125, 125]], [89, [100, 100], "hold"]]);
  d.track("Glow", "opacity", [[0, 70], [30, 100], [59, 70, "hold"], [60, 100], [89, 100, "hold"]]);

  const m = d.machine("Logo");
  d.input(m, "hover", "boolean", false);
  d.state(m, "Idle", "idle", true);
  d.state(m, "Fast", "fast", true);
  d.go(m, "Idle", "Fast", [{ input: "hover", condition: "equal", value: true }]);
  d.go(m, "Fast", "Idle", [{ input: "hover", condition: "equal", value: false }]);
  d.hoverSets(m);
  return d;
}
