import { LottieStage } from "../player/LottieStage";
import media from "./media.json";
import { art } from "./art";
import { shotVariant } from "./shots";

const REEL = art("logo");
const video = media.video as { webm: string; mp4?: string; poster: string };

export function Recording() {
  return (
    <section id="tour" aria-labelledby="tour-h" className="scroll-mt-20 border-t border-bg-3/60 bg-bg-1">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex items-start justify-between gap-6 sm:items-end">
          <div className="max-w-xl">
            <h2 id="tour-h" className="font-display text-4xl italic leading-tight text-text-0 sm:text-5xl">Watch a project come together</h2>
            <p className="mt-3 text-text-1">
              From a blank canvas to an interactive dotLottie: drawing, keyframes, a state machine, preview and export,
              recorded in the real editor.
            </p>
          </div>
          <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
            <LottieStage decorative src={REEL.src} poster={REEL.poster} stateMachine="Logo" alt="" className="h-full w-full" />
          </div>
        </div>
        <div className="film mt-10">
          <video
            className="block aspect-[16/10] w-full bg-bg-0"
            controls
            preload="none"
            playsInline
            // A video poster loads eagerly and has no srcset: use the 1440 px variant.
            poster={shotVariant(video.poster, 1440)}
            width={1440}
            height={900}
            aria-label="Tour of the Lumetrope editor"
          >
            <source src={video.webm} type="video/webm" />
            {video.mp4 && <source src={video.mp4} type="video/mp4" />}
            Your browser cannot play this video. <a href={video.webm}>Download the tour (WebM)</a>.
          </video>
        </div>
      </div>
    </section>
  );
}
