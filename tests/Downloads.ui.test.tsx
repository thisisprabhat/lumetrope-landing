import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";

let current: { os: string; arch: string } = { os: "other", arch: "unknown" };
vi.mock("../src/lib/platform", () => ({
  detectPlatform: () => current,
  detectPlatformAsync: async () => current,
}));
import { Downloads } from "../src/sections/Downloads";

afterEach(cleanup);

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
});
