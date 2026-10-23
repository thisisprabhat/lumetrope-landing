import { SITE } from "../config/site";
import { LottieStage } from "../player/LottieStage";
import { CtaLink } from "./CtaLink";
import { art } from "./art";
import { useHoverInput } from "./useHoverInput";

const LOGO = art("logo");
const link = "rounded px-2 py-1 text-sm text-text-1 transition-colors hover:text-text-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan";

export function Header() {
  const { inputs, handlers } = useHoverInput();
  return (
    <header className="sticky top-0 z-30 border-b border-bg-3/80 bg-bg-0/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
          {...handlers}
        >
          <span className="relative block h-8 w-8 shrink-0">
            <LottieStage decorative src={LOGO.src} poster={LOGO.poster} stateMachine="Logo" alt="" inputs={inputs} className="h-full w-full" />
          </span>
          <span className="font-display text-2xl italic leading-none text-text-0">Lumetrope</span>
        </a>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-3">
          <a href="/#features" className={`${link} hidden md:inline`}>Features</a>
          <a href="/#download" className={`${link} hidden md:inline`}>Download</a>
          <a href="/docs/getting-started/" className={link}>Docs</a>
          <CtaLink href={SITE.WEB_APP_URL} variant="nav" glyph="open" className="ml-1">Open web app</CtaLink>
        </nav>
      </div>
    </header>
  );
}
