import release from "../content/release.json";

export const SITE = {
  SITE_URL: "https://lumetrope.app",
  REPO_URL: "https://github.com/thisisprabhat/lumetrope",
  VERSION: "0.1.0",
  WEB_APP_URL: "https://app.lumetrope.waygosquad.tech/",
  /** Used when WEB_APP_URL can't be reached (see src/lib/webApp.ts). */
  WEB_APP_FALLBACK_URL: "https://app.lumetrope.waygosquad.com/",
} as const;

/** Snapshot of the GitHub release (src/content/release.json, refreshed by `pnpm sync:release`). */
export type Release = { repo: string; tag: string; url: string; publishedAt: string; assets: { name: string; size: number }[] };
export const RELEASE: Release = release;

export type DownloadOS = "mac" | "windows" | "linux";
export type Download = {
  os: DownloadOS;
  arch: "arm64" | "x64";
  label: string;
  file: string;
  url: string;
  /** Bytes, when the asset is in the release snapshot. */
  size?: number;
  kind: "dmg" | "exe" | "msi" | "deb" | "rpm" | "AppImage";
};

export function downloads(v: string): Download[] {
  const base = `${SITE.REPO_URL}/releases/download/v${v}/`;
  const d = (os: Download["os"], arch: Download["arch"], kind: Download["kind"], label: string, file: string): Download => ({
    os, arch, kind, label, file, url: base + file,
  });
  return [
    d("mac", "arm64", "dmg", "Apple Silicon (.dmg)", `Lumetrope_${v}_aarch64.dmg`),
    d("mac", "x64", "dmg", "Intel (.dmg)", `Lumetrope_${v}_x64.dmg`),
    d("windows", "x64", "exe", "64-bit installer (.exe)", `Lumetrope_${v}_x64-setup.exe`),
    d("windows", "x64", "msi", "64-bit MSI (.msi)", `Lumetrope_${v}_x64_en-US.msi`),
    d("windows", "arm64", "exe", "ARM64 installer (.exe)", `Lumetrope_${v}_arm64-setup.exe`),
    d("linux", "x64", "deb", "Debian/Ubuntu x86_64 (.deb)", `Lumetrope_${v}_amd64.deb`),
    d("linux", "x64", "rpm", "Fedora/RHEL x86_64 (.rpm)", `Lumetrope-${v}-1.x86_64.rpm`),
    d("linux", "x64", "AppImage", "AppImage x86_64", `Lumetrope_${v}_amd64.AppImage`),
    d("linux", "arm64", "deb", "Debian/Ubuntu ARM64 (.deb)", `Lumetrope_${v}_arm64.deb`),
    d("linux", "arm64", "rpm", "Fedora/RHEL ARM64 (.rpm)", `Lumetrope-${v}-1.aarch64.rpm`),
    d("linux", "arm64", "AppImage", "AppImage ARM64", `Lumetrope_${v}_aarch64.AppImage`),
  ];
}

/**
 * The downloads that really exist in the release snapshot for `v`, with their sizes. Empty when
 * the snapshot is for another version, so the page falls back to "All releases" instead of
 * linking files that may not exist.
 */
export function publishedDownloads(v: string = SITE.VERSION, rel: Release = RELEASE): Download[] {
  if (rel.tag !== `v${v}`) return [];
  const size = new Map(rel.assets.map((a) => [a.name, a.size]));
  return downloads(v).filter((d) => size.has(d.file)).map((d) => ({ ...d, size: size.get(d.file) }));
}

const PREFERRED: Record<DownloadOS, Download["kind"]> = { mac: "dmg", windows: "exe", linux: "deb" };

/**
 * Primary download for a platform, or null when unsupported (never a dead button). A known
 * architecture only ever gets its own build: an Intel Mac is never offered the Apple Silicon dmg.
 */
export function primaryDownload(p: { os: DownloadOS | "other"; arch: "arm64" | "x64" | "unknown" }, list: Download[]): Download | null {
  if (p.os === "other") return null;
  const of = list.filter((x) => x.os === p.os && x.kind === PREFERRED[p.os]);
  if (p.arch !== "unknown") return of.find((x) => x.arch === p.arch) ?? null;
  // Unknown arch (Safari and Firefox never say): Macs are most likely Apple Silicon, so offer that
  // build, labelled as such (see primaryLabel) next to a note for Intel Macs. If only an Intel dmg
  // exists it is still safe to offer: it runs natively on Intel and through Rosetta on Apple
  // Silicon. Elsewhere assume x64 and don't guess further.
  const likely = p.os === "mac" ? "arm64" : "x64";
  return of.find((x) => x.arch === likely) ?? (p.os === "mac" ? of[0] : undefined) ?? null;
}

export const OS_LABEL: Record<DownloadOS, string> = { mac: "macOS", windows: "Windows", linux: "Linux" };

/** Short architecture name: "Apple Silicon" / "Intel" on macOS, "ARM64" / "x64" elsewhere. */
export const archName = (d: Pick<Download, "os" | "arch">) =>
  d.os === "mac" ? (d.arch === "arm64" ? "Apple Silicon" : "Intel") : d.arch === "arm64" ? "ARM64" : "x64";

/** Primary button text. Always names the architecture, so an unknown-arch Mac sees "Apple Silicon". */
export const primaryLabel = (d: Download) => `Download for ${OS_LABEL[d.os]} (${archName(d)})`;

/** The architectures a release has builds for, per OS, e.g. ["Apple Silicon"] for macOS. */
export const archsFor = (os: DownloadOS, list: Download[]) => [...new Set(list.filter((d) => d.os === os).map(archName))];

/**
 * True when the visitor is (or may be) on an Intel Mac and the release has no Intel build, so the
 * page should say so and point to the web app.
 */
export const intelMacMissing = (p: { os: string; arch: string } | null, list: Download[]) =>
  !!p && p.os === "mac" && p.arch !== "arm64" && !list.some((d) => d.os === "mac" && d.arch === "x64");
