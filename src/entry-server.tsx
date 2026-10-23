import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { ROUTES } from "./routes";
import { renderHead, renderNotFoundHead } from "./seo/Head";

export function render(url: string): { html: string; head: string } {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
  return { html, head: renderHead(url) };
}

/** The host's 404 page. Any unknown URL renders NotFound, so the location only has to be unmatched. */
export function renderNotFound(): { html: string; head: string } {
  const html = renderToString(
    <StaticRouter location="/404.html">
      <App />
    </StaticRouter>,
  );
  return { html, head: renderNotFoundHead() };
}

export const ROUTE_PATHS = ROUTES.map((r) => r.path);

// Consumed by scripts/prerender.mjs for sitemap / robots / llms files.
export { SITE } from "./config/site";
export { DOCS } from "./docs/nav";
export { installStatus } from "./content/availability";
