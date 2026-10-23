import { useRef, useState } from "react";
import { LottieStage } from "../player/LottieStage";
import media from "./media.json";
import { art } from "./art";

const ICON = art("icon-timeline");
const SHOTS = media.shots;
const pad = (n: number) => String(n).padStart(2, "0");

export function Carousel() {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  const n = SHOTS.length;
  const go = (to: number) => setI(((to % n) + n) % n);

  return (
    <section
      id="screens"
      aria-roledescription="carousel"
      aria-labelledby="screens-h"
      className="scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 shrink-0">
              <LottieStage decorative src={ICON.src} poster={ICON.poster} stateMachine="Icon" alt="" className="h-full w-full" />
            </div>
            <h2 id="screens-h" className="font-display text-4xl italic leading-tight text-text-0 sm:text-5xl">Inside the editor</h2>
        </div>

        <div
          data-carousel-viewport
          tabIndex={0}
          aria-label="Screenshots. Use the left and right arrow keys to move between them."
          className="mt-10 touch-pan-y overflow-hidden rounded-lg outline-none ring-offset-4 ring-offset-bg-0 focus-visible:ring-2 focus-visible:ring-cyan"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
            else if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
            else if (e.key === "Home") { e.preventDefault(); go(0); }
            else if (e.key === "End") { e.preventDefault(); go(n - 1); }
          }}
          onPointerDown={(e) => { startX.current = e.clientX; }}
          onPointerUp={(e) => {
            if (startX.current == null) return;
            const dx = e.clientX - startX.current;
            startX.current = null;
            if (dx <= -40) go(i + 1);
            else if (dx >= 40) go(i - 1);
          }}
          onPointerCancel={() => { startX.current = null; }}
        >
          <div
            aria-live="polite"
            className="flex transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {SHOTS.map((s, k) => (
              <figure
                key={s.src}
                role="group"
                aria-roledescription="slide"
                aria-label={`${k + 1} of ${n}`}
                aria-hidden={k !== i}
                className="w-full shrink-0"
              >
                <div className="film">
                  <img
                    src={s.src}
                    alt={s.alt}
                    width={1440}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="block aspect-[16/10] w-full select-none bg-bg-1 object-cover"
                  />
                </div>
                <figcaption className="mt-4 flex gap-4 text-text-1">
                  <span className="font-mono text-sm text-lume">{pad(k + 1)}</span>
                  <span>{s.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <ol className="flex flex-wrap gap-1.5" aria-label="Choose a screenshot">
            {SHOTS.map((s, k) => (
              <li key={s.src}>
                <button
                  type="button"
                  aria-label={`Show screenshot ${k + 1}`}
                  aria-current={k === i ? "true" : undefined}
                  onClick={() => go(k)}
                  className={`frame-dot grid h-8 w-10 place-items-center rounded-sm border font-mono text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan ${k === i ? "border-lume text-lume" : "border-bg-3 text-text-2 hover:border-text-2 hover:text-text-1"}`}
                >
                  {pad(k + 1)}
                </button>
              </li>
            ))}
          </ol>
          <div className="flex shrink-0 gap-2">
            <ArrowButton dir={-1} onClick={() => go(i - 1)} />
            <ArrowButton dir={1} onClick={() => go(i + 1)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowButton({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir > 0 ? "Next screenshot" : "Previous screenshot"}
      className="grid h-11 w-11 place-items-center rounded-full border border-bg-3 text-text-1 transition-colors hover:border-lume hover:text-lume focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {dir > 0 ? <path d="M6 3l5 5-5 5" /> : <path d="M10 3L5 8l5 5" />}
      </svg>
    </button>
  );
}
