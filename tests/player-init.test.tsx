import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const initEngine = vi.fn(() => new Promise<void>((_, rej) => setTimeout(() => rej(new Error("no wasm")), 5)));
vi.mock("../src/engine/engine", () => ({ initEngine: () => initEngine(), createEngine: () => ({}) }));
import { LottieStage } from "../src/player/LottieStage";

afterEach(cleanup);

it("shares one engine init across three stages and keeps posters when it rejects", async () => {
  const cbs: ((e: { isIntersecting: boolean }[]) => void)[] = [];
  vi.stubGlobal("IntersectionObserver", class { constructor(cb: never) { cbs.push(cb); } observe() {} disconnect() {} });
  vi.stubGlobal("fetch", async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }));
  const { container } = render(<>{[1, 2, 3].map((i) => <LottieStage key={i} src={`/${i}.lottie`} poster={`/${i}.png`} alt={`Demo ${i}`} />)}</>);
  cbs.forEach((cb) => cb([{ isIntersecting: true }]));
  // The player module is imported dynamically; under a loaded suite that can take well over 50 ms.
  await vi.waitFor(() => expect(initEngine).toHaveBeenCalled(), { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 50));
  expect(initEngine).toHaveBeenCalledTimes(1);
  expect(container.querySelectorAll("img")).toHaveLength(3);
  expect(container.querySelectorAll("[role=button]")).toHaveLength(3);
});
