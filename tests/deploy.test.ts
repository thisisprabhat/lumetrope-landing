import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const headers = readFileSync("public/_headers", "utf8");
const nginx = readFileSync("deploy/nginx.conf", "utf8");

/** Header lines of one `_headers` rule (the indented lines after the path line). */
function rule(path: string): string[] {
  const lines = headers.split("\n");
  const i = lines.indexOf(path);
  if (i < 0) return [];
  const out: string[] = [];
  for (const l of lines.slice(i + 1)) {
    if (!/^\s+\S/.test(l)) break;
    out.push(l.trim());
  }
  return out;
}

describe("_headers (Netlify / Cloudflare Pages)", () => {
  it("serves the engine as application/wasm", () => expect(rule("/assets/*.wasm")).toContain("Content-Type: application/wasm"));
  it("caches hashed assets forever", () => expect(rule("/assets/*")).toContain("Cache-Control: public, max-age=31536000, immutable"));
  it("revalidates every pre-rendered page", () => {
    for (const p of ["/", "/index.html", "/docs/*"]) expect(rule(p), p).toContain("Cache-Control: no-cache");
  });
  it("never sets Cache-Control on a catch-all rule (it would merge into the asset rules)", () => {
    expect(rule("/*").some((l) => l.startsWith("Cache-Control"))).toBe(false);
  });
});

describe("deploy/nginx.conf", () => {
  it("maps .wasm to application/wasm and compresses it", () => {
    expect(nginx).toMatch(/types\s*\{\s*application\/wasm\s+wasm;\s*\}/);
    expect(nginx).toMatch(/gzip_types[^;]*application\/wasm/);
  });
  it("caches /assets/ immutably and pages with no-cache", () => {
    expect(nginx).toMatch(/location \/assets\/ \{[^}]*public, max-age=31536000, immutable/);
    expect(nginx).toMatch(/location \/ \{[^}]*no-cache/);
  });
  it("serves pre-rendered route folders", () => expect(nginx).toContain("try_files $uri $uri/index.html"));
});
