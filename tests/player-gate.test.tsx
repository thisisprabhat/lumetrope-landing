import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

// The real gate on a fake Safari-like window (no requestIdleCallback): the stage must not import
// the engine/player until load + two frames + a task have happened.
const env = vi.hoisted(() => {
  const q = { load: [] as (() => void)[], frames: [] as (() => void)[], tasks: [] as (() => void)[] };
  const w = {
    document: { readyState: "loading" },
    addEventListener: (t: string, cb: () => void) => { if (t === "load") q.load.push(cb); },
    setTimeout: (cb: () => void) => { q.tasks.push(cb); return 1; },
    requestAnimationFrame: (cb: () => void) => { q.frames.push(cb); return 1; },
  };
  const run = (k: keyof typeof q) => q[k].splice(0).forEach((cb) => cb());
  return { w, run };
});
vi.mock("../src/player/startGate", async (orig) => {
  const real = await orig<typeof import("../src/player/startGate")>();
  return { ...real, afterFirstPaint: real.createAfterFirstPaint(env.w as never) };
});
const create = vi.fn(async () => ({ setInput() {}, fire() {}, pointer() {}, play() {}, pause() {}, resize() {}, destroy() {}, state: "Idle" }));
vi.mock("../src/player/LumetropePlayer", () => ({ LumetropePlayer: { create: (...a: unknown[]) => (create as (...x: unknown[]) => unknown)(...a) } }));
import { LottieStage } from "../src/player/LottieStage";

afterEach(cleanup);
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });

it("without requestIdleCallback the hero player waits for load and two frames before starting the engine", async () => {
  render(<LottieStage src="/a.lottie" poster="/p.png" alt="Demo" priority />);
  await flush();
  expect(create).not.toHaveBeenCalled(); // hydration: no engine
  env.run("load");
  await flush();
  expect(create).not.toHaveBeenCalled();
  env.run("frames");
  env.run("frames");
  await flush();
  expect(create).not.toHaveBeenCalled();
  env.run("tasks");
  await flush();
  await vi.waitFor(() => expect(create).toHaveBeenCalledTimes(1));
});

it("an explicit click starts at once, gate or not", async () => {
  create.mockClear();
  const { container } = render(<LottieStage src="/b.lottie" poster="/p.png" alt="Demo b" />);
  fireEvent.click(container.querySelector("[role=button]")!);
  await vi.waitFor(() => expect(create).toHaveBeenCalledTimes(1));
});
