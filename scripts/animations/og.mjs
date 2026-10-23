// Social card source (1200x630). Frame 0 is the default card, frame 1 the docs card;
// scripts/og.mjs renders each to public/og/*.png.
import { C, Doc } from "./lib.mjs";

export const name = "og";
export const options = { posterScale: 1 };

export function build() {
  const d = new Doc("Og", 1200, 630, 30, 2);

  d.shape({ type: "rect", name: "Bg", position: [600, 315], size: [1200, 630], fill: C.bg0 });
  d.shape({ type: "ellipse", name: "Warm", position: [980, 120], size: [900, 900], fill: C.lume });
  d.radial("Warm", [{ offset: 0, color: C.lume, opacity: 0.28 }, { offset: 1, color: C.lume, opacity: 0 }], { start: [0, 0], end: [450, 0] });
  d.shape({ type: "ellipse", name: "Cool", position: [160, 560], size: [800, 800], fill: C.cyan });
  d.radial("Cool", [{ offset: 0, color: C.cyan, opacity: 0.16 }, { offset: 1, color: C.cyan, opacity: 0 }], { start: [0, 0], end: [400, 0] });

  // Lantern mark, echoing the site logo.
  d.shape({ type: "ellipse", name: "Disc", position: [150, 150], size: [120, 120], fill: C.lume });
  d.linear("Disc", [{ offset: 0, color: C.lumeHi }, { offset: 0.45, color: C.lume }, { offset: 1, color: C.lumeDeep }], [-60, -60], [60, 60]);
  d.shape({ type: "ellipse", name: "Hub", position: [150, 150], size: [38, 38], fill: C.bg0 });
  const spoke = (a) => [[150 + 21 * Math.sin(a), 150 - 21 * Math.cos(a)], [150 + 45 * Math.sin(a), 150 - 45 * Math.cos(a)]];
  d.line("Slits", [150, 150], spoke(0), C.bg0, 11);
  for (const k of [1, 2, 3]) {
    const [[x0, y0], [x1, y1]] = spoke((k * Math.PI) / 2);
    d.addLine("Slits", [[x0 - 150, y0 - 150], [x1 - 150, y1 - 150]], C.bg0, 11);
  }

  d.op("create_text", { name: "Wordmark", text: "Lumetrope", font_size: 96, color: C.text, justify: "left", position: [240, 182] });
  d.op("create_text", { name: "HeadA", text: "Lottie animation editor", font_size: 64, color: C.text, justify: "left", position: [84, 400] });
  d.op("create_text", { name: "SubA", text: "State machines, a WASM engine and MCP for AI agents", font_size: 30, color: C.text1, justify: "left", position: [84, 470] });
  d.op("create_text", { name: "HeadB", text: "Documentation", font_size: 64, color: C.text, justify: "left", position: [84, 400] });
  d.op("create_text", { name: "SubB", text: "Guides for the editor, dotLottie export and MCP", font_size: 30, color: C.text1, justify: "left", position: [84, 470] });
  d.op("create_text", { name: "Url", text: "lumetrope.app", font_size: 28, color: C.lume, justify: "left", position: [84, 570] });
  d.shape({ type: "rect", name: "Rule", position: [600, 618], size: [1200, 12], fill: C.lume });

  d.track("HeadA", "opacity", [[0, 100, "hold"], [1, 0, "hold"]]);
  d.track("SubA", "opacity", [[0, 100, "hold"], [1, 0, "hold"]]);
  d.track("HeadB", "opacity", [[0, 0, "hold"], [1, 100, "hold"]]);
  d.track("SubB", "opacity", [[0, 0, "hold"], [1, 100, "hold"]]);
  return d;
}
