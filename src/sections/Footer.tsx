import { SITE } from "../config/site";

const link = "text-text-1 underline-offset-4 hover:text-text-0 hover:underline focus-visible:underline";

export function Footer() {
  return (
    <footer className="border-t border-bg-3 bg-bg-0">
      <div className="film-edge" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto]">
        <div className="max-w-md">
          <p className="font-display text-3xl italic text-text-0">Lumetrope</p>
          <p className="mt-3 text-sm leading-relaxed text-text-2">
            An independent, open-source editor for the open Lottie and dotLottie formats.
          </p>
          <p className="mt-6 text-xs leading-relaxed text-text-2">
            This site is set in Instrument Sans, Instrument Serif and Martian Mono, used under the{" "}
            <a href="https://openfontlicense.org" className={link}>SIL Open Font License 1.1</a>. The app bundles
            Poppins under the same licence.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
            <li><a href="/docs/getting-started/" className={link}>Docs</a></li>
            <li><a href={SITE.REPO_URL} className={link}>GitHub</a></li>
            <li><a href={`${SITE.REPO_URL}/blob/main/LICENSE`} className={link}>MIT licence</a></li>
            <li><a href={`${SITE.REPO_URL}/releases/latest`} className={link}>Releases</a></li>
            <li><a href="/docs/mcp/" className={link}>MCP guide</a></li>
            <li><a href={SITE.WEB_APP_URL} className={link}>Web app</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
