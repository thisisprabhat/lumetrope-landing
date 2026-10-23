import { expect, test } from "@playwright/test";
import { lumi, waitForPlayer } from "./helpers";

test.use({ reducedMotion: "reduce" });

test("with prefers-reduced-motion no rAF loop runs until a click", async ({ page }) => {
  // Count requestAnimationFrame calls from page code.
  await page.addInitScript(() => {
    const w = window as unknown as { __raf: number };
    w.__raf = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => { w.__raf++; return raf(cb); };
  });
  const wasm: string[] = [];
  page.on("request", (r) => r.url().endsWith(".wasm") && wasm.push(r.url()));
  const rafCount = () => page.evaluate(() => (window as unknown as { __raf: number }).__raf);

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const stage = lumi(page);
  await expect(stage.locator("img")).toBeVisible();

  // Idle for a second: a running loop would request ~60 frames.
  const before = await rafCount();
  await page.waitForTimeout(1000);
  expect(await rafCount() - before).toBeLessThan(3);
  expect(wasm).toEqual([]);
  await expect(stage).toHaveAttribute("data-state", "");

  // An explicit click starts the player.
  await stage.click();
  await waitForPlayer(stage);
  expect(wasm.length).toBe(1);
  const started = await rafCount();
  await page.waitForTimeout(1000);
  expect(await rafCount() - started).toBeGreaterThan(20);
});
