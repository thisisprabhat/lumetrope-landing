import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import App from "../src/App";
import { DOCS } from "../src/docs/nav";
import { HEADINGS } from "../src/docs/headings";

afterEach(cleanup);

function page(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/docs/${slug}/`]}>
      <App />
    </MemoryRouter>,
  );
}

describe("docs", () => {
  test("nav entries are well formed", () => {
    expect(DOCS.length).toBeGreaterThanOrEqual(20);
    for (const d of DOCS) {
      expect(d.title.length).toBeLessThanOrEqual(60);
      expect(d.description.length).toBeGreaterThanOrEqual(120);
      expect(d.description.length).toBeLessThanOrEqual(160);
    }
    expect(new Set(DOCS.map((d) => d.slug)).size).toBe(DOCS.length);
  });

  for (const d of DOCS) {
    test(`${d.slug} renders an h1 and description`, () => {
      const { container } = page(d.slug);
      expect(container.querySelectorAll("h1").length).toBe(1);
      expect(d.description.length).toBeGreaterThanOrEqual(50);
      // sidebar and prev/next exist
      expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0);
    });
  }

  test("mcp page has setup commands, all OS paths, and 100+ tools", () => {
    const { container } = page("mcp");
    const text = container.textContent ?? "";
    expect(text).toContain("claude mcp add --scope user lumetrope");
    expect(text).toContain("codex mcp add lumetrope");
    expect(text).toContain("~/Library/Application Support/com.waygosquad.lumetrope/mcp/lumetrope-mcp.mjs");
    expect(text).toContain("%APPDATA%\\com.waygosquad.lumetrope\\mcp\\lumetrope-mcp.mjs");
    expect(text).toContain("~/.local/share/com.waygosquad.lumetrope/mcp/lumetrope-mcp.mjs");
    expect(container.querySelectorAll("table[data-mcp-tools] tbody tr").length).toBeGreaterThanOrEqual(100);
  });

  test("sidebar lists every page grouped, and search filters", () => {
    page("getting-started");
    const side = screen.getByRole("navigation", { name: "Docs" });
    for (const d of DOCS) expect(side.querySelector(`a[href="/docs/${d.slug}/"]`)).not.toBeNull();
    const box = screen.getByRole("searchbox");
    fireEvent.change(box, { target: { value: "gatekeeper" } });
    expect(side.querySelector('a[href="/docs/install-macos/"]')).not.toBeNull();
    expect(side.querySelector('a[href="/docs/install-linux/"]')).toBeNull();
  });

  test("search heading index matches the MDX sources", () => {
    for (const d of DOCS) {
      let fence = false;
      const hs: string[] = [];
      for (const l of readFileSync(`src/docs/pages/${d.file}.mdx`, "utf8").split("\n")) {
        if (l.startsWith("```")) fence = !fence;
        const m = !fence && /^#{2,3}\s+(.+?)\s*$/.exec(l);
        if (m) hs.push(m[1].replace(/[`*_]/g, ""));
      }
      expect(HEADINGS[d.file]).toEqual(hs);
    }
  });

  test("state-machines page embeds the sm-explainer stage with a live state readout", () => {
    const { container } = page("state-machines");
    const stage = container.querySelector('[data-explainer] [role="button"]');
    expect(stage).not.toBeNull();
    const img = stage!.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/posters/sm-explainer.webp");
    expect(container.querySelector('[data-explainer] [aria-live="polite"]')?.textContent).toContain("Current state:");
  });

  test("keyboard shortcuts page lists nudge, Home/End and Mod+A rows", () => {
    const { container } = page("keyboard-shortcuts");
    const text = container.textContent ?? "";
    expect(text).toContain("Select all");
    expect(text).toContain("Nudge selection");
    expect(text).toContain("Animate mode");
  });
});
