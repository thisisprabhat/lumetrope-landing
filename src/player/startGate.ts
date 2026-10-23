type Ric = (cb: () => void, o?: { timeout: number }) => number;
type Win = Pick<Window, "addEventListener" | "setTimeout"> & {
  document: Pick<Document, "readyState">;
  requestAnimationFrame?: (cb: FrameRequestCallback) => number;
  requestIdleCallback?: Ric;
};

/**
 * A once-only gate that resolves after the page has loaded and painted (two animation frames), and
 * then the main thread is idle (`requestIdleCallback`, 2 s timeout) or, where rIC is missing (Safari),
 * after one more task. That keeps the 2.6 MB WASM engine and the players clear of first paint and
 * LCP. It resolves at once only when the environment has no rAF at all.
 */
export function createAfterFirstPaint(w: Win | undefined = typeof window === "undefined" ? undefined : window): () => Promise<void> {
  let gate: Promise<void> | null = null;
  return () =>
    (gate ??= new Promise<void>((res) => {
      const raf = w?.requestAnimationFrame?.bind(w);
      if (!w || !raf) return res();
      const ric = w.requestIdleCallback?.bind(w);
      const idle = () => (ric ? ric(() => res(), { timeout: 2000 }) : w.setTimeout(res, 0));
      const go = () => raf(() => raf(idle));
      if (w.document.readyState === "complete") go();
      else w.addEventListener("load", go, { once: true });
    }));
}

/** The page's shared gate (tests replace this module with an immediate one; see tests/setup.ts). */
export const afterFirstPaint = createAfterFirstPaint();
