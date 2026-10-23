import { expect, test } from "@playwright/test";
import { lumi, recordStates, waitForPlayer, zoetrope } from "./helpers";

test("/ loads with no console errors and the hero canvas paints", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/");
  const stage = lumi(page);
  await waitForPlayer(stage);
  const canvas = stage.locator("canvas");
  await expect(canvas).toHaveCSS("opacity", "1");
  // Count non-transparent pixels the engine drew on the hero canvas.
  const painted = await canvas.evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return { n, total: d.length / 4 };
  });
  expect(painted.total).toBeGreaterThan(0);
  expect(painted.n / painted.total).toBeGreaterThan(0.05);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test.describe("Lumi", () => {
  test("clicking Lumi makes it Jump", async ({ page }) => {
    await page.goto("/");
    const stage = lumi(page);
    await waitForPlayer(stage);
    const states = await recordStates(stage);
    await stage.click();
    await expect.poll(states).toContain("Jump");
  });

  test("moving the pointer far left gives LookLeft", async ({ page }) => {
    await page.goto("/");
    const stage = lumi(page);
    await waitForPlayer(stage);
    await page.mouse.move(640, 600);
    await page.mouse.move(4, 600, { steps: 5 });
    await expect(stage).toHaveAttribute("data-state", "LookLeft");
  });

  test("the hero download CTA makes Lumi Cheer", async ({ page }) => {
    await page.goto("/");
    const stage = lumi(page);
    await waitForPlayer(stage);
    const states = await recordStates(stage);
    await page.locator("#top").getByRole("link", { name: /^Download for/ }).click();
    await expect.poll(states).toContain("Cheer");
  });

  test.describe("on an Apple Silicon Mac", () => {
    // The release (src/content/release.json) has Apple Silicon builds; Playwright's default
    // desktop UA is Windows, which correctly gets no primary button until a Windows build exists.
    // (A UA override alone reports architecture "x86", i.e. an Intel Mac, which rightly gets no
    // primary button from an arm-only release; so fake the client hints of an M-series Mac.)
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        const uad = { platform: "macOS", mobile: false, brands: [], getHighEntropyValues: async () => ({ platform: "macOS", architecture: "arm", bitness: "64" }) };
        Object.defineProperty(Navigator.prototype, "userAgentData", { get: () => uad, configurable: true });
      });
    });
  test("the Downloads section primary button makes Lumi Cheer", async ({ page }) => {
    await page.goto("/");
    // Keep the page: cancel the link's navigation after the app's own click handler has run.
    await page.evaluate(() => window.addEventListener("click", (e) => e.preventDefault()));
    const stage = lumi(page);
    await waitForPlayer(stage);
    const states = await recordStates(stage);
    const primary = page.getByTestId("primary-download").getByRole("link", { name: /^Download for/ });
    await primary.scrollIntoViewIfNeeded();
    await expect(primary).toHaveAttribute("href", /\/releases\/download\/v[\d.]+\/Lumetrope_[\d.]+_aarch64\.dmg$/);
    await primary.click();
    await expect.poll(states).toContain("Cheer");
  });
  });
});

test("hovering a feature card wakes its icon (Active)", async ({ page }) => {
  await page.goto("/");
  const card = page.locator("li.feature").first();
  await card.scrollIntoViewIfNeeded();
  const icon = card.locator("[data-state]");
  await expect(icon).toHaveAttribute("data-state", "Rest", { timeout: 15_000 });
  await card.hover();
  await expect(icon).toHaveAttribute("data-state", "Active");
  await page.mouse.move(2, 2);
  await expect(icon).toHaveAttribute("data-state", "Rest");
});

test.describe("Benefits", () => {
  /** Scroll so the section's progress (viewport middle through the section) equals `p`. */
  async function scrollToProgress(page: import("@playwright/test").Page, p: number) {
    await page.evaluate((p) => {
      const s = document.getElementById("benefits")!;
      const top = s.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + p * s.offsetHeight - window.innerHeight / 2);
    }, p);
  }
  const highlighted = (page: import("@playwright/test").Page) =>
    page.locator("#benefits li .benefit.border-lume h3");

  // On a real (slow) connection the zoetrope's player starts well after the last scroll event.
  // Hold its file back so that ordering is deterministic here too.
  test.beforeEach(async ({ page }) => {
    await page.route("**/animations/zoetrope.lottie", async (r) => {
      await new Promise((res) => setTimeout(res, 1500));
      await r.continue();
    });
  });

  test("scrolling Benefits to 60% gives B3, matching the highlighted benefit", async ({ page }) => {
    await page.goto("/");
    await scrollToProgress(page, 0.6);
    const zoe = zoetrope(page);
    await expect(zoe).toHaveAttribute("data-state", "B3", { timeout: 15_000 });
    await expect(highlighted(page)).toHaveText("Interactive output that plays anywhere dotLottie does");
  });

  test("a click spins the zoetrope, then it returns to the scrolled benefit", async ({ page }) => {
    await page.goto("/");
    await scrollToProgress(page, 0.6);
    const zoe = zoetrope(page);
    await expect(zoe).toHaveAttribute("data-state", "B3", { timeout: 15_000 });
    const states = await recordStates(zoe);
    await zoe.click();
    await expect.poll(states).toContain("Spin");
    await expect(zoe).toHaveAttribute("data-state", "B3", { timeout: 10_000 });
  });

  for (const vp of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
    test(`the zoetrope and the text list agree at every step (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/");
      const zoe = zoetrope(page);
      const titles = await page.locator("#benefits li h3").allTextContents();
      // Land on the section top in one jump (as the nav anchor does) and stop: the player starts
      // after the last scroll event, and must still pick up the same progress as the text.
      await page.evaluate(() => document.getElementById("benefits")!.scrollIntoView());
      for (const p of [null, 0.1, 0.35, 0.6, 0.85, 0.35, 0.1]) {
        if (p !== null) await scrollToProgress(page, p);
        await expect(async () => {
          const state = await zoe.getAttribute("data-state");
          const text = await highlighted(page).textContent();
          expect(state).toMatch(/^B[1-4]$/);
          expect(text).toBe(titles[Number(state!.slice(1)) - 1]);
        }).toPass({ timeout: 10_000 });
        if (p !== null) await expect(zoe).toHaveAttribute("data-state", `B${Math.floor(p * 4) + 1}`);
      }
    });
  }
});

test("the Docs link stays reachable at 320px without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");
  const docs = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Docs" });
  await expect(docs).toBeVisible();
  const box = (await docs.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
