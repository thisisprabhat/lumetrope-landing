// Logo mark: a lantern disc with light slits that turns slowly and spins up on hover.
import { C, Doc } from "./lib.mjs";

export const name = "logo";

export function build() {
  const d = new Doc("Logo", 40, 40, 30, 90);
  d.segment("idle", 0, 60, true);
  d.segment("fast", 60, 90, true);

  d.shape({ type: "ellipse", name: "Glow", position: [20, 20], size: [40, 40], fill: C.lume });
  d.radial("Glow", [{ offset: 0, color: C.lume, opacity: 0.35 }, { offset: 1, color: C.lume, opacity: 0 }], { start: [0, 0], end: [20, 0] });
  d.shape({ type: "ellipse", name: "Disc", position: [20, 20], size: [32, 32], fill: C.lume });
  d.linear("Disc", [{ offset: 0, color: C.lumeHi }, { offset: 0.45, color: C.lume }, { offset: 1, color: C.lumeDeep }], [-16, -16], [16, 16]);
  d.shape({ type: "ellipse", name: "Hub", position: [20, 20], size: [10, 10], fill: C.bg0 });

  // Slits: four spokes, so rotation reads even on a flat disc.
  const spoke = (a) => [[20 + 5.5 * Math.sin(a), 20 - 5.5 * Math.cos(a)], [20 + 12 * Math.sin(a), 20 - 12 * Math.cos(a)]];
  d.line("Slits", [20, 20], spoke(0), C.bg0, 3.2);
  for (const k of [1, 2, 3]) {
    const [[x0, y0], [x1, y1]] = spoke((k * Math.PI) / 2);
    d.addLine("Slits", [[x0 - 20, y0 - 20], [x1 - 20, y1 - 20]], C.bg0, 3.2);
  }

    d.track(l, "rotation", [[0, 0, "linear"], [59, 354, "hold"], [60, 0, "linear"], [89, 696, "hold"]]);
  }

  const m = d.machine("Logo");
  d.input(m, "hover", "boolean", false);
  d.state(m, "Idle", "idle", true);
  d.state(m, "Fast", "fast", true);
  d.go(m, "Idle", "Fast", [{ input: "hover", condition: "equal", value: true }]);
  d.go(m, "Fast", "Idle", [{ input: "hover", condition: "equal", value: false }]);
  d.hoverSets(m);
  return d;
}
