import { createContext, useContext, useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { MDXProvider } from "@mdx-js/react";
import { Link } from "react-router-dom";
import { DOCS } from "./nav";
import Sidebar from "./Sidebar";
import Toc, { type TocItem } from "./Toc";
import { Header } from "../sections/Header";
import { Footer } from "../sections/Footer";
import { DOCS_UPDATED } from "../seo/meta";
import "./docs.css";

const Collector = createContext<TocItem[] | null>(null);

function textOf(n: ReactNode): string {
  if (n == null || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  if (Array.isArray(n)) return n.map(textOf).join("");
  if (typeof n === "object" && "props" in n) return textOf((n.props as { children?: ReactNode }).children);
  return "";
}

function heading(level: 2 | 3) {
  const Tag = `h${level}` as const;
  return function Heading(props: ComponentPropsWithoutRef<"h2">) {
    const items = useContext(Collector);
    if (items && props.id && !items.some((i) => i.id === props.id)) {
      items.push({ id: props.id, text: textOf(props.children), level });
    }
    return <Tag {...props} />;
  };
}

const components = { h2: heading(2), h3: heading(3) };

export default function DocsLayout({ slug, children }: { slug: string; children: ReactNode }) {
  // Headings register while the article renders; <Toc> sits after it in tree order so it sees them
  // in a single pass (works for SSR and hydration alike).
  const items: TocItem[] = [];
  const i = DOCS.findIndex((d) => d.slug === slug);
  const prev = DOCS[i - 1];
  const next = DOCS[i + 1];
  const menu = useRef<HTMLDetailsElement>(null);
  // Server HTML ships the menu closed (a tap opens it, even without JS) so that phones don't get a
  // layout shift when it would otherwise collapse after hydration. Wide screens open it here; it
  // lives in its own grid column there, so opening it moves nothing else.
  useEffect(() => {
    if (menu.current) menu.current.open = !!window.matchMedia?.("(min-width: 1024px)").matches;
  }, [slug]);

  return (
    <div className="min-h-screen bg-bg-0 text-text-0">
      <Header />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_14rem]">
        <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
          <details ref={menu} className="[&>summary]:cursor-pointer lg:[&[open]>summary]:hidden">
            <summary className="mb-3 rounded border border-bg-3 px-3 py-2 text-sm text-text-1">Docs menu</summary>
            <Sidebar current={slug} />
          </details>
        </aside>
        <main className="min-w-0">
          <MDXProvider components={components}>
            <Collector.Provider value={items}>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-2">Last updated: <time dateTime={DOCS_UPDATED}>{DOCS_UPDATED}</time></p>
              <article className="docs-prose max-w-3xl">{children}</article>
            </Collector.Provider>
          </MDXProvider>
          <nav aria-label="Previous and next" className="mt-12 flex max-w-3xl justify-between gap-4 border-t border-bg-3 pt-6 text-sm">
            {prev ? (
              <Link to={`/docs/${prev.slug}/`} rel="prev" className="text-text-1 hover:text-lume">
                <span className="block font-mono text-[11px] uppercase tracking-widest text-text-2">Previous</span>
                {prev.title}
              </Link>
            ) : <span />}
            {next ? (
              <Link to={`/docs/${next.slug}/`} rel="next" className="text-right text-text-1 hover:text-lume">
                <span className="block font-mono text-[11px] uppercase tracking-widest text-text-2">Next</span>
                {next.title}
              </Link>
            ) : <span />}
          </nav>
        </main>
        <aside className="hidden xl:sticky xl:top-20 xl:block xl:self-start">
          <Toc items={items} />
        </aside>
      </div>
      <Footer />
    </div>
  );
}
