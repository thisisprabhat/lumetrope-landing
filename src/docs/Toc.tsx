export interface TocItem { id: string; text: string; level: 2 | 3 }

export default function Toc({ items }: { items: TocItem[] }) {
  if (!items.length) return null;
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-2">On this page</p>
      <ul className="space-y-1.5 border-l border-bg-3">
        {items.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-6" : "pl-3"}>
            <a href={`#${h.id}`} className="text-text-1 hover:text-lume">{h.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
