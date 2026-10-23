import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";

let current: { os: string; arch: string } = { os: "other", arch: "unknown" };
let refined: { os: string; arch: string } | null = null; // what client hints say, if different
vi.mock("../src/lib/platform", () => ({
  detectPlatform: () => current,
  detectPlatformAsync: async () => refined ?? current,
}));
vi.mock("../src/player/LottieStage", () => ({ LottieStage: () => null }));
import { Downloads } from "../src/sections/Downloads";
import { Hero } from "../src/sections/Hero";
import { RELEASE } from "../src/config/site";

const hasIntel = RELEASE.assets.some((a) => /_x64\.dmg$/.test(a.name));

afterEach(() => { cleanup(); refined = null; });

describe("Downloads client", () => {
  it("other platform: no primary button, fallbacks present", async () => {
    current = { os: "other", arch: "unknown" };
    render(<Downloads />);
    await new Promise((r) => setTimeout(r, 10));
    expect(screen.queryByText(/^Download for/)).toBeNull();
    expect(screen.getByText("Open the web app")).toBeTruthy();
    expect(screen.getByText("All releases")).toBeTruthy();
  });
  it("mac arm64: primary links aarch64 dmg", async () => {
    current = { os: "mac", arch: "arm64" };
    render(<Downloads />);
    const a = await waitFor(() => screen.getByText(/^Download for/).closest("a")!);
    expect(a.getAttribute("href")).toMatch(/_aarch64\.dmg$/);
  });
  it("unknown-arch Mac: Apple Silicon label shown at every width, plus the Intel note", async () => {
    current = { os: "mac", arch: "unknown" };
    render(<Downloads />);
    const label = await waitFor(() => screen.getByText(/^Download for macOS/));
    expect(label.textContent).toBe("Download for macOS (Apple Silicon)");
    for (let n: HTMLElement | null = label; n && n.tagName !== "A"; n = n.parentElement) expect(n.className).not.toMatch(/(^|\s)hidden(\s|$)/);
    if (!hasIntel) expect(screen.getByTestId("intel-note")).toHaveTextContent("no Intel Mac build yet");
  });
  it("Intel Mac (client hints): no Apple Silicon primary, the note points to the web app", async () => {
    if (hasIntel) return;
    current = { os: "mac", arch: "x64" };
    render(<Downloads />);
    const note = await waitFor(() => screen.getByTestId("intel-note"));
    expect(screen.queryByText(/^Download for/)).toBeNull();
    expect(note.querySelector("a")!.textContent).toBe("use the web app");
  });
  it("Apple Silicon Mac: no Intel note", async () => {
    current = { os: "mac", arch: "arm64" };
    render(<Downloads />);
    await waitFor(() => screen.getByText(/^Download for macOS/));
    expect(screen.queryByTestId("intel-note")).toBeNull();
  });
  it("hero and downloads agree once client hints refine the arch (Intel Mac in Chromium)", async () => {
    if (hasIntel) return;
    current = { os: "mac", arch: "unknown" };
    refined = { os: "mac", arch: "x64" };
    const { container } = render(<><Hero /><Downloads /></>);
    const hero = container.querySelector("section#top")!;
    await waitFor(() => expect(screen.getByTestId("intel-note")).toBeTruthy());
    expect(hero.querySelector('a[href="#download"]')!.textContent).toBe("Download for desktop");
    expect(screen.getByTestId("primary-download").textContent).not.toMatch(/Download for macOS/);
  });
  it("macOS card lists only the architectures the release has", () => {
    current = { os: "other", arch: "unknown" };
    const { container } = render(<Downloads />);
    const mac = [...container.querySelectorAll("h3")].find((h) => h.textContent!.includes("macOS"))!.parentElement!;
    expect(mac.textContent).toContain("macOS 11+ · Apple Silicon");
    if (!hasIntel) expect(mac.textContent).not.toContain("Intel");
  });
});
