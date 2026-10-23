import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initEngine = vi.fn<() => Promise<void>>();
vi.mock("../src/engine/engine", () => ({ initEngine: () => initEngine(), createEngine: () => ({}) }));

const fake = { setInput: vi.fn(), fire: vi.fn(), pointer: vi.fn(), play: vi.fn(), pause: vi.fn(), resize: vi.fn(), destroy: vi.fn(), state: "Idle" };
const create = vi.fn();
vi.mock("../src/player/LumetropePlayer", () => ({ LumetropePlayer: { create: (...a: unknown[]) => create(...a) } }));

import { LottieStage } from "../src/player/LottieStage";
import { LumetropePlayer as RealLike } from "../src/player/LumetropePlayer";
void RealLike;

let ioCb: (e: { isIntersecting: boolean }[]) => void = () => {};
class IO {
  constructor(cb: typeof ioCb) {
    ioCb = cb;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}
class PE extends MouseEvent {
  pointerType: string;
  constructor(t: string, i: PointerEventInit = {}) {
    super(t, i);
    this.pointerType = i.pointerType ?? "mouse";
  }
}
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", IO);
  vi.stubGlobal("PointerEvent", PE);
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  Object.values(fake).forEach((f) => typeof f === "function" && "mockClear" in f && f.mockClear());
  create.mockReset().mockResolvedValue(fake);
  initEngine.mockReset().mockResolvedValue();
});
afterEach(cleanup);

const stage = () => <LottieStage src="/a.lottie" stateMachine="m" poster="/p.png" alt="Demo" />;

describe("LottieStage", () => {
  it("renders the poster in SSR without touching window", () => {
    const html = renderToString(stage());
    expect(html).toContain("<img");
    expect(html).toContain('alt="Demo"');
    expect(html).toContain("data-state");
  });

  it("keeps the poster and does not throw when the player fails to start", async () => {
    create.mockRejectedValue(new Error("wasm blocked"));
    render(stage());
    await flush();
    act(() => ioCb([{ isIntersecting: true }]));
    await flush();
    expect(screen.getByAltText("Demo")).toBeInTheDocument();
  });

  it("pauses when scrolled offscreen", async () => {
    render(stage());
    act(() => ioCb([{ isIntersecting: true }]));
    await flush();
    expect(create).toHaveBeenCalledTimes(1);
    act(() => ioCb([{ isIntersecting: false }]));
    expect(fake.pause).toHaveBeenCalled();
    act(() => ioCb([{ isIntersecting: true }]));
    expect(fake.play).toHaveBeenCalled();
  });

  it("a touch tap sets hover true for 1.2s", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { container } = render(stage());
    act(() => ioCb([{ isIntersecting: true }]));
    await flush();
    fireEvent(container.firstElementChild!, new PE("pointerdown", { pointerType: "touch", bubbles: true }));
    expect(fake.setInput).toHaveBeenCalledWith("hover", true);
    act(() => void vi.advanceTimersByTime(1250));
    expect(fake.setInput).toHaveBeenLastCalledWith("hover", false);
    vi.useRealTimers();
  });

  it("focus and blur set hover; Enter clicks; data-state follows onState", async () => {
    const { container } = render(stage());
    act(() => ioCb([{ isIntersecting: true }]));
    await flush();
    const root = container.firstElementChild as HTMLElement;
    expect(root.tabIndex).toBe(0);
    fireEvent.focus(root);
    expect(fake.setInput).toHaveBeenCalledWith("hover", true);
    fireEvent.keyDown(root, { key: "Enter" });
    expect(fake.pointer).toHaveBeenCalledWith("click", expect.any(Number), expect.any(Number));
    fireEvent.blur(root);
    expect(fake.setInput).toHaveBeenLastCalledWith("hover", false);
    act(() => create.mock.calls[0][1].onState("Perk"));
    expect(root.getAttribute("data-state")).toBe("Perk");
  });

  it("under reduced motion nothing loads until a click", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
    const { container } = render(stage());
    act(() => ioCb([{ isIntersecting: true }]));
    await flush();
    expect(create).not.toHaveBeenCalled();
    fireEvent.click(container.firstElementChild!);
    await flush();
    expect(create).toHaveBeenCalledTimes(1);
  });
});
