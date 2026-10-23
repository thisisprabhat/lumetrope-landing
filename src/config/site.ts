export const SITE = {
  SITE_URL: "https://lumetrope.app",
  REPO_URL: "https://github.com/OWNER/lumetrope",
  VERSION: "0.1.0",
  WEB_APP_URL: "https://lumetrope.app/app/",
} as const;

export type DownloadOS = "mac" | "windows" | "linux";
export type Download = {
  os: DownloadOS;
  arch: "arm64" | "x64";
  label: string;
  file: string;
  url: string;
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
    d("linux", "arm64", "AppImage", "AppImage ARM64", `Lumetrope_${v}_aarch64.AppImage`),
  ];
}

const PREFERRED: Record<DownloadOS, Download["kind"]> = { mac: "dmg", windows: "exe", linux: "deb" };

/** Primary download for a platform, or null when unsupported (never a dead button). */
export function primaryDownload(p: { os: DownloadOS | "other"; arch: "arm64" | "x64" | "unknown" }, list: Download[]): Download | null {
  if (p.os === "other") return null;
  const arch = p.arch === "unknown" ? (p.os === "mac" ? "arm64" : "x64") : p.arch;
  const of = list.filter((x) => x.os === p.os && x.kind === PREFERRED[p.os]);
  return of.find((x) => x.arch === arch) ?? of[0] ?? null;
}
