import { Header } from "../sections/Header";
import { Footer } from "../sections/Footer";

const link = "font-semibold text-cyan underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan";

/** Pre-rendered to dist/404.html (the host's 404 page) and shown for unknown client-side URLs. */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-0 text-text-0">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <h1 className="font-display text-5xl italic leading-tight">Page not found</h1>
        <p className="mt-5 text-lg text-text-1">That page does not exist or has moved. Try one of these instead.</p>
        <ul className="mt-6 space-y-2">
          <li><a href="/" className={link}>Back to the Lumetrope home page</a></li>
          <li><a href="/docs/" className={link}>Read the documentation</a></li>
        </ul>
      </main>
      <Footer />
    </div>
  );
}
