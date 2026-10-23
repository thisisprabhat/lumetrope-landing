// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { SITE } from "../src/config/site";
import { installWebAppFallback, type Probe } from "../src/lib/webApp";

let off = () => {};
afterEach(() => { off(); document.body.innerHTML = ""; });

const links = () => {
  document.body.innerHTML = `<a id="a" href="${SITE.WEB_APP_URL}">app</a><a id="b" href="${SITE.WEB_APP_URL}#new">new</a><a id="c" href="/docs/">docs</a>`;
  return (id: string) => document.getElementById(id)!.getAttribute("href");
};
const el = (id: string) => document.getElementById(id)!;
const hover = (id: string) => el(id).dispatchEvent(new Event("pointerover", { bubbles: true }));
const click = (id: string, init: MouseEventInit = {}) => {
  const e = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
  el(id).dispatchEvent(e);
  return e;
};
const settle = () => new Promise((r) => setTimeout(r, 0));
const deferred = () => {
  let resolve!: () => void, reject!: (e: unknown) => void;
  const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};

describe("web app fallback", () => {
  it("does nothing until a web-app link is hovered, then probes once", async () => {
    const href = links();
    const calls: string[] = [];
    off = installWebAppFallback(document, { probe: async (u) => { calls.push(u); } });
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
    off = installWebAppFallback(document, { probe: () => Promise.reject(new TypeError("Failed to fetch")) });
    hover("a");
    await settle();
    expect(href("a")).toBe(SITE.WEB_APP_FALLBACK_URL);
    expect(href("b")).toBe(`${SITE.WEB_APP_FALLBACK_URL}#new`);
    expect(href("c")).toBe("/docs/");
  });

  it("holds a click that lands before the probe settles, then goes to the host that is up", async () => {
    links();
    const p = deferred();
    const went: string[] = [];
    off = installWebAppFallback(document, { probe: () => p.promise, navigate: (u) => went.push(u) });
    // touch / keyboard: no hover first, the click itself starts the probe
    const e = click("b");
    expect(e.defaultPrevented).toBe(true);
    await settle();
    expect(went).toEqual([]);
    p.reject(new TypeError("Failed to fetch"));
    await settle();
    expect(went).toEqual([`${SITE.WEB_APP_FALLBACK_URL}#new`]);
    // settled: later clicks are not held, the href is already the fallback
    expect(click("a").defaultPrevented).toBe(false);
  });

  it("navigates to the primary when a held click's probe succeeds", async () => {
    links();
    const p = deferred();
    const went: string[] = [];
    off = installWebAppFallback(document, { probe: () => p.promise, navigate: (u) => went.push(u) });
    hover("a");
    expect(click("a").defaultPrevented).toBe(true);
    p.resolve();
    await settle();
    expect(went).toEqual([SITE.WEB_APP_URL]);
  });

  it("leaves modified and middle clicks alone", () => {
    links();
    off = installWebAppFallback(document, { probe: () => new Promise(() => {}), navigate: () => { throw new Error("no"); } });
    expect(click("a", { metaKey: true }).defaultPrevented).toBe(false);
    expect(click("a", { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(click("a", { button: 1 }).defaultPrevented).toBe(false);
  });

  it("bounds the probe: a black-holed host times out and counts as down", async () => {
    const href = links();
    const ctl = new AbortController();
    const seen: { ms?: number } = {};
    // A probe that never answers on its own, only when its signal aborts (as fetch does).
    const probe: Probe = (_u, signal) => new Promise((_, rej) => signal.addEventListener("abort", () => rej(signal.reason)));
    const went: string[] = [];
    off = installWebAppFallback(document, { probe, timeoutMs: 2500, timeout: (ms) => { seen.ms = ms; return ctl.signal; }, navigate: (u) => went.push(u) });
    expect(click("a").defaultPrevented).toBe(true);
    expect(seen.ms).toBe(2500);
    await settle();
    expect(went).toEqual([]);
    ctl.abort(new DOMException("timed out", "TimeoutError")); // what AbortSignal.timeout(2500) does
    await settle();
    expect(went).toEqual([SITE.WEB_APP_FALLBACK_URL]);
    expect(href("b")).toBe(`${SITE.WEB_APP_FALLBACK_URL}#new`);
  });

  it("uses a real AbortSignal.timeout by default", async () => {
    links();
    let signal: AbortSignal | undefined;
    off = installWebAppFallback(document, { probe: (_u, s) => { signal = s; return Promise.resolve(); }, timeoutMs: 10 });
    hover("a");
    await new Promise((r) => setTimeout(r, 40));
    expect(signal?.aborted).toBe(true);
  });
});
