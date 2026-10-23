import { useRef, type ReactNode } from "react";
import { LottieStage, type StageHandle } from "../player/LottieStage";
import { art } from "./art";
import { useHoverInput } from "./useHoverInput";

/**
 * Glyphs, drawn without a background so they sit straight on the button: `download` (dark ink,
 * for the amber primary button: arrow into a tray, ends in a check) and `open` (light, for the dark
 * ghost/nav buttons: arrow leaving a browser window).
 */
const GLYPH = { download: art("cta"), open: art("cta-open") } as const;

const VARIANT = {
  primary: "bg-lume text-bg-0 hover:brightness-110",
  ghost: "border border-text-2/60 text-text-0 hover:border-lume",
  nav: "border border-bg-3 bg-bg-1 text-sm text-text-0 hover:border-lume",
} as const;

/**
 * A link with a glyph-only player as a decorative chip. The label is real HTML text; hovering or
 * focusing the link sets the player's `hover`, clicking fires `press` (which plays on to `Done`).
 */
export function CtaLink({ href, children, variant = "primary", glyph = "download", onPress, className = "" }: {
  href: string; children: ReactNode; variant?: keyof typeof VARIANT; glyph?: keyof typeof GLYPH; onPress?: () => void; className?: string;
}) {
  const CTA = GLYPH[glyph];
  const stage = useRef<StageHandle>(null);
  const { inputs, handlers } = useHoverInput();
  const small = variant === "nav";
  return (
    <a
      href={href}
      className={`cta-link group inline-flex items-center whitespace-nowrap gap-1.5 rounded-full font-semibold transition-[filter,border-color,transform] duration-200 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan ${small ? "py-1.5 pl-4 pr-4 min-[400px]:pl-1.5" : "py-2 pl-2.5 pr-6 text-base"} ${VARIANT[variant]} ${className}`}
      {...handlers}
      onClick={() => { stage.current?.fire("press"); onPress?.(); }}
    >
      <span aria-hidden="true" className={`relative shrink-0 transition-transform duration-200 group-hover:scale-110 group-active:scale-95 ${small ? "hidden h-6 w-10 min-[400px]:block" : "h-8 w-[3.25rem]"}`}>
        <LottieStage ref={stage} decorative src={CTA.src} poster={CTA.poster} stateMachine="Cta" alt="" fit="contain" inputs={inputs} className="h-full w-full" />
      </span>
      <span>{children}</span>
    </a>
  );
}
