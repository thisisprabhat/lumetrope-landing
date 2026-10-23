// @vitest-environment node
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const pub = join(process.cwd(), "public");
const media = JSON.parse(readFileSync(join(process.cwd(), "src/sections/media.json"), "utf8"));
const files = (d: string): string[] =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(d, e.name)) : [join(d, e.name)],
  );

describe("media.json", () => {
  it("has 6-8 shots with alt and caption", () => {
    expect(media.shots.length).toBeGreaterThanOrEqual(6);
    expect(media.shots.length).toBeLessThanOrEqual(8);
    for (const s of media.shots) {
      expect(s.alt.trim()).not.toBe("");
      expect(s.caption.trim()).not.toBe("");
    }
  });
  it("references existing files", () => {
    const refs = [...media.shots.map((s: any) => s.src), media.video.webm, media.video.poster];
    if (media.video.mp4) refs.push(media.video.mp4);
    for (const r of refs) expect(existsSync(join(pub, r)), r).toBe(true);
  });
  it("total size under 15 MB", () => {
    const total = files(join(pub, "media")).reduce((n, f) => n + statSync(f).size, 0);
    expect(total).toBeLessThan(15 * 1024 * 1024);
  });
});
