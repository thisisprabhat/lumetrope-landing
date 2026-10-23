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
  it("maps .wasm to application/wasm only inside the wasm location (no duplicate with mime.types)", () => {
    const loc = nginx.match(/location ~\* \\\.wasm\$ \{([^}]*\{[^}]*\}[^}]*)\}/);
    expect(loc, "wasm location").not.toBeNull();
    expect(loc![1]).toMatch(/types\s*\{\s*application\/wasm\s+wasm;\s*\}/);
    expect(loc![1]).toContain("public, max-age=31536000, immutable");
    // exactly one types {} block in the file, and it is that one
    expect(nginx.replace(/#.*$/gm, "").match(/types\s*\{/g)).toHaveLength(1);
  });
  it("compresses JS (both MIME spellings) and wasm", () => {
    const gz = nginx.match(/gzip_types([^;]*);/)![1];
    for (const t of ["text/javascript", "application/javascript", "application/wasm", "text/css"]) expect(gz).toContain(t);
  });
  it("caches /assets/ immutably and pages with no-cache", () => {
    expect(nginx).toMatch(/location \/assets\/ \{[^}]*public, max-age=31536000, immutable/);
    expect(nginx).toMatch(/location \/ \{[^}]*no-cache/);
  });
  it("serves the pre-rendered 404 page", () => expect(nginx).toMatch(/^\s*error_page 404 \/404\.html;/m));
  it("serves pre-rendered route folders", () => expect(nginx).toContain("try_files $uri $uri/index.html"));
});
