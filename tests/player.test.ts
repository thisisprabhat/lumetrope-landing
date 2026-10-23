import { describe, expect, it } from "vitest";
import { fitRect, toComp } from "../src/player/geometry";

describe("geometry", () => {
  it("fitRect contain", () => {
    const f = fitRect({ w: 400, h: 300 }, { w: 1000, h: 500 }, "contain");
    expect(f.scale).toBeCloseTo(1.6667, 4);
    expect(f.x).toBeCloseTo(166.67, 2);
    expect(f.y).toBeCloseTo(0, 5);
  });
  it("fitRect cover", () => {
    const f = fitRect({ w: 400, h: 300 }, { w: 1000, h: 500 }, "cover");
    expect(f.scale).toBeCloseTo(2.5, 5);
    expect(f.x).toBeCloseTo(0, 5);
    expect(f.y).toBeCloseTo(-125, 5);
  });
  it("toComp with a cover offset", () => {
    const f = fitRect({ w: 400, h: 300 }, { w: 1000, h: 500 }, "cover");
    const [x, y] = toComp(600, 150, { left: 100, top: 50 } as DOMRect, f);
    expect(x).toBeCloseTo(200, 5);
    expect(y).toBeCloseTo(90, 5); // (150-50+125)/2.5
  });
});
