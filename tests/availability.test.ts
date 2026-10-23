import { describe, expect, it } from "vitest";
import { RELEASE, SITE, downloads, publishedDownloads, type Release } from "../src/config/site";
import { BUILD_URL, desktopSummary, installStatus, operatingSystems, platformPhrase, platformsAnswer } from "../src/content/availability";
import { FAQ, faqFor } from "../src/content/faq";

const v = SITE.VERSION;
const snapshot = (names: string[]): Release => ({ ...RELEASE, tag: `v${v}`, assets: names.map((name) => ({ name, size: 1 })) });
const all = publishedDownloads(v, snapshot(downloads(v).map((d) => d.file)));
const current = publishedDownloads();

describe("availability wording follows the release snapshot", () => {
  it("current snapshot: names macOS (Apple Silicon and Intel) and Linux (x64 and ARM64), no Windows", () => {
    expect(platformPhrase(current)).toBe("macOS (Apple Silicon and Intel) and Linux (x64 and ARM64)");
    expect(operatingSystems(current)).toBe("macOS, Linux, Web");
    const a = platformsAnswer(current);
    expect(a).not.toMatch(/Windows \(/);
    expect(a).toContain(BUILD_URL);
    expect(a).toContain("use the web app");
    expect(desktopSummary(current)).not.toMatch(/Windows/);
  });

  it("arm-only release: names only Apple Silicon and ARM64", () => {
    const arm = current.filter((d) => d.arch === "arm64");
    expect(platformPhrase(arm)).toBe("macOS (Apple Silicon) and Linux (ARM64)");
    const a = platformsAnswer(arm);
    expect(a).not.toMatch(/Windows|Intel|x64|x86_64/);
    expect(a).toContain("macOS (Apple Silicon; .dmg)");
    expect(a).toContain("Linux (ARM64; .deb, .rpm and AppImage)");
  });

  it("every asset: names all three systems and both architectures", () => {
    expect(platformPhrase(all)).toBe("macOS (Apple Silicon and Intel), Windows (x64 and ARM64) and Linux (x64 and ARM64)");
    expect(operatingSystems(all)).toBe("macOS, Windows, Linux, Web");
    const a = platformsAnswer(all);
    for (const s of ["macOS 11 or newer", "Windows 10 or 11", "WebKitGTK 4.1 version 2.40 or newer", ".msi", ".exe"]) expect(a).toContain(s);
  });

  it("nothing published: says so and points to source and the web app", () => {
    expect(platformPhrase([])).toBe("");
    expect(platformsAnswer([])).toMatch(/No desktop builds are published/);
    expect(operatingSystems([])).toBe("Web");
  });

  it("install pages: a platform without a build says so up front", () => {
    expect(installStatus("windows", current)).toMatch(/no published Windows build/);
    expect(installStatus("windows", current)).toContain(BUILD_URL);
    expect(installStatus("mac", current.filter((d) => d.arch === "arm64"))).toMatch(/macOS builds for Apple Silicon\..*no published build for Intel/);
    expect(installStatus("mac", current)).toBe("This release has macOS builds for Apple Silicon and Intel.");
    expect(installStatus("mac", all)).toBe("This release has macOS builds for Apple Silicon and Intel.");
  });

  it("the FAQ platforms answer is generated from the same helper", () => {
    const q = (f: typeof FAQ) => f.find((x) => x.q.startsWith("Which platforms"))!.a;
    expect(q(FAQ)).toBe(platformsAnswer(current));
    expect(q(faqFor(all))).toBe(platformsAnswer(all));
    expect(q(faqFor(all))).not.toBe(q(FAQ));
  });
});
