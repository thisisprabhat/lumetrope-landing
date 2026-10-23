// State-machine explainer for the docs: a lamp switch. Click (or tap) anywhere
// fires `toggle`: Off -> SwitchOn -> On -> SwitchOff -> Off. The live state
// name is shown by the docs page next to the player.
import { C, Doc, ev } from "./lib.mjs";

export const name = "sm-explainer";

const KNOB_OFF = [196, 220];
const KNOB_ON = [284, 220];
const s2 = (n) => [n, n];

export function build() {
  const d = new Doc("Explainer", 480, 360, 30, 130);
  d.segment("off", 0, 30, true);
  d.segment("switchOn", 30, 50, false);
  d.segment("on", 50, 110, true);
  d.segment("switchOff", 110, 130, false);

  // Lamp glow + bulb above the switch.
  d.shape({ type: "ellipse", name: "Lamp Glow", position: [240, 96], size: [260, 260], fill: C.lume });
  d.radial("Lamp Glow", [{ offset: 0, color: C.lume, opacity: 0.5 }, { offset: 0.55, color: C.lume, opacity: 0.12 }, { offset: 1, color: C.lume, opacity: 0 }], { start: [0, 0], end: [130, 0] });
  d.shape({ type: "ellipse", name: "Bulb", position: [240, 96], size: [74, 74], fill: C.bg3, stroke: C.edge, stroke_width: 4 });
  d.shape({ type: "ellipse", name: "Bulb Lit", position: [240, 96], size: [74, 74], fill: C.lume });
  d.radial("Bulb Lit", [{ offset: 0, color: C.lumeHi }, { offset: 1, color: C.lume }], { start: [0, 0], end: [37, 0] });
  d.shape({ type: "rect", name: "Socket", position: [240, 146], size: [38, 20], roundness: 5, fill: C.raised, stroke: C.edge, stroke_width: 3 });

  // The switch.
  d.shape({ type: "rect", name: "Track", position: [240, 220], size: [200, 90], roundness: 45, fill: C.bg3, stroke: C.edge, stroke_width: 4 });
  d.shape({ type: "rect", name: "Track On", position: [240, 220], size: [200, 90], roundness: 45, fill: C.lume, stroke: C.lumeDeep, stroke_width: 4 });
  d.shape({ type: "ellipse", name: "Knob", position: KNOB_OFF, size: s2(70), fill: C.text1, stroke: C.edge, stroke_width: 3 });
  d.shape({ type: "ellipse", name: "Knob Dot", position: KNOB_OFF, size: s2(18), fill: C.bg3 });
  d.line("Hint", [240, 300], [[218, 300], [240, 316], [262, 300]], C.text2, 5);

  const knob = (a, b) => ({ off: a, switchOn: [[0, a], [18, b, "ease_out_back"]], on: b, switchOff: [[0, b], [18, a, "ease_out_back"]] });
  for (const l of ["Knob", "Knob Dot"]) d.anim(l, "position", KNOB_OFF, knob(KNOB_OFF, KNOB_ON));
  d.anim("Track On", "opacity", 0, { off: 0, switchOn: [[0, 0], [14, 100]], on: 100, switchOff: [[0, 100], [14, 0]] });
  d.anim("Bulb Lit", "opacity", 0, { off: 0, switchOn: [[0, 0], [10, 100]], on: [[0, 100], [30, 88]], switchOff: [[0, 100], [12, 0]] });
  d.anim("Lamp Glow", "opacity", 0, { off: 0, switchOn: [[0, 0], [14, 100]], on: [[0, 100], [30, 80]], switchOff: [[0, 100], [14, 0]] });
  d.anim("Lamp Glow", "scale", s2(100), { switchOn: [[0, s2(80)], [18, s2(100)]], on: [[0, s2(100)], [30, s2(106)]] });
  d.anim("Hint", "position", [240, 300], { off: [[0, [240, 300]], [15, [240, 308]]], on: [240, 300] });
  d.anim("Hint", "opacity", 100, { on: 35, switchOn: [[0, 100], [12, 35]], switchOff: [[0, 35], [12, 100]] });

  const m = d.machine("Explainer");
  d.input(m, "toggle", "event");
  d.state(m, "Off", "off", true);
  d.state(m, "SwitchOn", "switchOn", false);
  d.state(m, "On", "on", true);
  d.state(m, "SwitchOff", "switchOff", false);
  d.go(m, "Off", "SwitchOn", ev("toggle"));
  d.go(m, "SwitchOn", "On");
  d.go(m, "On", "SwitchOff", ev("toggle"));
  d.go(m, "SwitchOff", "Off");
  d.on(m, "Click", [{ type: "fire", input: "toggle" }]);
  return d;
}
