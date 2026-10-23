// Asserts on the built output in dist/ (built once by tests/global-build.ts).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { inflateSync } from "node:zlib";
import { describe, expect, test } from "vitest";
import { SITE } from "../src/config/site";
import { DOCS } from "../src/docs/nav";
import { FAQ } from "../src/content/faq";
import { encodePng } from "../scripts/png.mjs";

const dist = (p: string) => join("dist", p);
const paths = ["/", ...DOCS.map((d) => `/docs/${d.slug}/`)];
const page = (p: string) => readFileSync(dist(join(p, "index.html")), "utf8");
const decode = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const strip = (s: string) => decode(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const attr = (html: string, re: RegExp) => {
  const m = html.match(re);
  return m ? decode(m[1]) : null;
};
const ld = (html: string): any[] =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const types = (html: string) => ld(html).flatMap((b) => (Array.isArray(b["@graph"]) ? b["@graph"] : [b])).map((n) => n["@type"]);

describe("head, per route", () => {
  test.each(paths)("%s", (p) => {
    const html = page(p);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html.match(/<link rel="canonical"/g)).toHaveLength(1);
    expect(attr(html, /<link rel="canonical" href="([^"]*)"/)).toBe(`${SITE.SITE_URL}${p}`);
    const title = strip(html.match(/<title>([\s\S]*?)<\/title>/)![1]);
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThanOrEqual(60);
    const desc = attr(html, /<meta name="description" content="([^"]*)"/)!;
    expect(desc.length).toBeGreaterThanOrEqual(120);
    expect(desc.length).toBeLessThanOrEqual(160);
    expect(attr(html, /<meta property="og:title" content="([^"]*)"/)).toBe(title);
    expect(attr(html, /<meta property="og:url" content="([^"]*)"/)).toBe(`${SITE.SITE_URL}${p}`);
    expect(attr(html, /<meta property="og:image" content="([^"]*)"/)).toMatch(/\/og\/(default|docs)\.png$/);
    expect(attr(html, /<meta name="twitter:card" content="([^"]*)"/)).toBe("summary_large_image");
    expect(attr(html, /<meta name="theme-color" content="([^"]*)"/)).toBe("#0b0c0e");
  });
});

describe("JSON-LD", () => {
  test.each(paths)("%s blocks parse with @context", (p) => {
    const blocks = ld(page(p));
    expect(blocks.length).toBeGreaterThan(0);
    for (const b of blocks) expect(b["@context"]).toBe("https://schema.org");
  });

  test("/ has Organization, WebSite, SoftwareApplication, FAQPage", () => {
    const t = types(page("/"));
    for (const k of ["Organization", "WebSite", "SoftwareApplication", "FAQPage"]) expect(t).toContain(k);
    const app = ld(page("/")).flatMap((b) => b["@graph"] ?? [b]).find((n) => n["@type"] === "SoftwareApplication");
    expect(app.operatingSystem).toBe("macOS, Windows, Linux, Web");
    expect(app.applicationCategory).toBe("DesignApplication");
    expect(app.offers.price).toBe("0");
    expect(app.softwareVersion).toBe(SITE.VERSION);
    expect(app.downloadUrl).toContain(SITE.REPO_URL);
  });

  test("FAQPage questions equal the FAQ module and the rendered <details>", () => {
    const html = page("/");
    const faq = ld(html).flatMap((b) => b["@graph"] ?? [b]).find((n) => n["@type"] === "FAQPage");
    const questions: string[] = faq.mainEntity.map((q: any) => q.name);
    expect(questions).toEqual(FAQ.map((f) => f.q));
    for (const q of faq.mainEntity) expect(q.acceptedAnswer.text.length).toBeGreaterThan(0);
    const summaries = [...html.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>/g)].map((m) => strip(m[1]));
    expect(summaries).toEqual(expect.arrayContaining(FAQ.map((f) => f.q)));
  });

  test("FAQ has at least 8 entries (awaits Task 4 content)", () => {
    expect(FAQ.length).toBeGreaterThanOrEqual(8);
  });

  test.each(DOCS.map((d) => d.slug))("docs %s has TechArticle + BreadcrumbList", (slug) => {
    const t = types(page(`/docs/${slug}/`));
    expect(t).toContain("TechArticle");
    expect(t).toContain("BreadcrumbList");
    expect(t.includes("HowTo")).toBe(slug.startsWith("install-"));
  });

  test("script-breaking characters are escaped", () => {
    for (const p of paths) {
      for (const m of page(p).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        expect(m[1]).not.toContain("<");
      }
    }
  });
});

