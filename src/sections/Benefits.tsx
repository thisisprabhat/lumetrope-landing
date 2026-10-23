import { useEffect, useRef, useState } from "react";
import { LottieStage, type StageHandle } from "../player/LottieStage";
import { art } from "./art";

const ZOE = art("zoetrope");

const BENEFITS = [
  { title: "Free and open source", body: "MIT licensed, top to bottom. Read the code, fork it, build it yourself, ship it inside your own product." },
  { title: "Works offline, files stay on your machine", body: "The desktop app needs no connection, and your projects and history live on your device. No account, no uploads." },
  { title: "Interactive output that plays anywhere dotLottie does", body: "State machines and themes ship inside a standard .lottie file, ready for any player that supports dotLottie 2.0." },
  { title: "AI-ready", body: "Connect an agent over MCP and it can build layers, set keyframes and test state machines while you direct." },
];

/** Progress of the section's middle line through the section, 0..1. */
function progressOf(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  if (r.height <= 0) return 0;
  return Math.max(0, Math.min(1, (window.innerHeight / 2 - r.top) / r.height));
}

export function Benefits() {
  const sec = useRef<HTMLElement>(null);
  const zoe = useRef<StageHandle>(null);
  const [active, setActive] = useState(0);
  const last = useRef(0);

  useEffect(() => {
    let queued = false;
    const update = () => {
      queued = false;
      if (!sec.current) return;
      const p = Math.round(progressOf(sec.current) * 1000) / 1000;
      last.current = p;
      zoe.current?.setInput("progress", p);
      setActive(Math.min(BENEFITS.length - 1, Math.floor(p * BENEFITS.length)));
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={sec} id="benefits" aria-labelledby="benefits-h" className="scroll-mt-20 border-t border-bg-3/60 bg-bg-1">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="benefits-h" className="font-display text-4xl italic leading-tight text-text-0 sm:text-5xl">Why make it here</h2>
          <p className="mt-3 max-w-md text-text-1">
            Scroll to turn the drum. A zoetrope is how pictures first learned to move, and it is where the name comes from.
          </p>
          <div className="relative mt-8 aspect-[720/420] w-full">
            <LottieStage
              ref={zoe}
              src={ZOE.src}
              poster={ZOE.poster}
              stateMachine="Zoetrope"
              // The player may start after the last scroll event: re-apply progress once it reports a state.
              onState={() => zoe.current?.setInput("progress", last.current)}
              alt="A zoetrope that turns as you scroll. Click to spin it."
              className="h-full w-full"
            />
          </div>
        </div>
        <ol className="space-y-4 lg:space-y-0">
          {BENEFITS.map((b, k) => (
            <li key={b.title} className="lg:flex lg:min-h-[52vh] lg:items-center">
              <div className={`benefit border-l-2 py-2 pl-6 transition-colors duration-300 ${k === active ? "border-lume" : "border-bg-3"}`}>
                <h3 className={`font-display text-3xl italic leading-tight transition-colors duration-300 ${k === active ? "text-text-0" : "text-text-1"}`}>{b.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-text-1">{b.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
