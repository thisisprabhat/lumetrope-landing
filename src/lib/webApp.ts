import { SITE } from "../config/site";

export type Probe = (url: string, signal: AbortSignal) => Promise<unknown>;

const defaultProbe: Probe = (url, signal) => fetch(url, { method: "HEAD", mode: "no-cors", cache: "no-store", signal });
const defaultTimeout = (ms: number) => AbortSignal.timeout(ms);

/**
 * Web app fallback. Every web-app link points at SITE.WEB_APP_URL. The host is probed once, the
 * first time someone shows intent (hover, focus or touch) or activates such a link. A `no-cors`
 * HEAD resolves for any HTTP answer and rejects on a DNS or network error. It is bounded by
 * `timeoutMs`, so a black-holed host also counts as down.
 *
 * - If the host is down, every web-app link is rewritten to SITE.WEB_APP_FALLBACK_URL (keeping the
 *   path), which also covers middle-clicks and "open in new tab" afterwards.
 * - A plain left click (or Enter) while the probe is still pending is held: we preventDefault,
 *   await the probe and then navigate to whichever host is up. Modified and middle clicks are left
 *   alone.
 *
 * Nothing is fetched on page load.
 */
export function installWebAppFallback(
  doc: Document = document,
  { probe = defaultProbe, timeoutMs = 2500, timeout = defaultTimeout, navigate = (url: string) => doc.defaultView!.location.assign(url) }: {
    probe?: Probe; timeoutMs?: number; timeout?: (ms: number) => AbortSignal; navigate?: (url: string) => void;
  } = {},
): () => void {
  const primary = SITE.WEB_APP_URL;
  const fallback = SITE.WEB_APP_FALLBACK_URL;
  const sel = `a[href^="${primary}"]`;
  let up: boolean | null = null;
  let checked: Promise<boolean> | null = null;

  const rewrite = () => {
    for (const a of doc.querySelectorAll<HTMLAnchorElement>(sel)) a.href = fallback + a.getAttribute("href")!.slice(primary.length);
  };
  const check = () =>
    (checked ??= probe(primary, timeout(timeoutMs)).then(
      () => (up = true),
      () => {
        up = false;
        rewrite();
        return false;
      },
    ));
  const link = (e: Event) => (e.target instanceof Element ? e.target.closest<HTMLAnchorElement>(sel) : null);

  const onIntent = (e: Event) => { if (link(e)) void check(); };
  const onClick = (e: MouseEvent) => {
    const a = link(e);
    if (!a) return;
    if (up === false) {
      // The probe failed before this link existed, so rewrite() never saw it.
      const href = a.getAttribute("href")!;
      const to = fallback + href.slice(primary.length);
      const plain = !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && (!a.target || a.target === "_self");
      if (plain) { e.preventDefault(); navigate(to); } else a.href = to;
      return;
    }
    if (up !== null) return; // settled and up: the href is already the right one
    const plain = !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && (!a.target || a.target === "_self");
    if (!plain) { void check(); return; }
    e.preventDefault();
    const href = a.getAttribute("href")!;
    void check().then((ok) => navigate(ok ? href : fallback + href.slice(primary.length)));
  };

  const intents = ["pointerover", "focusin", "touchstart"] as const;
  for (const t of intents) doc.addEventListener(t, onIntent, { passive: true, capture: true });
  doc.addEventListener("click", onClick, { capture: true });
  return () => {
    for (const t of intents) doc.removeEventListener(t, onIntent, { capture: true });
    doc.removeEventListener("click", onClick, { capture: true });
  };
}
