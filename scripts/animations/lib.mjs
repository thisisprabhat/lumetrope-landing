// Shared helpers for the animation generators. Every .lottie on the site is
// authored by scripting Lumetrope's own WASM engine through its editing tools
// (the same catalogue an AI agent drives over MCP), then exported as dotLottie.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import init, { Engine, WebpExporter } from "../../src/engine/vendor/lumetrope_wasm.js";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

let ready;
/** Initialise the vendored WASM engine once (Node: from the bytes on disk). */
export function initEngine() {
  ready ??= init({ module_or_path: readFileSync(join(ROOT, "src/engine/vendor/lumetrope_wasm_bg.wasm")) });
  return ready;
}

// Darkroom theme tokens.
export const C = {
  bg0: "#0b0c0e",
  bg1: "#111316",
  bg2: "#16191d",
  bg3: "#1d2126",
  edge: "#3d4550",
  raised: "#2b313a",
  lume: "#ffb340",
  lumeHi: "#fff4d6",
  lumeDeep: "#ff9a1f",
  cyan: "#6fd3ff",
  ok: "#7ee2a8",
  violet: "#b69cff",
  text: "#eceae4",
  text1: "#b5b3ac",
  text2: "#7c7b76",
};

/** Easing used for tweened state transitions: jumps most of the way at once, then settles. */
export const SNAP_SETTLE = [0, 1, 0, 1];

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Thin wrapper over the engine's tool API (`apply(tool, argsJson)`). */
export class Doc {
  constructor(name, w, h, fps, frames) {
    this.e = new Engine();
    this.e.new_project(w, h, fps, frames);
    this.w = w;
    this.h = h;
    this.fps = fps;
    this.frames = frames;
    this.segs = new Map();
    this.keys = new Map();
    this.op("set_scene_settings", { name });
  }

  op(tool, args) {
    const r = JSON.parse(this.e.apply(tool, JSON.stringify(args)));
    if (r.error !== undefined) throw new Error(`${tool} ${JSON.stringify(args)}: ${r.error}`);
    return r.ok;
  }

  /** create_shape; returns the layer name. */
  shape(args) {
    this.op("create_shape", args);
    return args.name;
  }

  /** add_shape into a layer; returns the new group's shape path. */
  add(layer, args) {
    return this.op("add_shape", { layer, ...args }).shape;
  }

  /** Round-capped stroked polyline layer pivoting at `pivot` (points in comp space). */
  line(name, pivot, pts, color, width, closed = false) {
    const points = pts.map(([x, y]) => [x - pivot[0], y - pivot[1]]);
    this.shape({ type: "path", name, position: pivot, closed, points, fill: null, stroke: color, stroke_width: width });
    this.op("set_stroke", { layer: name, line_cap: "round", line_join: "round" });
    return name;
  }

  /** Another stroked polyline inside `layer` (points relative to the layer origin). */
  addLine(layer, pts, color, width, closed = false) {
    const s = this.add(layer, { type: "path", position: [0, 0], closed, points: pts, fill: null, stroke: color, stroke_width: width });
    this.op("set_stroke", { layer, shape: s, line_cap: "round", line_join: "round" });
    return s;
  }

  null(name, position, parent) {
    this.op("create_null", { name, position });
    if (parent) this.parent(name, parent);
    return name;
  }

  parent(layer, parent) {
    this.op("set_parent", { layer, parent });
  }

  set(layer, props) {
    this.op("set_transform", { layer, ...props });
  }

  glow(layer, blurriness) {
    this.op("add_effect", { layer, type: "gaussian_blur", params: { blurriness } });
  }

  radial(layer, stops, opts = {}) {
    this.op("set_gradient", { layer, kind: "fill", type: "radial", stops, ...opts });
  }

  linear(layer, stops, start, end, opts = {}) {
    this.op("set_gradient", { layer, kind: "fill", type: "linear", stops, start, end, ...opts });
  }

  segment(name, start, end, loop) {
    this.op("add_segment", { name, start, end });
    this.segs.set(name, { start, end, loop });
  }

  /** One keyframe. Refuses to silently overwrite a different value at the same frame. */
  key(layer, prop, frame, value, easing = "ease_in_out", shape) {
    const id = `${layer}|${shape ?? ""}|${prop}|${frame}`;
    const prev = this.keys.get(id);
    if (prev && !same(prev, value)) throw new Error(`keyframe clash ${id}: ${JSON.stringify(prev)} vs ${JSON.stringify(value)}`);
    this.keys.set(id, value);
    const a = { layer, property: prop, frame, value, easing };
    if (shape !== undefined) a.shape = shape;
    this.op("set_keyframe", a);
  }

