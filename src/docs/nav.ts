export const DOCS: { slug: string; title: string; description: string; group: string; file: string }[] = [
  { slug: "getting-started", title: "Getting started", group: "Start", file: "getting-started",
    description: "Install Lumetrope, open your first Lottie or dotLottie animation, and learn the basics of the timeline, layers and export in a few minutes." },
  { slug: "web-app", title: "Use the web app and self-host it", group: "Start", file: "web-app",
    description: "Run Lumetrope in your browser with nothing to install, or self-host the static build behind https with the right wasm MIME type on nginx or Caddy." },
  { slug: "install-macos", title: "Install on macOS", group: "Install", file: "install-macos",
    description: "Download the Lumetrope dmg for Apple Silicon or Intel, drag it to Applications, and get past the Gatekeeper warning on an unsigned build." },
  { slug: "install-windows", title: "Install on Windows", group: "Install", file: "install-windows",
    description: "Install Lumetrope on Windows 10 or 11 with the NSIS setup or MSI, including ARM64, and what to do when SmartScreen warns about the publisher." },
  { slug: "install-linux", title: "Install on Linux", group: "Install", file: "install-linux",
    description: "Install Lumetrope on Linux from a deb, rpm or AppImage, check the WebKitGTK 4.1 requirement, and fix a blank window on NVIDIA graphics." },
  { slug: "mcp", title: "Connect AI agents with MCP", group: "AI agents", file: "mcp",
    description: "Connect Claude Code, Codex, Cursor or Claude Desktop to Lumetrope over MCP: exact setup commands per OS, server paths, enabling Local MCP and the tools." },
];
