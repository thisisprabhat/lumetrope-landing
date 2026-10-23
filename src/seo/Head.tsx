import { jsonLdFor, serializeLd } from "./jsonld";
import { THEME_COLOR, esc, pageMeta } from "./meta";

/** Head markup for a route (title, description, canonical, OG/Twitter, theme-color, JSON-LD). */
export function renderHead(path: string): string {
  const m = pageMeta(path);
  if (!m) return "";
  const t = esc(m.title);
  const dsc = esc(m.description);
  const parts = [
    `<title>${t}</title>`,
    `<meta name="description" content="${dsc}" />`,
    `<link rel="canonical" href="${esc(m.canonical)}" />`,
    `<meta name="theme-color" content="${THEME_COLOR}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Lumetrope" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${dsc}" />`,
    `<meta property="og:url" content="${esc(m.canonical)}" />`,
    `<meta property="og:image" content="${esc(m.image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${dsc}" />`,
    `<meta name="twitter:image" content="${esc(m.image)}" />`,
  ];
  const ld = jsonLdFor(path);
  if (ld) parts.push(`<script type="application/ld+json">${serializeLd(ld)}</script>`);
  return parts.join("");
}
