import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createEngine, initEngine } from "../src/engine/engine";

const wasm = readFileSync(new URL("../src/engine/vendor/lumetrope_wasm_bg.wasm", import.meta.url));

describe("engine", () => {
  it("throws before init", () => {
    expect(() => createEngine()).toThrow(/initEngine/);
  });
  it("inits idempotently and runs a tool", async () => {
    const a = initEngine(wasm);
    const b = initEngine(wasm);
    expect(a).toBe(b);
    await a;
    await b;
    const e = createEngine();
    const out = JSON.parse(e.apply("create_shape", '{"type":"rect","name":"Box"}'));
    expect(out).toHaveProperty("ok");
    expect(JSON.parse(e.info()).layers).toBe(1);
  });
});
