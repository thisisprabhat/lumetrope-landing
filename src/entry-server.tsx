import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { ROUTES } from "./routes";

export function render(url: string): { html: string; head: string } {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
  const meta = ROUTES.find((r) => r.path === url)?.meta;
  const head = meta
    ? `<title>${esc(meta.title)}</title><meta name="description" content="${esc(meta.description)}" />`
    : "";
  return { html, head };
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export const ROUTE_PATHS = ROUTES.map((r) => r.path);
