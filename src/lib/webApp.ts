import { SITE } from "../config/site";

/**
 * Web app fallback: every web-app link points at SITE.WEB_APP_URL. The first time someone shows
 * intent (hovers, focuses or touches such a link) we probe that host once; if it can't be reached
 * (DNS or network error) every web-app link is rewritten to SITE.WEB_APP_FALLBACK_URL, keeping
 * the path. A `no-cors` HEAD resolves for any HTTP answer and only rejects when the host is down.
 * Nothing is fetched on page load, so it costs nothing for visitors who never open the app.
 */
export function installWebAppFallback(
  doc: Document = document,
  probe: (url: string) => Promise<unknown> = (url) => fetch(url, { method: "HEAD", mode: "no-cors", cache: "no-store" }),
): () => void {
  const primary = SITE.WEB_APP_URL;
  const fallback = SITE.WEB_APP_FALLBACK_URL;
  let checked: Promise<void> | null = null;
  const sel = `a[href^="${primary}"]`;
  const onIntent = (e: Event) => {
    if (checked || !(e.target instanceof Element) || !e.target.closest(sel)) return;
    checked = probe(primary).then(
      () => undefined,
      () => {
        for (const a of doc.querySelectorAll<HTMLAnchorElement>(sel)) a.href = fallback + a.getAttribute("href")!.slice(primary.length);
      },
    );
  };
  const types = ["pointerover", "focusin", "touchstart"] as const;
  for (const t of types) doc.addEventListener(t, onIntent, { passive: true, capture: true });
  return () => { for (const t of types) doc.removeEventListener(t, onIntent, { capture: true }); };
}
