import { FAQ } from "../content/faq";
import { LottieStage } from "../player/LottieStage";
import { art } from "./art";

const ICON = art("icon-state-machines");

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-h" className="scroll-mt-20 border-t border-bg-3/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative h-14 w-14">
            <LottieStage decorative src={ICON.src} poster={ICON.poster} stateMachine="Icon" alt="" className="h-full w-full" />
          </div>
          <h2 id="faq-h" className="mt-6 font-display text-4xl italic leading-tight text-text-0 sm:text-5xl">Questions</h2>
          <p className="mt-3 max-w-xs text-text-1">
            More in the <a href="/docs/faq/" className="text-cyan underline-offset-4 hover:underline">docs FAQ</a> and the{" "}
            <a href="/docs/troubleshooting/" className="text-cyan underline-offset-4 hover:underline">troubleshooting guide</a>.
          </p>
        </div>
        <div className="border-t border-bg-3">
          {FAQ.map((f) => (
            <details key={f.q} className="faq group border-b border-bg-3">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-lg text-text-0 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span>
                <span aria-hidden="true" className="mt-1 font-mono text-sm text-lume transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">+</span>
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-text-1">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
