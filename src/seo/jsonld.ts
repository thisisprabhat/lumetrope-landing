import { SITE, publishedDownloads, primaryDownload } from "../config/site";
import { installStatus, operatingSystems } from "../content/availability";
import { FAQ } from "../content/faq";
import { DOCS } from "../docs/nav";
import { DOCS_INDEX_META, DOCS_UPDATED, pageMeta } from "./meta";

const CONTEXT = "https://schema.org";
const ORG_ID = `${SITE.SITE_URL}/#organization`;

const LS = new RegExp(String.fromCharCode(0x2028), "g");
const PS = new RegExp(String.fromCharCode(0x2029), "g");

/** Serialise for inline <script type="application/ld+json">: "<" can never close the tag. */
export function serializeLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(LS, "\\u2028").replace(PS, "\\u2029");
}

const HOWTO: Record<string, { name: string; steps: { name: string; text: string }[] }> = {
  "install-macos": {
    name: "Install Lumetrope on macOS",
    steps: [
      { name: "Download the dmg", text: `Download the .dmg for your Mac from the project's GitHub Releases page. ${installStatus("mac")}` },
      { name: "Install", text: "Open the dmg and drag Lumetrope to Applications." },
      { name: "Allow the first launch", text: "If Gatekeeper blocks a build that is not notarized, right-click the app, choose Open, then Open again, or run xattr -dr com.apple.quarantine /Applications/Lumetrope.app in Terminal." },
    ],
  },
  "install-windows": {
    name: "Install Lumetrope on Windows",
    steps: [
      { name: "Download the installer", text: `Download the setup (.exe) or .msi from the project's GitHub Releases page. ${installStatus("windows")}` },
      { name: "Run it", text: "Run the installer on Windows 10 or 11. It downloads the WebView2 runtime if it is missing." },
      { name: "Continue past SmartScreen", text: "If Windows shows \"Windows protected your PC\" for an unsigned build, choose More info, then Run anyway." },
    ],
  },
  "install-linux": {
    name: "Install Lumetrope on Linux",
    steps: [
      { name: "Check requirements", text: "You need a desktop with WebKitGTK 4.1 version 2.40 or newer, which Ubuntu 22.04+, Debian 12+ and Fedora 38+ provide." },
      { name: "Download the package", text: `Download the .deb, .rpm or .AppImage for your distribution and architecture from the project's GitHub Releases page. ${installStatus("linux")}` },
      { name: "Install and launch", text: "Install the .deb or .rpm with your package manager. For an AppImage, run chmod +x Lumetrope_*.AppImage, then launch it." },
    ],
  },
};

function landing() {
  const list = publishedDownloads();
  const dl = primaryDownload({ os: "mac", arch: "arm64" }, list) ?? list[0] ?? null;
  return [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Lumetrope",
      url: SITE.SITE_URL,
      logo: `${SITE.SITE_URL}/og/default.png`,
      sameAs: [SITE.REPO_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.SITE_URL}/#website`,
      name: "Lumetrope",
      url: SITE.SITE_URL,
      publisher: { "@id": ORG_ID },
    },
    {
      "@type": "SoftwareApplication",
      name: "Lumetrope",
      description: "Open-source Lottie and dotLottie animation editor with state machines, a WASM engine and an MCP server for AI agents.",
      operatingSystem: operatingSystems(list),
      applicationCategory: "DesignApplication",
      softwareVersion: SITE.VERSION,
      url: SITE.SITE_URL,
      downloadUrl: dl?.url ?? `${SITE.REPO_URL}/releases/latest`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": ORG_ID },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
}

function docs(path: string) {
  const d = DOCS.find((x) => `/docs/${x.slug}/` === path)!;
  const m = pageMeta(path)!;
  const nodes: Record<string, unknown>[] = [
    {
      "@type": "TechArticle",
      headline: d.title,
      description: d.description,
      url: m.canonical,
      mainEntityOfPage: m.canonical,
      image: m.image,
      inLanguage: "en",
      dateModified: DOCS_UPDATED,
      author: { "@id": ORG_ID },
      publisher: { "@type": "Organization", "@id": ORG_ID, name: "Lumetrope", url: SITE.SITE_URL },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Lumetrope", item: SITE.SITE_URL + "/" },
        { "@type": "ListItem", position: 2, name: "Docs", item: `${SITE.SITE_URL}/docs/getting-started/` },
        { "@type": "ListItem", position: 3, name: d.title, item: m.canonical },
      ],
    },
  ];
  const how = HOWTO[d.slug];
  if (how) {
    nodes.push({
      "@type": "HowTo",
      name: how.name,
      step: how.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
    });
  }
  return nodes;
}

/** JSON-LD document for a route, or null for unknown paths. */
export function jsonLdFor(path: string): object | null {
  if (path === "/") return { "@context": CONTEXT, "@graph": landing() };
  if (path === "/docs/") {
    return {
      "@context": CONTEXT,
      "@graph": [
        { "@type": "CollectionPage", name: DOCS_INDEX_META.title, description: DOCS_INDEX_META.description, url: pageMeta(path)!.canonical, publisher: { "@id": ORG_ID } },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Lumetrope", item: SITE.SITE_URL + "/" },
          { "@type": "ListItem", position: 2, name: "Docs", item: pageMeta(path)!.canonical },
        ] },
      ],
    };
  }
  if (!pageMeta(path)) return null;
  return { "@context": CONTEXT, "@graph": docs(path) };
}
