import { useEffect, useRef } from "react";
import { SITE, primaryDownload, primaryLabel, publishedDownloads } from "../config/site";
import { bus } from "../lib/bus";
import { usePlatform } from "../lib/usePlatform";
import { LottieStage, type StageHandle } from "../player/LottieStage";
import { CtaLink } from "./CtaLink";
import { art } from "./art";

const LUMI = art("lumi");
const SLEEP_MS = 12_000;

/** Wire Lumi to the page: pointer x → `look`, 12 s without input → `sleepy`, bus `download` → `cheer`. */
function useLumi(stage: React.RefObject<StageHandle | null>) {
  useEffect(() => {
    let x = 0;
    let queued = false;
    let sleeping = false;
    let timer = 0;
    const doze = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => { sleeping = true; stage.current?.setInput("sleepy", true); }, SLEEP_MS);
    };
    const wake = () => {
      if (sleeping) { sleeping = false; stage.current?.setInput("sleepy", false); }
      doze();
    };
    const move = (e: PointerEvent) => {
      wake();
      const w = window.innerWidth || 1;
      x = Math.round(Math.max(-1, Math.min(1, (e.clientX / w) * 2 - 1)) * 100) / 100;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; stage.current?.setInput("look", x); });
    };
    const opts = { passive: true } as const;
    const other = ["pointerdown", "keydown", "scroll", "wheel", "touchstart"] as const;
    window.addEventListener("pointermove", move, opts);
    for (const t of other) window.addEventListener(t, wake, opts);
    const off = bus.on("download", () => stage.current?.fire("cheer"));
    doze();
    return () => {
      clearTimeout(timer);
      off();
      window.removeEventListener("pointermove", move);
      for (const t of other) window.removeEventListener(t, wake);
    };
  }, [stage]);
}

export function Hero() {
  const lumi = useRef<StageHandle>(null);
  useLumi(lumi);
  // Same detection (UA, then client hints) and the same release data as the downloads section.
  const plat = usePlatform();
  const primary = plat ? primaryDownload(plat, publishedDownloads()) : null;
  const label = primary ? primaryLabel(primary) : "Download for desktop";

  return (
    <section id="top" aria-labelledby="hero-h" className="hero relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:pb-24 md:pt-20">
        <div>
          <h1 id="hero-h" className="font-display text-[clamp(2.9rem,9vw,6.25rem)] italic leading-[0.94] tracking-[-0.01em] text-text-0">
            Make Lottie animations that respond.
          </h1>
          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-text-1">
            Lumetrope is a free, open-source editor for Lottie and dotLottie. Animate on a real timeline, wire up
            state machines that react to clicks and hovers, and let AI agents work alongside you over MCP, on the
            desktop or in your browser.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <CtaLink href="#download" onPress={() => bus.emit("download")} className="min-w-[15.5rem]">{label}</CtaLink>
            <CtaLink href={SITE.WEB_APP_URL} variant="ghost" glyph="open">Open the web app</CtaLink>
          </div>
          <p className="mt-5 text-sm text-text-2">
            MIT licensed. For macOS, Windows and Linux, and any modern browser.
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-[22rem] md:max-w-none">
          <div className="drum relative aspect-square w-full">
            <div className="absolute inset-[13%]">
              <LottieStage
                ref={lumi}
                priority
                src={LUMI.src}
                poster={LUMI.poster}
                stateMachine="Lumi"
                alt="Lumi, the Lumetrope mascot. Click to make Lumi jump."
                className="h-full w-full rounded-full"
              />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-text-2">
            Lumi is a dotLottie state machine. Move your pointer, hover or click.
          </p>
        </div>
      </div>
    </section>
  );
}
