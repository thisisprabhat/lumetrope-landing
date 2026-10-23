import { useState } from "react";
import { LottieStage } from "../../player/LottieStage";

export default function Explainer() {
  const [state, setState] = useState("");
  return (
    <figure data-explainer className="my-6">
      <div className="relative aspect-[4/3] w-full max-w-md">
        <LottieStage
          src="/animations/sm-explainer.lottie"
          stateMachine="Explainer"
          poster="/posters/sm-explainer.webp"
          alt="Interactive state machine explainer: click to move between states"
          onState={setState}
        />
      </div>
      <figcaption className="mt-2 text-sm">
        Click or tap the animation, or focus it and press Enter, and watch the current state change.
        <span aria-live="polite" className="ml-2 font-medium">Current state: {state || "loading"}</span>
      </figcaption>
    </figure>
  );
}
