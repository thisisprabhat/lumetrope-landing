import { describe, it, expect } from "vitest";
import { RELEASE, SITE, archName, archsFor, downloads, intelMacMissing, primaryDownload, primaryLabel, publishedDownloads, type Release } from "../src/config/site";
import { detectPlatform, detectPlatformAsync } from "../src/lib/platform";

const list = downloads("0.1.0");
const pick = (os: any, arch: any) => primaryDownload({ os, arch }, list);

describe("downloads", () => {
  it("mac arm64 -> aarch64 dmg", () => expect(pick("mac", "arm64")?.file).toBe("Lumetrope_0.1.0_aarch64.dmg"));
  it("mac unknown -> aarch64 dmg", () => expect(pick("mac", "unknown")?.file).toBe("Lumetrope_0.1.0_aarch64.dmg"));
  it("mac x64 -> x64 dmg", () => expect(pick("mac", "x64")?.file).toBe("Lumetrope_0.1.0_x64.dmg"));
  it("windows x64", () => expect(pick("windows", "x64")?.file).toBe("Lumetrope_0.1.0_x64-setup.exe"));
  it("windows arm64", () => expect(pick("windows", "arm64")?.file).toBe("Lumetrope_0.1.0_arm64-setup.exe"));
  it("linux unknown -> amd64.deb", () => expect(pick("linux", "unknown")?.file).toBe("Lumetrope_0.1.0_amd64.deb"));
  it("other -> null", () => expect(pick("other", "unknown")).toBeNull());
  it("unknown linux arch never gets an arm64-only build", () => {
    const arm = list.filter((d) => d.arch === "arm64");
    expect(primaryDownload({ os: "linux", arch: "unknown" }, arm)).toBeNull();
    expect(primaryDownload({ os: "linux", arch: "arm64" }, arm)?.file).toBe("Lumetrope_0.1.0_arm64.deb");
  });
  it("a known arch with no build of its own gets no primary (Intel Mac, arm-only release)", () => {
    const arm = list.filter((d) => d.arch === "arm64");
    expect(primaryDownload({ os: "mac", arch: "x64" }, arm)).toBeNull();
    expect(primaryDownload({ os: "mac", arch: "unknown" }, arm)?.file).toBe("Lumetrope_0.1.0_aarch64.dmg");
    expect(primaryDownload({ os: "windows", arch: "x64" }, arm)).toBeNull();
  });
  it("urls", () => {
    expect(list.length).toBe(11);
    for (const d of list) expect(d.url.startsWith(`${SITE.REPO_URL}/releases/download/v0.1.0/`)).toBe(true);
  });
});

describe("Review Focus 4: never a dead or wrong primary button", () => {
  const arm = list.filter((d) => d.arch === "arm64"); // what v0.1.0 actually ships
  it("unknown-arch Mac (Safari/Firefox) gets the Apple Silicon dmg, labelled as Apple Silicon", () => {
    const p = primaryDownload({ os: "mac", arch: "unknown" }, arm)!;
    expect(p.file).toBe("Lumetrope_0.1.0_aarch64.dmg");
    expect(primaryLabel(p)).toBe("Download for macOS (Apple Silicon)");
  });
  it("labels always name the architecture", () => {
    expect(primaryLabel(pick("mac", "x64")!)).toBe("Download for macOS (Intel)");
    expect(primaryLabel(pick("windows", "x64")!)).toBe("Download for Windows (x64)");
    expect(primaryLabel(pick("linux", "arm64")!)).toBe("Download for Linux (ARM64)");
  });
  it("flags the missing Intel build for Intel and unknown-arch Macs, not for Apple Silicon", () => {
    expect(intelMacMissing({ os: "mac", arch: "unknown" }, arm)).toBe(true);
    expect(intelMacMissing({ os: "mac", arch: "x64" }, arm)).toBe(true);
    expect(intelMacMissing({ os: "mac", arch: "arm64" }, arm)).toBe(false);
    expect(intelMacMissing({ os: "windows", arch: "x64" }, arm)).toBe(false);
    expect(intelMacMissing(null, arm)).toBe(false);
    // once an Intel dmg is published the note goes away
    expect(intelMacMissing({ os: "mac", arch: "unknown" }, list)).toBe(false);
  });
  it("names the architectures a release covers per OS", () => {
    expect(archsFor("mac", arm)).toEqual(["Apple Silicon"]);
    expect(archsFor("mac", list)).toEqual(["Apple Silicon", "Intel"]);
    expect(archsFor("windows", arm)).toEqual(["ARM64"]);
    expect(archsFor("linux", list)).toEqual(["x64", "ARM64"]);
    expect(archName({ os: "linux", arch: "x64" })).toBe("x64");
  });
});

