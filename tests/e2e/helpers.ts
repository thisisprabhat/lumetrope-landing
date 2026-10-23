import { expect, type Locator, type Page } from "@playwright/test";

export const lumi = (page: Page) => page.getByRole("button", { name: /Lumi, the Lumetrope mascot/ });
export const zoetrope = (page: Page) => page.getByRole("button", { name: /zoetrope/i });

/**
 * Record every `data-state` the stage takes from now on, so short-lived states (Jump, Cheer play
 * once and hand back to Idle) are still observable. Read it back with `states()`.
 */
export async function recordStates(stage: Locator) {
  await stage.evaluate((el) => {
    const seen: string[] = [el.getAttribute("data-state") ?? ""];
    (el as unknown as { __states: string[] }).__states = seen;
    new MutationObserver(() => seen.push(el.getAttribute("data-state") ?? "")).observe(el, { attributes: true, attributeFilter: ["data-state"] });
  });
  return () => stage.evaluate((el) => (el as unknown as { __states: string[] }).__states);
}

/** Wait until the stage's player has started (its machine reports a state). */
export async function waitForPlayer(stage: Locator, timeout = 15_000) {
  await expect(stage).toHaveAttribute("data-state", /.+/, { timeout });
}
