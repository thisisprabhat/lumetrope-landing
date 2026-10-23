import { OS_LABEL, SITE, archName, publishedDownloads, type Download, type DownloadOS } from "../config/site";

/**
 * Platform-availability wording, generated from the list of builds a release really ships
 * (`publishedDownloads()`), so no page promises a build that does not exist. Pass a different list
 * to describe another snapshot.
 */
export const BUILD_URL = `${SITE.REPO_URL}/blob/main/BUILD.md`;
const ORDER: DownloadOS[] = ["mac", "windows", "linux"];
const REQUIREMENT: Record<DownloadOS, string> = {
  mac: "macOS 11 or newer",
  windows: "Windows 10 or 11",
  linux: "Linux with WebKitGTK 4.1 version 2.40 or newer",
};
const BROWSERS = "Chrome and Edge 91+, Firefox 89+ and Safari 16.4+";

const join = (xs: string[]) => (xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const kindName = (k: Download["kind"]) => (k === "AppImage" ? "AppImage" : `.${k}`);
const uniq = <T,>(xs: T[]) => [...new Set(xs)];

export type PlatformBuilds = { os: DownloadOS; label: string; archs: string[]; kinds: string[] };

/** The operating systems with at least one published build, in a fixed order. */
export function platformBuilds(list: Download[] = publishedDownloads()): PlatformBuilds[] {
  return ORDER.flatMap((os) => {
    const of = list.filter((d) => d.os === os);
    return of.length ? [{ os, label: OS_LABEL[os], archs: uniq(of.map(archName)), kinds: uniq(of.map((d) => kindName(d.kind))) }] : [];
  });
}

/** "macOS (Apple Silicon) and Linux (ARM64)", or "" when nothing is published. */
export function platformPhrase(list?: Download[]): string {
  return join(platformBuilds(list).map((p) => `${p.label} (${p.archs.join(" and ")})`));
}

/** Value for JSON-LD `operatingSystem`: the published desktop systems plus the web. */
export function operatingSystems(list?: Download[]): string {
  return [...platformBuilds(list).map((p) => p.label), "Web"].join(", ");
}

/** The fallback sentence: other platforms build from source or use the web app. */
export const otherPlatforms = `Other platforms can build from source (${BUILD_URL}) or use the web app.`;

/** One-sentence summary for the hero and the features card (plain text). */
export function desktopSummary(list?: Download[]): string {
  const phrase = platformPhrase(list);
  return phrase ? `Desktop builds for ${phrase}, and the web app in any modern browser.` : "The web app runs in any modern browser, and the desktop app can be built from source.";
}

/** FAQ answer to "Which platforms does it run on?". */
export function platformsAnswer(list?: Download[]): string {
  const builds = platformBuilds(list);
  const web = `The web app runs in ${BROWSERS}.`;
  if (!builds.length) {
    return `No desktop builds are published for this release. You can build the desktop app from source (${BUILD_URL}) or use the web app. ${web}`;
  }
  const what = join(builds.map((p) => `${p.label} (${p.archs.join(" and ")}; ${join(p.kinds)})`));
  const reqs = builds.map((p) => REQUIREMENT[p.os]).join("; ");
  return `Desktop builds are published for ${what}. They need ${reqs}. ${otherPlatforms} ${web}`;
}

/** Status text for an install page: what is published for `os`, or that nothing is. Plain text. */
export function installStatus(os: DownloadOS, list: Download[] = publishedDownloads()): string {
  const label = OS_LABEL[os];
  const of = list.filter((d) => d.os === os);
  if (!of.length) {
    return `This release has no published ${label} build yet. You can build Lumetrope from source (${BUILD_URL}) or use the web app. The requirements below apply to a build you make yourself.`;
  }
  const have = uniq(of.map((d) => d.arch));
  const missing = (["arm64", "x64"] as const).filter((a) => !have.includes(a)).map((a) => archName({ os, arch: a }));
  const tail = missing.length ? ` There is no published build for ${join(missing)}: build from source (${BUILD_URL}) or use the web app.` : "";
  return `This release has ${label} builds for ${join(uniq(of.map(archName)))}.${tail}`;
}
