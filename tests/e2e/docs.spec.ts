import { expect, test } from "@playwright/test";

test("the docs search filters the sidebar", async ({ page }) => {
  await page.goto("/docs/getting-started/");
  const nav = page.getByRole("navigation", { name: "Docs" });
  const links = nav.getByRole("link");
  const all = await links.count();
  expect(all).toBeGreaterThan(10);
  await page.getByRole("searchbox", { name: "Search the docs" }).fill("mcp");
  await expect(nav.getByRole("link", { name: "Connect AI agents with MCP" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Install on macOS" })).toHaveCount(0);
  expect(await links.count()).toBeLessThan(all);
  await page.getByRole("searchbox", { name: "Search the docs" }).fill("zzzz-no-such-page");
  await expect(nav.getByText("No matching pages.")).toBeVisible();
  await expect(links).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Search the docs" }).fill("");
  await expect(links).toHaveCount(all);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("/docs/mcp/ still shows the setup commands", async ({ page }) => {
    await page.goto("/docs/mcp/");
    const main = page.locator("main");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Connect AI agents with MCP");
    await expect(main.locator("pre", { hasText: 'claude mcp add --scope user lumetrope -- node "<server path>"' })).toBeVisible();
    await expect(main.locator("pre", { hasText: 'codex mcp add lumetrope -- node "<server path>"' })).toBeVisible();
    await expect(main.getByText("~/Library/Application Support/com.waygosquad.lumetrope/mcp/lumetrope-mcp.mjs")).toBeVisible();
    // Sanity: scripts really are off (the search box is client-only).
    await expect(page.getByRole("searchbox")).toHaveCount(0);
  });
});
