import { describe, expect, it } from "vitest";
import { createAfterFirstPaint } from "../src/player/startGate";

/** A fake window whose load, frames, idle callbacks and tasks run only when the test says so. */
function fakeWindow({ ric = true, raf = true, readyState = "loading" as DocumentReadyState } = {}) {
  const q = { load: [] as (() => void)[], frames: [] as (() => void)[], idle: [] as (() => void)[], tasks: [] as (() => void)[] };
  const w = {
    document: { readyState },
    addEventListener: (t: string, cb: () => void) => { if (t === "load") q.load.push(cb); },
    setTimeout: (cb: () => void) => { q.tasks.push(cb); return 1; },
    ...(raf ? { requestAnimationFrame: (cb: () => void) => { q.frames.push(cb); return 1; } } : {}),
    ...(ric ? { requestIdleCallback: (cb: () => void) => { q.idle.push(cb); return 1; } } : {}),
  };
  const run = (k: keyof typeof q) => { const cbs = q[k].splice(0); cbs.forEach((cb) => cb()); return cbs.length; };
  return { w: w as never, q, run };
}
const flush = () => new Promise((r) => setTimeout(r, 0));
function track(p: Promise<void>) {
  const s = { done: false };
  p.then(() => (s.done = true));
  return s;
}

describe("afterFirstPaint gate", () => {
  it("without requestIdleCallback (Safari) still waits for load, two frames and a task", async () => {
    const { w, run } = fakeWindow({ ric: false });
    const s = track(createAfterFirstPaint(w)());
    await flush();
    expect(s.done).toBe(false); // hydration time: nothing yet
    expect(run("frames")).toBe(0); // no frame requested before load
    run("load");
    await flush();
    expect(s.done).toBe(false);
    run("frames"); // first paint
    await flush();
    expect(s.done).toBe(false);
    run("frames"); // second frame: the first one has been presented
    await flush();
    expect(s.done).toBe(false);
    expect(run("tasks")).toBe(1);
    await flush();
    expect(s.done).toBe(true);
  });

  it("with requestIdleCallback waits for load, two frames and idle", async () => {
    const { w, run } = fakeWindow();
    const s = track(createAfterFirstPaint(w)());
    run("load");
    run("frames");
    run("frames");
    await flush();
    expect(s.done).toBe(false);
    expect(run("idle")).toBe(1);
    await flush();
    expect(s.done).toBe(true);
  });

  it("skips the load wait when the document is already complete", async () => {
    const { w, run, q } = fakeWindow({ ric: false, readyState: "complete" });
    const s = track(createAfterFirstPaint(w)());
    expect(q.frames).toHaveLength(1);
    run("frames");
    run("frames");
    run("tasks");
    await flush();
    expect(s.done).toBe(true);
  });

  it("is shared: one load listener however many players ask", async () => {
    const { w, q } = fakeWindow();
    const gate = createAfterFirstPaint(w);
    expect(gate()).toBe(gate());
    expect(q.load).toHaveLength(1);
  });

  it("opens at once only where there is no rAF at all", async () => {
    const { w } = fakeWindow({ raf: false, ric: false });
    const s = track(createAfterFirstPaint(w)());
    await flush();
    expect(s.done).toBe(true);
  });
});
