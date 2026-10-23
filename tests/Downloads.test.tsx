import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { Downloads } from "../src/sections/Downloads";

describe("Downloads SSR", () => {
  const html = renderToString(<Downloads />);
  it("renders all OS groups and links without JS", () => {
    expect(html).toContain('id="download"');
    for (const s of ["_aarch64.dmg", "_x64-setup.exe", "_amd64.deb", ".rpm", ".AppImage", ".msi"]) expect(html).toContain(s);
    for (const s of ["/docs/install-macos/", "/docs/install-windows/", "/docs/install-linux/", "Open the web app", "All releases", "macOS 11+", "WebView2", "WebKitGTK 4.1"]) expect(html).toContain(s);
  });
});
