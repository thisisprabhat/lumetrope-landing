// Social card source (1200x630). Frame 0 is the default card, frame 1 the docs card;
// scripts/og.mjs renders each to public/og/*.png.
import { brandMark } from "./brand.mjs";
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

  // The brand mark, as on the site logo and the app icon.
  d.shape({ type: "ellipse", name: "Halo", position: [150, 150], size: [200, 200], fill: C.lume });
  d.radial("Halo", [{ offset: 0, color: C.lume, opacity: 0.3 }, { offset: 1, color: C.lume, opacity: 0 }], { start: [0, 0], end: [100, 0] });
  brandMark(d, "Mark", [150, 150], 140);

  d.op("create_text", { name: "Wordmark", text: "Lumetrope", font_size: 96, color: C.text, justify: "left", position: [240, 182] });
  d.op("create_text", { name: "HeadA", text: "Lottie animation editor", font_size: 64, color: C.text, justify: "left", position: [84, 400] });
  d.op("create_text", { name: "SubA", text: "State machines, a WASM engine and MCP for AI agents", font_size: 30, color: C.text1, justify: "left", position: [84, 470] });
  d.op("create_text", { name: "HeadB", text: "Documentation", font_size: 64, color: C.text, justify: "left", position: [84, 400] });
  d.op("create_text", { name: "SubB", text: "Guides for the editor, dotLottie export and MCP", font_size: 30, color: C.text1, justify: "left", position: [84, 470] });
  d.op("create_text", { name: "Url", text: "github.com/thisisprabhat/lumetrope", font_size: 28, color: C.lume, justify: "left", position: [84, 570] });
  d.shape({ type: "rect", name: "Rule", position: [600, 618], size: [1200, 12], fill: C.lume });

  d.track("HeadA", "opacity", [[0, 100, "hold"], [1, 0, "hold"]]);
  d.track("SubA", "opacity", [[0, 100, "hold"], [1, 0, "hold"]]);
  d.track("HeadB", "opacity", [[0, 0, "hold"], [1, 100, "hold"]]);
  d.track("SubB", "opacity", [[0, 0, "hold"], [1, 100, "hold"]]);
  return d;
}
