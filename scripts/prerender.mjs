import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const dist = resolve("dist");
const template = readFileSync(join(dist, "index.html"), "utf8");
const { render, ROUTE_PATHS: paths, SITE, DOCS } = await import(pathToFileURL(join(dist, "server", "entry-server.js")).href);

const pages = new Map();
for (const path of paths) {
  const { html, head } = render(path);
  const out = template.replace("<!--head-->", () => head).replace("<!--app-->", () => html);
  const file = join(dist, path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out);
  pages.set(path, out);
  console.log("prerendered", path);
}

// ---- crawler files ---------------------------------------------------------
const site = SITE.SITE_URL;
const lastmod = new Date().toISOString().slice(0, 10);
const write = (name, body) => writeFileSync(join(dist, name), body);
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

const docPaths = paths.filter((p) => p.startsWith("/docs/"));
const docInfo = docPaths.map((p) => {
  const html = pages.get(p);
  return {
    path: p,
    slug: p.split("/")[2],
    title: decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]+>/g, "")),
    description: decode(html.match(/<meta name="description" content="([^"]*)"/)[1]),
    updated: html.match(/<time datetime="([^"]+)"/)?.[1] ?? lastmod,
  };
});
const updated = new Map(docInfo.map((d) => [d.path, d.updated]));

write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((p) => `  <url><loc>${site}${p}</loc><lastmod>${updated.get(p) ?? lastmod}</lastmod></url>\n`).join("") +
    `</urlset>\n`,
);

const bots = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];
write(
  "robots.txt",
  ["User-agent: *\nAllow: /", ...bots.map((b) => `User-agent: ${b}\nAllow: /`)].join("\n\n") + `\n\nSitemap: ${site}/sitemap.xml\n`,
);

const landing = decode(pages.get("/").match(/<meta name="description" content="([^"]*)"/)[1]);
const groups = new Map();
for (const d of DOCS) {
  const info = docInfo.find((x) => x.slug === d.slug);
  if (!groups.has(d.group)) groups.set(d.group, []);
  groups.get(d.group).push(`- [${d.title}](${site}/docs/${d.slug}/): ${info.description}`);
}
write(
  "llms.txt",
  `# Lumetrope\n\n> ${landing}\n\nLumetrope is open source (${SITE.REPO_URL}). Web app: ${SITE.WEB_APP_URL}. Full documentation in one file: ${site}/llms-full.txt\n\n` +
    [...groups].map(([g, items]) => `## ${g}\n\n${items.join("\n")}\n`).join("\n"),
);

// llms-full.txt: every doc as Markdown, from the MDX sources (components dropped).
const toolCount = pages.get("/docs/mcp/").match(/exposes (?:<!-- -->)?(\d+)(?:<!-- -->)? tools/)?.[1] ?? "";
const md = (slug) =>
  readFileSync(join("src/docs/pages", `${slug}.mdx`), "utf8")
    .replace(/^---[\s\S]*?---\n/, "")
    .replace(/^import .*\n/gm, "")
    .replace(/^<([A-Z]\w*) \/>\s*$/gm, (_, c) => (c === "McpTools" ? `The full tool list is at ${site}/docs/mcp/.` : ""))
    .replace(/\{MCP_TOOL_COUNT\}/g, toolCount)
    .replace(/\]\((\/[^)]*)\)/g, (_, u) => `](${site}${u})`)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
write(
  "llms-full.txt",
  `# Lumetrope documentation\n\n> ${landing}\n\n` +
    DOCS.map((d) => `Source: ${site}/docs/${d.slug}/\n\n${md(d.file)}\n`).join("\n---\n\n"),
);
console.log("wrote sitemap.xml robots.txt llms.txt llms-full.txt");