describe("release snapshot", () => {
  it("is for the repo and version in site.ts", () => {
    expect(SITE.REPO_URL).toBe(`https://github.com/${RELEASE.repo}`);
    expect(RELEASE.tag).toBe(`v${SITE.VERSION}`);
  });
  it("only published assets are offered, with sizes", () => {
    const pub = publishedDownloads();
    expect(pub.length).toBeGreaterThan(0);
    const names = new Set(RELEASE.assets.map((a) => a.name));
    for (const d of pub) {
      expect(names.has(d.file), d.file).toBe(true);
      expect(d.size).toBeGreaterThan(0);
    }
  });
  it("filters the catalogue by asset name", () => {
    const rel: Release = { repo: "x/y", tag: "v0.1.0", url: "", publishedAt: "", assets: [{ name: "Lumetrope_0.1.0_x64-setup.exe", size: 5 }] };
    expect(publishedDownloads("0.1.0", rel).map((d) => d.file)).toEqual(["Lumetrope_0.1.0_x64-setup.exe"]);
  });
  it("offers nothing when the snapshot is for another version", () => {
    expect(publishedDownloads("9.9.9")).toEqual([]);
  });
});

describe("detectPlatform", () => {
  it("userAgentData", () => expect(detectPlatform({ userAgentData: { platform: "Windows" }, userAgent: "", platform: "" })).toEqual({ os: "windows", arch: "x64" }));
  it("UA mac", () => expect(detectPlatform({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", platform: "MacIntel" })).toEqual({ os: "mac", arch: "unknown" }));
  it("iPad is other", () => expect(detectPlatform({ userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)", platform: "iPad" }).os).toBe("other"));
  it("android/cros other", () => {
    expect(detectPlatform({ userAgent: "Mozilla/5.0 (Linux; Android 14)", platform: "Linux armv8l" }).os).toBe("other");
    expect(detectPlatform({ userAgent: "Mozilla/5.0 (X11; CrOS x86_64 1)", platform: "Linux x86_64" }).os).toBe("other");
  });
  it("linux", () => expect(detectPlatform({ userAgent: "Mozilla/5.0 (X11; Linux x86_64)", platform: "Linux x86_64" })).toEqual({ os: "linux", arch: "x64" }));
  it("windows arm UA", () => expect(detectPlatform({ userAgent: "Mozilla/5.0 (Windows NT 10.0; ARM64)", platform: "Win32" })).toEqual({ os: "windows", arch: "arm64" }));
  it("iPadOS desktop-mode Safari is other", () => {
    const p = detectPlatform({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", platform: "MacIntel", maxTouchPoints: 5 });
    expect(p.os).toBe("other");
    expect(primaryDownload(p, list)).toBeNull();
  });
  it("real Mac stays mac", () => {
    const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";
    expect(detectPlatform({ userAgent: ua, platform: "MacIntel", maxTouchPoints: 0 }).os).toBe("mac");
    expect(detectPlatform({ userAgent: ua, platform: "MacIntel" }).os).toBe("mac");
  });
  it("armv7l linux is not arm64", () => expect(detectPlatform({ userAgent: "Mozilla/5.0 (X11; Linux armv7l)", platform: "Linux armv7l" }).arch).not.toBe("arm64"));
  it("aarch64 linux is arm64", () => expect(detectPlatform({ userAgent: "Mozilla/5.0 (X11; Linux aarch64)", platform: "Linux aarch64" }).arch).toBe("arm64"));
  it("async refines arch", async () => {
    const nav = { userAgent: "Mozilla/5.0 (Macintosh)", platform: "MacIntel", userAgentData: { platform: "macOS", getHighEntropyValues: async () => ({ architecture: "arm", bitness: "64" }) } };
    expect(await detectPlatformAsync(nav)).toEqual({ os: "mac", arch: "arm64" });
  });
  it("async survives rejection", async () => {
    const nav = { userAgent: "", platform: "", userAgentData: { platform: "Windows", getHighEntropyValues: async () => { throw new Error("x"); } } };
    expect((await detectPlatformAsync(nav)).os).toBe("windows");
  });
});
