import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Ref } from "react";

type Handle = { setInput: ReturnType<typeof vi.fn>; fire: ReturnType<typeof vi.fn> };
const stages = vi.hoisted(() => [] as { src: string; machine?: string; h: Handle; onState: (s: string) => void }[]);

// Players are mocked: a stand-in that records its src/state machine and exposes a spy handle.
vi.mock("../src/player/LottieStage", async () => {
  const React = await import("react");
  function LottieStage(props: {
    src: string; stateMachine?: string; poster: string; alt: string; className?: string;
    inputs?: Record<string, unknown>; decorative?: boolean; ref?: Ref<Handle>; onState?: (s: string) => void;
  }) {
    const [h] = React.useState<Handle>(() => ({ setInput: vi.fn(), fire: vi.fn() }));
    const onState = React.useRef(props.onState);
    onState.current = props.onState;
    React.useImperativeHandle(props.ref, () => h);
    React.useEffect(() => {
      const rec = { src: props.src, machine: props.stateMachine, h, onState: (st: string) => onState.current?.(st) };
      stages.push(rec);
      return () => { stages.splice(stages.indexOf(rec), 1); };
    }, [props.src, props.stateMachine, h]);
    return (
      <div
        data-testid="lottie-stage"
        data-src={props.src}
        data-machine={props.stateMachine}
        data-poster={props.poster}
        data-inputs={JSON.stringify(props.inputs ?? {})}
        className={props.className}
      />
    );
  }
  return { LottieStage };
});

import Landing from "../src/pages/Landing";
import { FAQ } from "../src/content/faq";
import { SITE } from "../src/config/site";

const stageOf = (src: string) => stages.find((s) => s.src === src)!;

