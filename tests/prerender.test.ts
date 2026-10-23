// Always cleans dist/ and runs `pnpm build` in beforeAll, so assertions reflect current source.
import { existsSync, readFileSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { beforeAll, expect, test } from "vitest";

beforeAll(() => {
  rmSync("dist", { recursive: true, force: true });
  execSync("pnpm build", { stdio: "inherit" });
}, 180000);

test("landing is pre-rendered", () => {
  const html = readFileSync("dist/index.html", "utf8");
  expect(html).toContain('<html lang="en"');
  expect(html).toContain("<h1");
  expect(html).toContain("Lumetrope");
});

test("docs page is pre-rendered", () => {
  expect(existsSync("dist/docs/getting-started/index.html")).toBe(true);
  expect(readFileSync("dist/docs/getting-started/index.html", "utf8")).toContain("<h1");
});
