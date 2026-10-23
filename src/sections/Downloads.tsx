import { useEffect, useState } from "react";
import { SITE, downloads, primaryDownload, type DownloadOS } from "../config/site";
import { detectPlatform, detectPlatformAsync, type Platform } from "../lib/platform";

const GROUPS: { os: DownloadOS; name: string; glyph: string; req: string; docs: string }[] = [
  { os: "mac", name: "macOS", glyph: "⌘", req: "macOS 11+ · Apple Silicon and Intel", docs: "/docs/install-macos/" },
  { os: "windows", name: "Windows", glyph: "▦", req: "Windows 10/11 + WebView2", docs: "/docs/install-windows/" },
  { os: "linux", name: "Linux", glyph: "›_", req: "WebKitGTK 4.1 ≥ 2.40", docs: "/docs/install-linux/" },
];
const OS_NAME: Record<string, string> = { mac: "macOS", windows: "Windows", linux: "Linux" };
const linkCls = "text-cyan underline-offset-4 hover:underline focus-visible:underline";

export function Downloads() {
  const list = downloads(SITE.VERSION);
  const [plat, setPlat] = useState<Platform | null>(null);
  useEffect(() => {
    let live = true;
    setPlat(detectPlatform(navigator as never));
    detectPlatformAsync(navigator as never).then((p) => live && setPlat(p));
    return () => { live = false; };
  }, []);
  const primary = plat ? primaryDownload(plat, list) : null;

  return (
    <section id="download" className="mx-auto max-w-5xl px-4 py-20 sm:px-6" aria-labelledby="download-h">
      <h2 id="download-h" className="font-display text-4xl italic text-text-0">Download Lumetrope</h2>
      <p className="mt-3 text-text-1">
        Version <span className="font-mono text-text-0">{SITE.VERSION}</span>. Free and open source.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4" data-testid="primary-download">
        {primary && (
          <a href={primary.url} className="rounded-lg bg-lume px-6 py-3 font-semibold text-bg-0 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan">
            Download for {OS_NAME[primary.os]} <span className="font-mono text-sm">({primary.label})</span>
          </a>
        )}
        <a href={SITE.WEB_APP_URL} className="rounded-lg border border-text-2 px-6 py-3 text-text-0 hover:border-lume focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan">
          Open the web app
        </a>
        <a href={`${SITE.REPO_URL}/releases/latest`} className={linkCls}>All releases</a>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {GROUPS.map((g) => (
          <div key={g.os} className="rounded-xl border border-bg-3 bg-bg-1 p-5">
            <h3 className="flex items-center gap-2 text-lg text-text-0">
              <span aria-hidden="true" className="font-mono text-lume">{g.glyph}</span>{g.name}
            </h3>
            <p className="mt-1 text-sm text-text-2">{g.req}</p>
            <ul className="mt-4 space-y-2">
              {list.filter((d) => d.os === g.os).map((d) => (
                <li key={d.file}>
                  <a href={d.url} className={linkCls}>{d.label}</a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <a href={g.docs} className="text-text-1 hover:text-text-0 hover:underline">Build from source</a>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
