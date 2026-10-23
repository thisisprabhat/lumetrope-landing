import { useRef, type ReactNode } from "react";
import { LottieStage, type StageHandle } from "../player/LottieStage";
import { art } from "./art";
import { useHoverInput } from "./useHoverInput";

const CTA = art("cta");

const VARIANT = {
  primary: "bg-lume text-bg-0 hover:brightness-110",
  ghost: "border border-text-2/60 text-text-0 hover:border-lume",
  nav: "border border-bg-3 bg-bg-1 text-sm text-text-0 hover:border-lume",
} as const;

/**
 * A link with the glyph-only `cta.lottie` player as a decorative chip. The label is real HTML text;
 * hovering or focusing the link sets the player's `hover`, clicking fires `press` (which plays on to `Done`).
 */
export function CtaLink({ href, children, variant = "primary", onPress, className = "" }: {
  href: string; children: ReactNode; variant?: keyof typeof VARIANT; onPress?: () => void; className?: string;
}) {
  const stage = useRef<StageHandle>(null);
  const { inputs, handlers } = useHoverInput();
  const small = variant === "nav";
  return (
    <a
      href={href}
      className={`cta-link group inline-flex items-center whitespace-nowrap gap-3 rounded-full font-semibold transition-[filter,border-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan ${small ? "py-1.5 pl-4 pr-4 min-[400px]:py-1 min-[400px]:pl-1" : "py-1.5 pl-1.5 pr-6 text-base"} ${VARIANT[variant]} ${className}`}
      {...handlers}
      onClick={() => { stage.current?.fire("press"); onPress?.(); }}
    >
      <span aria-hidden="true" className={`relative shrink-0 overflow-hidden rounded-full bg-bg-0 ${small ? "hidden h-7 w-12 min-[400px]:block" : "h-10 w-16"}`}>
        <LottieStage ref={stage} decorative src={CTA.src} poster={CTA.poster} stateMachine="Cta" alt="" fit="cover" inputs={inputs} className="h-full w-full" />
      </span>
      <span>{children}</span>
    </a>
  );
}