describe("docs AEO", () => {
  test.each(DOCS.map((d) => d.slug))("%s shows a Last updated date and an answer-first lead", (slug) => {
    const html = page(`/docs/${slug}/`);
    expect(html).toMatch(/Last updated[\s\S]{0,80}\d{4}-\d{2}-\d{2}/);
    // first element of the article after the h1 is a paragraph (answer-first)
    expect(html).toMatch(/<h1[^>]*>[\s\S]*?<\/h1>\s*(<p>|<p [^>]*>)/);
  });
});

describe("crawler files", () => {
  test("sitemap.xml lists every route with lastmod", () => {
    const xml = readFileSync(dist("sitemap.xml"), "utf8");
    for (const p of paths) expect(xml).toContain(`<loc>${SITE.SITE_URL}${p}</loc>`);
    expect(xml.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)).toHaveLength(paths.length);
  });

  test("robots.txt references the sitemap and allows AI crawlers", () => {
    const txt = readFileSync(dist("robots.txt"), "utf8");
    expect(txt).toContain(`Sitemap: ${SITE.SITE_URL}/sitemap.xml`);
    expect(txt).toMatch(/User-agent: \*\s+Allow: \//);
    for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
      expect(txt).toMatch(new RegExp(`User-agent: ${bot}\\s+Allow: /`));
    }
  });

  test("llms.txt links every doc", () => {
    const txt = readFileSync(dist("llms.txt"), "utf8");
    expect(txt).toMatch(/^# Lumetrope/);
    for (const d of DOCS) expect(txt).toContain(`${SITE.SITE_URL}/docs/${d.slug}/`);
  });

  test("llms-full.txt contains every doc as Markdown", () => {
    const txt = readFileSync(dist("llms-full.txt"), "utf8");
    for (const d of DOCS) expect(txt).toContain(`${SITE.SITE_URL}/docs/${d.slug}/`);
    expect(txt).not.toMatch(/^import /m);
    expect(txt).not.toContain("<McpTools");
    expect(txt).not.toMatch(/\{MCP_TOOL_COUNT\}/);
  });

  test("OG images are copied to dist", () => {
    for (const f of ["default", "docs"]) expect(existsSync(dist(`og/${f}.png`))).toBe(true);
  });
});

describe("no-JS: server-rendered landing", () => {
  test("every section heading and nav link of the SSR landing is in the prerendered HTML", async () => {
    const { render } = await import(pathToFileURL(join(process.cwd(), "dist/server/entry-server.js")).href);
    const ssr: string = render("/").html;
    const html = page("/");
    const headings = [...ssr.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)].map((m) => strip(m[1]));
    expect(headings.length).toBeGreaterThan(0);
    const body = strip(html.replace(/<script[\s\S]*?<\/script>/g, ""));
    for (const h of headings) expect(body).toContain(h);
    const hrefs = [...ssr.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);
    for (const h of hrefs) expect(html).toContain(`href="${h}"`);
  });
});

describe("encodePng", () => {
  test("signature, IHDR size and zlib round trip", () => {
    const w = 7, h = 5;
    const rgba = new Uint8Array(w * h * 4).map((_, i) => (i * 37) % 256);
    const png = encodePng(rgba, w, h);
    expect([...png.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    const dv = new DataView(png.buffer, png.byteOffset);
    expect(dv.getUint32(16)).toBe(w);
    expect(dv.getUint32(20)).toBe(h);
    // collect IDAT payloads
    const idat: Uint8Array[] = [];
    for (let o = 8; o < png.length; ) {
      const len = dv.getUint32(o);
      const type = String.fromCharCode(...png.slice(o + 4, o + 8));
      if (type === "IDAT") idat.push(png.slice(o + 8, o + 8 + len));
      o += 12 + len;
    }
    const raw = inflateSync(Buffer.concat(idat));
    expect(raw.length).toBe(h * (1 + w * 4));
    for (let y = 0; y < h; y++) {
      expect(raw[y * (1 + w * 4)]).toBe(0);
      expect([...raw.subarray(y * (1 + w * 4) + 1, (y + 1) * (1 + w * 4))]).toEqual([...rgba.subarray(y * w * 4, (y + 1) * w * 4)]);
    }
  });

  test("shipped OG images are 1200x630 PNGs", () => {
    for (const f of ["default", "docs"]) {
      const b = readFileSync(join("public/og", `${f}.png`));
      expect(b.readUInt32BE(16)).toBe(1200);
      expect(b.readUInt32BE(20)).toBe(630);
    }
  });
});
