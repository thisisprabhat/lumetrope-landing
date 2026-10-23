import type { ReactNode } from "react";
import { bus } from "../lib/bus";
import { RELEASE, SITE, archsFor, intelMacMissing, primaryDownload, primaryLabel, publishedDownloads, type DownloadOS } from "../config/site";
import { usePlatform } from "../lib/usePlatform";
import { CtaLink } from "./CtaLink";

// `req` is the system requirement; the architectures are appended from the release data.
const GROUPS: { os: DownloadOS; name: string; glyph: string; req: string; docs: string }[] = [
  { os: "mac", name: "macOS", glyph: "◆", req: "macOS 11+", docs: "/docs/install-macos/" },
  { os: "windows", name: "Windows", glyph: "▦", req: "Windows 10/11 + WebView2", docs: "/docs/install-windows/" },
  { os: "linux", name: "Linux", glyph: "›_", req: "WebKitGTK 4.1 ≥ 2.40", docs: "/docs/install-linux/" },
];
const linkCls = "text-cyan underline-offset-4 hover:underline focus-visible:underline";
const mb = (n: number) => `${n >= 10 * 1048576 ? Math.round(n / 1048576) : (n / 1048576).toFixed(1)} MB`;
const released = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** `art` is an optional player shown beside the heading (the landing page passes one). */
export function Downloads({ art }: { art?: ReactNode } = {}) {
  // Only files that exist in the GitHub release snapshot (src/content/release.json).
  const list = publishedDownloads();
  const plat = usePlatform();
  const primary = plat ? primaryDownload(plat, list) : null;
  const noIntel = intelMacMissing(plat, list);

  return (
    <section id="download" className="mx-auto max-w-6xl px-4 py-20 sm:px-6" aria-labelledby="download-h">
      <div className="flex items-center gap-4">
        {art}
        <h2 id="download-h" className="font-display text-4xl italic text-text-0">Download Lumetrope</h2>
      </div>
      <p className="mt-3 text-text-1">
        Version <span className="font-mono text-text-0">{SITE.VERSION}</span>
        {RELEASE.tag === `v${SITE.VERSION}` && <>, released <time dateTime={RELEASE.publishedAt}>{released(RELEASE.publishedAt)}</time></>}.
        {" "}Free and open source, <a href={SITE.REPO_URL} className={linkCls}>on GitHub</a>.
      </p>

      <div className="mt-8 flex min-h-[7.5rem] flex-wrap content-start items-center gap-4 sm:min-h-[3.5rem]" data-testid="primary-download">
        {primary && (
          <CtaLink href={primary.url} onPress={() => bus.emit("download")}>
            {primaryLabel(primary)}
          </CtaLink>
        )}
        <CtaLink href={SITE.WEB_APP_URL} variant="ghost" glyph="open">Open the web app</CtaLink>
        <a href={`${SITE.REPO_URL}/releases/latest`} className={linkCls}>All releases</a>
      </div>
      {noIntel && (
        <p data-testid="intel-note" className="mt-4 max-w-xl text-sm text-text-1">
          This release has no Intel Mac build yet. On an Intel Mac, <a href={SITE.WEB_APP_URL} className={linkCls}>use the web app</a> or build it from source.
        </p>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {GROUPS.map((g) => (
          <div key={g.os} className="rounded-xl border border-bg-3 bg-bg-1 p-5">
            <h3 className="flex items-center gap-2 text-lg text-text-0">
              <span aria-hidden="true" className="font-mono text-lume">{g.glyph}</span>{g.name}
            </h3>
            <p className="mt-1 text-sm text-text-2">{[g.req, archsFor(g.os, list).join(" and ")].filter(Boolean).join(" · ")}</p>
            {list.some((d) => d.os === g.os) ? (
              <ul className="mt-4 space-y-2">
                {list.filter((d) => d.os === g.os).map((d) => (
                  <li key={d.file} className="flex items-baseline justify-between gap-3">
                    <a href={d.url} onClick={() => bus.emit("download")} className={linkCls}>{d.label}</a>
                    {d.size && <span className="shrink-0 font-mono text-xs text-text-2">{mb(d.size)}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-text-1">
                {`No ${g.name} build in this release yet.`} Use the web app, or build it from source.
              </p>
            )}
            <p className="mt-4 text-sm">
              <a href={g.docs} className="text-text-1 hover:text-text-0 hover:underline">Build from source</a>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