beforeEach(() => { stages.length = 0; });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("landing page", () => {
  test("renders the hero h1 once", () => {
    render(<Landing />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Make Lottie animations that respond.");
  });

  test("header has the logo player and the four nav links", () => {
    const { container } = render(<Landing />);
    const header = container.querySelector("header")!;
    expect(header.querySelector('[data-src="/animations/logo.lottie"]')).toHaveAttribute("data-machine", "Logo");
    const nav = within(header).getByRole("navigation");
    expect(within(nav).getByRole("link", { name: "Features" })).toHaveAttribute("href", "/#features");
    expect(within(nav).getByRole("link", { name: "Download" })).toHaveAttribute("href", "/#download");
    expect(within(nav).getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs/getting-started/");
    const app = within(nav).getByRole("link", { name: "Open web app" });
    expect(app).toHaveAttribute("href", SITE.WEB_APP_URL);
    expect(app.querySelector('[data-src="/animations/cta-open.lottie"]')).toHaveAttribute("data-machine", "Cta");
  });

  test("both hero CTAs link correctly and carry a CTA player", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15");
    vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel");
    const { container } = render(<Landing />);
    const hero = container.querySelector("section#top")!;
    const web = within(hero as HTMLElement).getByRole("link", { name: "Open the web app" });
    expect(web).toHaveAttribute("href", SITE.WEB_APP_URL);
    const dl = within(hero as HTMLElement).getByRole("link", { name: /^Download/ });
    expect(dl).toHaveAttribute("href", "#download");
    expect(dl).toHaveTextContent("Download for macOS");
    // download → arrow-into-tray chip; web app → arrow-out-of-window chip
    expect(dl.querySelector('[data-src="/animations/cta.lottie"]')).not.toBeNull();
    expect(web.querySelector('[data-src="/animations/cta-open.lottie"]')).not.toBeNull();
    vi.restoreAllMocks();
  });

  test("download CTA never names an OS it cannot serve", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)");
    const { container } = render(<Landing />);
    const dl = within(container.querySelector("section#top") as HTMLElement).getByRole("link", { name: /^Download/ });
    expect(dl).toHaveTextContent("Download for desktop");
    expect(dl).toHaveAttribute("href", "#download");
    vi.restoreAllMocks();
  });

  test("has 8 feature headings, one about MCP, and the MCP card links its docs", () => {
    const { container } = render(<Landing />);
    const features = container.querySelector("section#features") as HTMLElement;
    const hs = within(features).getAllByRole("heading", { level: 3 });
    expect(hs).toHaveLength(8);
    const mcp = hs.filter((h) => h.textContent!.includes("MCP"));
    expect(mcp).toHaveLength(1);
    expect(mcp[0].closest("a")).toHaveAttribute("href", "/docs/mcp/");
    for (const f of ["timeline", "state-machines", "mcp", "wasm-engine", "version-history", "export", "desktop", "themes"]) {
      expect(features.querySelector(`[data-src="/animations/icon-${f}.lottie"]`)).toHaveAttribute("data-machine", "Icon");
    }
  });

  test("feature card hover drives its icon's hover input", () => {
    const { container } = render(<Landing />);
    const icon = container.querySelector('[data-src="/animations/icon-export.lottie"]')!;
    const card = icon.closest("li")!;
    fireEvent.pointerEnter(card);
    expect(JSON.parse(icon.getAttribute("data-inputs")!)).toEqual({ hover: true });
    fireEvent.pointerLeave(card);
    expect(JSON.parse(icon.getAttribute("data-inputs")!)).toEqual({ hover: false });
  });

  test("touch tap drives a feature icon's hover even though pointerleave follows pointerup", () => {
    vi.useFakeTimers();
    const { container } = render(<Landing />);
    const icon = container.querySelector('[data-src="/animations/icon-themes.lottie"]')!;
    const card = icon.closest("li")!;
    const hover = () => JSON.parse(icon.getAttribute("data-inputs")!).hover;
    // the browser's tap sequence for a touch pointer
    fireEvent.pointerEnter(card, { pointerType: "touch" });
    fireEvent.pointerDown(card, { pointerType: "touch" });
    fireEvent.pointerUp(card, { pointerType: "touch" });
    fireEvent.pointerLeave(card, { pointerType: "touch" });
    expect(hover()).toBe(true);
    act(() => { vi.advanceTimersByTime(600); });
    expect(hover()).toBe(true);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(hover()).toBe(false);
  });

  test("feature cards are keyboard-focusable and focus drives hover", () => {
    const { container } = render(<Landing />);
    const cards = container.querySelectorAll("section#features li");
    expect(cards).toHaveLength(8);
    for (const c of cards) {
      // the MCP card is focusable through its link, the other seven themselves
      const focusable = c.getAttribute("tabindex") === "0" || c.querySelector("a[href]") !== null;
      expect(focusable).toBe(true);
    }
    const icon = container.querySelector('[data-src="/animations/icon-wasm-engine.lottie"]')!;
    const card = icon.closest("li") as HTMLElement;
    expect(card).toHaveAttribute("tabindex", "0");
    act(() => card.focus());
    expect(JSON.parse(icon.getAttribute("data-inputs")!)).toEqual({ hover: true });
    act(() => card.blur());
    expect(JSON.parse(icon.getAttribute("data-inputs")!)).toEqual({ hover: false });
  });

  test("CTA: a touch tap pulses hover, focus drives it", () => {
    vi.useFakeTimers();
    const { container } = render(<Landing />);
    const hero = container.querySelector("section#top") as HTMLElement;
    const web = within(hero).getByRole("link", { name: "Open the web app" });
    const chip = web.querySelector('[data-src="/animations/cta-open.lottie"]')!;
    const hover = () => JSON.parse(chip.getAttribute("data-inputs")!).hover;
    fireEvent.pointerEnter(web, { pointerType: "touch" });
    fireEvent.pointerDown(web, { pointerType: "touch" });
    fireEvent.pointerUp(web, { pointerType: "touch" });
    fireEvent.pointerLeave(web, { pointerType: "touch" });
    expect(hover()).toBe(true);
    act(() => { vi.advanceTimersByTime(1600); });
    expect(hover()).toBe(false);
    act(() => web.focus());
    expect(hover()).toBe(true);
    act(() => web.blur());
    expect(hover()).toBe(false);
  });

  test("every <section> contains a LottieStage", () => {
    const { container } = render(<Landing />);
    const sections = container.querySelectorAll("section");
    expect(sections.length).toBeGreaterThanOrEqual(7);
    for (const s of sections) {
      expect(s.querySelector('[data-testid="lottie-stage"]'), `section #${s.id}`).not.toBeNull();
    }
  });

  test("FAQ has at least 8 Q&As rendered as <details> from the shared content", () => {
    const { container } = render(<Landing />);
    expect(FAQ.length).toBeGreaterThanOrEqual(8);
    const details = container.querySelectorAll("section#faq details");
    expect(details).toHaveLength(FAQ.length);
    FAQ.forEach((f, i) => {
      // exact: no decorative text in the summary (FAQPage JSON-LD and the prerender test compare it)
      expect(details[i].querySelector("summary")!.textContent).toBe(f.q);
      expect(details[i]).toHaveTextContent(f.a);
    });
  });

  test("recording is a lazy video with controls and a poster", () => {
    const { container } = render(<Landing />);
    const v = container.querySelector("section#tour video")!;
    expect(v).toHaveAttribute("preload", "none");
    expect(v).toHaveAttribute("controls");
    expect(v.getAttribute("poster")).toMatch(/^\/media\/shots\/.+\.webp$/);
    expect(v.querySelector('source[type="video/webm"]')).toHaveAttribute("src", "/media/tour.webm");
  });

  test("carousel: roledescription, captions, arrow keys and swipe", () => {
    const { container } = render(<Landing />);
    const car = container.querySelector('[aria-roledescription="carousel"]') as HTMLElement;
    expect(car).not.toBeNull();
    const slides = car.querySelectorAll('[aria-roledescription="slide"]');
    expect(slides.length).toBe(8);
    for (const s of slides) expect(s.querySelector("figcaption")!.textContent!.length).toBeGreaterThan(10);
    const current = () => [...slides].findIndex((s) => s.getAttribute("aria-hidden") !== "true");
    expect(current()).toBe(0);
    const viewport = car.querySelector("[data-carousel-viewport]") as HTMLElement;
    expect(viewport).toHaveAttribute("role", "region");
    expect(viewport).toHaveAccessibleName();
    // only a small status node is live, not the whole track
    const live = car.querySelectorAll("[aria-live]");
    expect(live).toHaveLength(1);
    expect(live[0].querySelector("figure, img")).toBeNull();
    fireEvent.keyDown(viewport, { key: "ArrowRight" });
    expect(current()).toBe(1);
    expect(live[0].textContent).toBe(`Slide 2 of 8: ${slides[1].querySelector("figcaption span:last-child")!.textContent}`);
    fireEvent.keyDown(viewport, { key: "ArrowLeft" });
    fireEvent.keyDown(viewport, { key: "ArrowLeft" });
    expect(current()).toBe(7); // wraps
    fireEvent.pointerDown(viewport, { clientX: 300, pointerId: 1 });
    fireEvent.pointerUp(viewport, { clientX: 100, pointerId: 1 });
    expect(current()).toBe(0); // swipe left → next
    fireEvent.pointerDown(viewport, { clientX: 100, pointerId: 1 });
    fireEvent.pointerUp(viewport, { clientX: 300, pointerId: 1 });
    expect(current()).toBe(7);
    fireEvent.click(within(car).getByRole("button", { name: "Next screenshot" }));
    expect(current()).toBe(0);
  });

  test("benefits: four benefits and scroll progress drives the zoetrope", () => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { cb(0); return 1; });
    const { container } = render(<Landing />);
    const sec = container.querySelector("section#benefits") as HTMLElement;
    expect(within(sec).getAllByRole("heading", { level: 3 })).toHaveLength(4);
    const z = stageOf("/animations/zoetrope.lottie");
    expect(z.machine).toBe("Zoetrope");
    sec.getBoundingClientRect = () => ({ top: -500, height: 2000, bottom: 1500, left: 0, right: 0, width: 0, x: 0, y: -500, toJSON() {} });
    vi.stubGlobal("innerHeight", 1000);
    act(() => { window.dispatchEvent(new Event("scroll")); });
    // progress is passed as an input, so a player that starts after the last scroll still gets it
    const zEl = container.querySelector('[data-src="/animations/zoetrope.lottie"]')!;
    expect(JSON.parse(zEl.getAttribute("data-inputs")!)).toEqual({ progress: 0.5 }); // (innerHeight/2 - top) / height = (500 + 500) / 2000
    // sub-percent scrolling keeps the same value (no re-render every frame)
    const before = zEl.getAttribute("data-inputs");
    sec.getBoundingClientRect = () => ({ top: -508, height: 2000, bottom: 1492, left: 0, right: 0, width: 0, x: 0, y: -508, toJSON() {} });
    act(() => { window.dispatchEvent(new Event("scroll")); });
    expect(zEl.getAttribute("data-inputs")).toBe(before); // 0.504 rounds to 0.5
    // 0.5 is the third quarter, so the third benefit is highlighted (same value, same bands)
    const hs = within(sec).getAllByRole("heading", { level: 3 });
    expect(hs[2].className).toContain("text-text-0");
    expect(hs[0].className).not.toContain("text-text-0");
    // after a click-spin hands back to B1, the current progress is re-applied
    z.h.setInput.mockClear();
    act(() => z.onState("B1"));
    expect(z.h.setInput).toHaveBeenCalledWith("progress", 0.5);
    vi.unstubAllGlobals();
  });

  test("hero Lumi: pointermove → look, 12 s idle → sleepy", () => {
    vi.useFakeTimers();
    render(<Landing />);
    const lumi = stageOf("/animations/lumi.lottie");
    expect(lumi.machine).toBe("Lumi");
    vi.stubGlobal("innerWidth", 1000);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { cb(0); return 1; });
    act(() => { window.dispatchEvent(new MouseEvent("pointermove", { clientX: 0 })); });
    expect(lumi.h.setInput).toHaveBeenCalledWith("look", -1);
    act(() => { window.dispatchEvent(new MouseEvent("pointermove", { clientX: 750 })); });
    expect(lumi.h.setInput).toHaveBeenLastCalledWith("look", 0.5);
    act(() => { vi.advanceTimersByTime(11_900); });
    expect(lumi.h.setInput).not.toHaveBeenCalledWith("sleepy", true);
    act(() => { vi.advanceTimersByTime(200); });
    expect(lumi.h.setInput).toHaveBeenCalledWith("sleepy", true);
    act(() => { window.dispatchEvent(new MouseEvent("pointermove", { clientX: 500 })); });
    expect(lumi.h.setInput).toHaveBeenCalledWith("sleepy", false);
    vi.unstubAllGlobals();
  });

  test("download CTA click emits download → Lumi cheer, and presses the CTA", () => {
    const { container } = render(<Landing />);
    const lumi = stageOf("/animations/lumi.lottie");
    const hero = container.querySelector("section#top") as HTMLElement;
    const dl = within(hero).getByRole("link", { name: /^Download/ });
    fireEvent.click(dl);
    expect(lumi.h.fire).toHaveBeenCalledWith("cheer");
    const cta = stages.filter((s) => s.src === "/animations/cta.lottie");
    expect(cta.some((s) => s.h.fire.mock.calls.some((c) => c[0] === "press"))).toBe(true);
  });

  test("downloads section is present with its player", () => {
    const { container } = render(<Landing />);
    const sec = container.querySelector("section#download")!;
    expect(sec.querySelector('[data-testid="lottie-stage"]')).not.toBeNull();
    expect(within(sec as HTMLElement).getByText("All releases")).toBeTruthy();
  });

  test("footer links docs, GitHub, the MIT licence and the font OFL note", () => {
    const { container } = render(<Landing />);
    const f = container.querySelector("footer") as HTMLElement;
    expect(within(f).getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs/getting-started/");
    expect(within(f).getByRole("link", { name: "GitHub" })).toHaveAttribute("href", SITE.REPO_URL);
    expect(within(f).getByRole("link", { name: /MIT/ })).toHaveAttribute("href", `${SITE.REPO_URL}/blob/main/LICENSE`);
    expect(f).toHaveTextContent("SIL Open Font License");
  });
});