  /** Absolute keyframes: [[frame, value, easing?], ...]. */
  track(layer, prop, pts, { shape, ease = "ease_in_out" } = {}) {
    for (const [f, v, e] of pts) this.key(layer, prop, f, v, e ?? ease, shape);
  }

  /**
   * Keyframe a property across every segment. `spec[segment]` is either a
   * constant or [[localFrame, value, easing?], ...]; segments left out hold
   * `base`. Each segment gets a key on its first frame; loop segments are
   * closed on their last frame (back to their first value) and every segment
   * ends on a hold so nothing interpolates into the next one.
   */
  anim(layer, prop, base, spec = {}, { shape, ease = "ease_in_out" } = {}) {
    for (const [name, { start, end, loop }] of this.segs) {
      const s = spec[name] ?? base;
      let pts = Array.isArray(s) && Array.isArray(s[0]) ? s.map((p) => [...p]) : [[0, s]];
      if (pts[0][0] !== 0) throw new Error(`${layer}.${prop}: ${name} needs a key at 0`);
      const len = end - start;
      if (pts.some((p) => p[0] >= len)) throw new Error(`${layer}.${prop}: ${name} key beyond ${len - 1}`);
      if (loop && pts.length > 1 && pts[pts.length - 1][0] !== len - 1) pts.push([len - 1, pts[0][1]]);
      pts[pts.length - 1][2] = "hold";
      for (const [f, v, e] of pts) this.key(layer, prop, start + f, v, e ?? ease, shape);
    }
  }

  // ---------------------------------------------------------------- machines

  machine(id) {
    return this.op("add_state_machine", { id, name: id }).machine;
  }
  input(m, name, type, value) {
    const a = { machine: m, name, type };
    if (value !== undefined) a.value = value;
    this.op("add_input", a);
  }
  state(m, name, segment, loop, extra = {}) {
    this.op("add_state", { machine: m, name, segment, loop, ...extra });
  }
  global(m, name = "Any") {
    this.op("add_state", { machine: m, name, type: "global" });
  }
  go(m, from, to, guards, extra = {}) {
    const a = { machine: m, from, to, ...extra };
    if (guards) a.guards = guards;
    this.op("add_transition", a);
  }
  on(m, type, actions, layer) {
    const a = { machine: m, type, actions };
    if (layer) a.layer = layer;
    this.op("add_interaction", a);
  }
  /** PointerEnter / PointerExit set `input` true / false. */
  hoverSets(m, input = "hover", layer) {
    this.on(m, "PointerEnter", [{ type: "set_boolean", input, value: true }], layer);
    this.on(m, "PointerExit", [{ type: "set_boolean", input, value: false }], layer);
  }
}

export const is = (input, value, condition = "equal") => [{ input, condition, value }];
export const ev = (input) => [{ input }];

// ------------------------------------------------------------------ geometry

/** Points of a circular arc (degrees, 0 = up, clockwise) around [cx, cy]. */
export function arc(cx, cy, r, from, to, steps = 24) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    pts.push([round(cx + r * Math.sin(a)), round(cy - r * Math.cos(a))]);
  }
  return pts;
}

/** Closed gear outline: `teeth` trapezoid teeth between radii rIn and rOut. */
export function gear(teeth, rIn, rOut, cx = 0, cy = 0) {
  const pts = [];
  const step = 360 / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    for (const [da, r] of [[-0.3, rIn], [-0.17, rOut], [0.17, rOut], [0.3, rIn]]) {
      const t = ((a + da * step) * Math.PI) / 180;
      pts.push([round(cx + r * Math.sin(t)), round(cy - r * Math.cos(t))]);
    }
  }
  return pts;
}

export const round = (n) => Math.round(n * 100) / 100;

// ------------------------------------------------------------------ output

/** Export `doc` to public/animations/<name>.lottie and its poster (first frame, WebP) to public/posters/<name>.webp. */
export function writeAnimation(name, doc, { posterScale } = {}) {
  const anim = join(ROOT, "public/animations", `${name}.lottie`);
  const poster = join(ROOT, "public/posters", `${name}.webp`);
  mkdirSync(dirname(anim), { recursive: true });
  mkdirSync(dirname(poster), { recursive: true });
  writeFileSync(anim, doc.e.export_dotlottie());
  // Small players get a 2x poster so it stays crisp on high-density screens.
  const s = posterScale ?? (Math.max(doc.w, doc.h) <= 240 ? 2 : 1);
  const [w, h] = [Math.round(doc.w * s), Math.round(doc.h * s)];
  const webp = new WebpExporter(w, h, doc.fps, true, new Uint8Array([0, 0, 0, 0]));
  webp.push(doc.e.render(0, w, h));
  writeFileSync(poster, webp.finish());
  return { anim, poster };
}
