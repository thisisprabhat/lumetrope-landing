import { SITE } from "../config/site";
import { DOCS } from "../docs/nav";

/** Date shown as "Last updated" on docs pages and used as sitemap lastmod (bump when docs change). */
export const DOCS_UPDATED = "2026-10-23";

export const THEME_COLOR = "#0b0c0e";

export const LANDING_META = {
  title: "Lumetrope: Lottie animation editor with state machines",
  description:
    "Lumetrope is a free, open-source Lottie and dotLottie animation editor for desktop and web, with state machines, a WASM engine and an MCP server for AI agents.",
};

export const DOCS_INDEX_META = {
  title: "Lumetrope documentation",
  description:
    "All Lumetrope guides in one place: install the app, animate with keyframes, build state machines, export Lottie and dotLottie, and connect AI agents over MCP.",
};

export function docsMeta(d: (typeof DOCS)[number]) {
  return { title: `${d.title} | Lumetrope Docs`, description: d.description };
}

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  canonical: string;
  image: string;
}

export function pageMeta(path: string): PageMeta | null {
  const base = { path, canonical: `${SITE.SITE_URL}${path}` };
  if (path === "/") return { ...base, ...LANDING_META, image: `${SITE.SITE_URL}/og/default.png` };
  if (path === "/docs/") return { ...base, ...DOCS_INDEX_META, image: `${SITE.SITE_URL}/og/docs.png` };
  const d = DOCS.find((x) => `/docs/${x.slug}/` === path);
  return d ? { ...base, ...docsMeta(d), image: `${SITE.SITE_URL}/og/docs.png` } : null;
}

/** Head for the pre-rendered 404 page: not indexable, no canonical. */
export const NOT_FOUND_META = { title: "Page not found | Lumetrope", description: "This page does not exist. Go back to the Lumetrope home page or the documentation." };

/** HTML-escape for text and attribute values. */
export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");
}
