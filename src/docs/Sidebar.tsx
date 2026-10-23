import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DOCS } from "./nav";
import { HEADINGS } from "./headings";

const GROUPS = [...new Set(DOCS.map((d) => d.group))];

export default function Sidebar({ current }: { current: string }) {
  const [q, setQ] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const needle = q.trim().toLowerCase();
  const visible = (d: (typeof DOCS)[number]) =>
    !needle ||
    d.title.toLowerCase().includes(needle) ||
    (HEADINGS[d.file] ?? []).some((h) => h.toLowerCase().includes(needle));

  return (
    <div className="text-sm">
      {ready && (
        <input
          type="search"
          role="searchbox"
          aria-label="Search the docs"
          placeholder="Search docs"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mb-4 w-full rounded-md border border-bg-3 bg-bg-2 px-3 py-2 text-text-0 placeholder:text-text-2 focus:border-lume focus:outline-none"
        />
      )}
      <nav aria-label="Docs">
        {GROUPS.map((g) => {
          const items = DOCS.filter((d) => d.group === g && visible(d));
          if (!items.length) return null;
          return (
            <div key={g} className="mb-5">
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-text-2">{g}</p>
              <ul>
                {items.map((d) => (
                  <li key={d.slug}>
                    <Link
                      to={`/docs/${d.slug}/`}
                      aria-current={d.slug === current ? "page" : undefined}
                      className={`block rounded px-2 py-1 ${d.slug === current ? "bg-bg-3 text-lume" : "text-text-1 hover:text-text-0"}`}
                    >
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {needle && !DOCS.some(visible) && <p className="text-text-2">No matching pages.</p>}
      </nav>
    </div>
  );
}
