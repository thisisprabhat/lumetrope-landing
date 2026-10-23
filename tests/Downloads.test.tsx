import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { Downloads } from "../src/sections/Downloads";
import { RELEASE } from "../src/config/site";

describe("Downloads SSR", () => {
  const html = renderToString(<Downloads />);
  it("renders all OS groups and the release's real files without JS", () => {
    expect(html).toContain('id="download"');
    for (const a of RELEASE.assets) expect(html).toContain(`/releases/download/${RELEASE.tag}/${a.name}`);
    // an OS with no build in the release says so instead of linking a missing file
    if (!RELEASE.assets.some((a) => /\.(exe|msi)$/.test(a.name))) {
      expect(html).not.toContain("-setup.exe");
      expect(html).toContain("No Windows build in this release yet.");
    }
    for (const s of ["/docs/install-macos/", "/docs/install-windows/", "/docs/install-linux/", "Open the web app", "All releases", "macOS 11+", "WebView2", "WebKitGTK 4.1"]) expect(html).toContain(s);
  });
});
