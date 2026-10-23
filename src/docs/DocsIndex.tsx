import { DOCS } from "./nav";
import { Header } from "../sections/Header";
import { Footer } from "../sections/Footer";

const GROUPS = [...new Set(DOCS.map((d) => d.group))];

/** /docs/: a plain list of every docs page, so it works without JavaScript. */
export default function DocsIndex() {
  return (
    <div className="min-h-screen bg-bg-0 text-text-0">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-5xl italic leading-tight">Lumetrope documentation</h1>
        <p className="mt-5 text-lg text-text-1">
          Guides for installing Lumetrope, animating, building state machines, exporting and connecting AI agents.
          New here? Start with <a className="text-cyan underline" href="/docs/getting-started/">Getting started</a>.
        </p>
        {GROUPS.map((g) => (
          <section key={g} aria-labelledby={`g-${g}`} className="mt-10">
            <h2 id={`g-${g}`} className="font-mono text-xs uppercase tracking-widest text-text-2">{g}</h2>
            <ul className="mt-3 space-y-4">
              {DOCS.filter((d) => d.group === g).map((d) => (
                <li key={d.slug}>
                  <a href={`/docs/${d.slug}/`} className="font-semibold text-text-0 hover:text-lume focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan">{d.title}</a>
                  <p className="text-sm text-text-1">{d.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
