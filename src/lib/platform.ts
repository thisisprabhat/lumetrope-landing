export type Platform = { os: "mac" | "windows" | "linux" | "other"; arch: "arm64" | "x64" | "unknown" };
export type NavLike = {
  userAgent?: string;
  platform?: string;
  userAgentData?: { platform?: string; getHighEntropyValues?: (h: string[]) => Promise<Record<string, unknown>> };
};

export function detectPlatform(nav: NavLike): Platform {
  const ua = nav.userAgent ?? "";
  const plat = nav.userAgentData?.platform || nav.platform || "";
  const all = `${plat} ${ua}`;
  if (/iPad|iPhone|iPod|Android|CrOS/i.test(all)) return { os: "other", arch: "unknown" };
  let os: Platform["os"] = "other";
  if (/mac/i.test(plat) || (!plat && /Macintosh/.test(ua))) os = "mac";
  else if (/win/i.test(plat) || (!plat && /Windows/.test(ua))) os = "windows";
  else if (/linux|x11/i.test(all)) os = "linux";
  else if (/Macintosh/.test(ua)) os = "mac";
  else if (/Windows/.test(ua)) os = "windows";
  if (os === "other") return { os, arch: "unknown" };
  let arch: Platform["arch"] = "unknown";
  if (/arm64|aarch64|\bARM\b/i.test(ua) || /arm|aarch64/i.test(nav.platform ?? "")) arch = "arm64";
  else if (os !== "mac" && /x86_64|x64|Win64|amd64|x86/i.test(`${ua} ${nav.platform ?? ""}`)) arch = "x64";
  else if (os === "windows") arch = "x64";
  return { os, arch };
}

export async function detectPlatformAsync(nav: NavLike): Promise<Platform> {
  const base = detectPlatform(nav);
  const get = nav.userAgentData?.getHighEntropyValues;
  if (!get || base.os === "other") return base;
  try {
    const v = await get.call(nav.userAgentData, ["architecture", "bitness"]);
    const a = String(v.architecture ?? "").toLowerCase();
    if (a.startsWith("arm")) return { ...base, arch: "arm64" };
    if (a.startsWith("x86")) return { ...base, arch: "x64" };
  } catch { /* keep UA-derived result */ }
  return base;
}
