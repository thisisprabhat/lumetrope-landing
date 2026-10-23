import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CanvasRenderer } from "../src/engine/vendor/CanvasRenderer";
import { Engine, createEngine, initEngine } from "../src/engine/engine";
import { LumetropePlayer } from "../src/player/LumetropePlayer";

const wasm = readFileSync(new URL("../src/engine/vendor/lumetrope_wasm_bg.wasm", import.meta.url));

function buildLottie(): Uint8Array {
  const e = createEngine();
  const op = (t: string, a: object) => {
    const r = JSON.parse(e.apply(t, JSON.stringify(a)));
    if (r.error) throw new Error(`${t}: ${JSON.stringify(r.error)}`);
    return r.ok;
  };
  e.new_project(100, 100, 30, 60);
  op("create_shape", { type: "rect", name: "Box", position: [50, 50], size: [60, 60], fill: "#ff0000" });
  const m = op("add_state_machine", { name: "Main" }).machine;
  op("add_input", { machine: m, name: "hover", type: "boolean", value: false });
  op("add_input", { machine: m, name: "pet", type: "event" });
  op("add_state", { machine: m, name: "Idle", loop: true });
  op("add_state", { machine: m, name: "Perk", loop: true });
  op("add_state", { machine: m, name: "Happy", loop: true });
  op("set_initial_state", { machine: m, name: "Idle" });
  op("add_transition", { machine: m, from: "Idle", to: "Perk", guards: [{ input: "hover", condition: "equal", value: true }] });
  op("add_transition", { machine: m, from: "Perk", to: "Idle", guards: [{ input: "hover", condition: "equal", value: false }] });
  op("add_transition", { machine: m, from: "Idle", to: "Happy", guards: [{ input: "pet" }] });
  return e.export_dotlottie();
}

describe("LumetropePlayer with the real engine", () => {
  beforeAll(async () => {
    await initEngine(wasm);
    const bytes = buildLottie();
    vi.stubGlobal("fetch", async () => ({ ok: true, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) }));
    vi.stubGlobal("Path2D", class { addPath() {} moveTo() {} lineTo() {} bezierCurveTo() {} closePath() {} rect() {} ellipse() {} arc() {} });
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  it("changes state on setInput and fire", async () => {
    const ctx = new Proxy({}, { get: (_t, k) => (k === "canvas" ? {} : () => ({ addColorStop() {} })), set: () => true });
    const canvas = { width: 0, height: 0, clientWidth: 100, clientHeight: 100, getContext: () => ctx, getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) } as unknown as HTMLCanvasElement;
    const seen: string[] = [];
    const p = await LumetropePlayer.create(canvas, { src: "/x.lottie", stateMachine: "Main", onState: (s) => seen.push(s) });
    expect(p.state).toBe("Idle");
    p.setInput("hover", true);
    expect(p.state).toBe("Perk");
    p.setInput("hover", false);
    expect(p.state).toBe("Idle");
    p.fire("pet");
    expect(p.state).toBe("Happy");
    expect(seen).toEqual(["Idle", "Perk", "Idle", "Happy"]);
    p.destroy();
  });

  const mkCanvas = () => {
    const ctx = new Proxy({}, { get: (_t, k) => (k === "canvas" ? {} : () => ({ addColorStop() {} })), set: () => true });
    return { width: 0, height: 0, clientWidth: 100, clientHeight: 100, getContext: () => ctx, getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) } as unknown as HTMLCanvasElement;
  };

  it("frees the engine when the file is bad", async () => {
    const free = vi.spyOn(Engine.prototype, "free");
    vi.stubGlobal("fetch", async () => ({ ok: true, arrayBuffer: async () => new TextEncoder().encode("<html>nope</html>").buffer }));
    await expect(LumetropePlayer.create(mkCanvas(), { src: "/bad.lottie" })).rejects.toBeTruthy();
    expect(free).toHaveBeenCalledTimes(1);
    free.mockRestore();
  });

  it("skips render when the frame has not changed", async () => {
    const bytes = buildLottie();
    vi.stubGlobal("fetch", async () => ({ ok: true, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) }));
    const p = await LumetropePlayer.create(mkCanvas(), { src: "/x.lottie", stateMachine: "Main" });
    const render = vi.spyOn(CanvasRenderer.prototype, "render");
    p.step(0);
    p.step(0);
    expect(render).toHaveBeenCalledTimes(0);
    p.resize();
    expect(render).toHaveBeenCalledTimes(1);
    render.mockRestore();
    p.destroy();
  });
});
