// dist/ is rebuilt from current source once per run by tests/global-build.ts.
import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("landing is pre-rendered", () => {
  const html = readFileSync("dist/index.html", "utf8");
  expect(html).toContain('<html lang="en"');
  expect(html).toContain("<h1");
  expect(html).toContain("Lumetrope");
});

test("404.html and the docs index are pre-rendered", () => {
  expect(existsSync("dist/404.html")).toBe(true);
  expect(readFileSync("dist/404.html", "utf8")).toContain("Page not found");
  expect(readFileSync("dist/docs/index.html", "utf8")).toContain("Lumetrope documentation");
});

test("docs page is pre-rendered", () => {
  expect(existsSync("dist/docs/getting-started/index.html")).toBe(true);
  expect(readFileSync("dist/docs/getting-started/index.html", "utf8")).toContain("<h1");
});
