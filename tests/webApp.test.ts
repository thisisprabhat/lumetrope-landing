// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { SITE } from "../src/config/site";
import { installWebAppFallback } from "../src/lib/webApp";

let off = () => {};
afterEach(() => { off(); document.body.innerHTML = ""; });

const links = () => {
  document.body.innerHTML = `<a id="a" href="${SITE.WEB_APP_URL}">app</a><a id="b" href="${SITE.WEB_APP_URL}#new">new</a><a id="c" href="/docs/">docs</a>`;
  return (id: string) => document.getElementById(id)!.getAttribute("href");
};
const hover = (id: string) => document.getElementById(id)!.dispatchEvent(new Event("pointerover", { bubbles: true }));
const settle = () => new Promise((r) => setTimeout(r, 0));

describe("web app fallback", () => {
  it("does nothing until a web-app link is hovered, then probes once", async () => {
    const href = links();
    const calls: string[] = [];
    off = installWebAppFallback(document, async (u) => { calls.push(u); });
    hover("c");
    await settle();
    expect(calls).toEqual([]);
    hover("a");
    hover("b");
    await settle();
    expect(calls).toEqual([SITE.WEB_APP_URL]);
    expect(href("a")).toBe(SITE.WEB_APP_URL);
  });

  it("rewrites every web-app link to the fallback, keeping the path, when the host is unreachable", async () => {
    const href = links();
    off = installWebAppFallback(document, () => Promise.reject(new TypeError("Failed to fetch")));
    hover("a");
    await settle();
    expect(href("a")).toBe(SITE.WEB_APP_FALLBACK_URL);
    expect(href("b")).toBe(`${SITE.WEB_APP_FALLBACK_URL}#new`);
    expect(href("c")).toBe("/docs/");
  });
});
