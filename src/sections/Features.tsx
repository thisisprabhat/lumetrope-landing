import { LottieStage } from "../player/LottieStage";
import { art } from "./art";
import { useHoverInput } from "./useHoverInput";

type Feature = { icon: string; title: string; body: string; href?: string; more?: string };

export const FEATURES: Feature[] = [
  { icon: "timeline", title: "Keyframes on a real timeline", body: "Keyframe any property, shape the motion with a curve easing editor and presets, and mark named segments you can play or trigger later." },
  { icon: "state-machines", title: "State machines you can see", body: "Wire states, transitions, guards and inputs on a node graph, then click and hover the live preview to test them for real." },
  { icon: "mcp", title: "MCP for AI agents", body: "More than 100 tools let Claude Code, Codex, Cursor and other MCP clients read your scene and edit it with you.", href: "/docs/mcp/", more: "Set up MCP" },
  { icon: "wasm-engine", title: "Its own WASM engine and GPU canvas", body: "A Rust engine compiled to WebAssembly evaluates, renders and runs state machines, drawing to the canvas through the GPU. This page runs on it." },
  { icon: "version-history", title: "Local version history", body: "Save versions, restore any of them, branch and diff. Autosave keeps every version on your device, with no server involved." },
  { icon: "export", title: "GIF, WebP and WebM with alpha", body: "Export transparent GIF, lossless WebP or WebM with an alpha channel, at the size, frame rate and segment you choose." },
  { icon: "desktop", title: "macOS, Windows, Linux and the web", body: "Native desktop apps for all three systems, and the same editor in any modern browser with nothing to install." },
  { icon: "themes", title: "Themes and slots", body: "Turn colours and other values into slots, group them into themes, and swap them at runtime in the exported dotLottie." },
];

function Card({ f }: { f: Feature }) {
  const { hover, inputs, handlers } = useHoverInput();
  const a = art(`icon-${f.icon}`);
  const inner = (
    <>
      <div className="relative h-14 w-14">
        <LottieStage decorative src={a.src} poster={a.poster} stateMachine="Icon" alt="" inputs={inputs} className="h-full w-full" />
      </div>
      <h3 className="mt-6 text-lg font-semibold leading-snug text-text-0">{f.title}</h3>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-text-1">{f.body}</p>
      {f.more && <p className="mt-4 text-sm font-semibold text-cyan group-hover:underline">{f.more}</p>}
    </>
  );
  return (
    <li
      className="feature relative bg-bg-0 p-6 outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan sm:p-7"
      data-hover={hover || undefined}
      // Cards without a link are focusable themselves so keyboard users can wake the icon too.
      tabIndex={f.href ? undefined : 0}
      {...handlers}
    >
      {f.href ? (
        <a href={f.href} className="group block rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-cyan">{inner}</a>
      ) : inner}
    </li>
  );
}

export function Features() {
  return (
    <section id="features" aria-labelledby="features-h" className="scroll-mt-20 border-t border-bg-3/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 id="features-h" className="max-w-2xl font-display text-4xl italic leading-tight text-text-0 sm:text-5xl">
          Everything between the first keyframe and the last click
        </h2>
        <p className="mt-4 max-w-xl text-text-1">
          Draw, animate, make it interactive and ship it, in one editor. Hover a frame to wake its icon.
        </p>
        <div className="contact mt-12">
          <ul className="grid gap-px bg-bg-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => <Card key={f.icon} f={f} />)}
          </ul>
        </div>
      </div>
    </section>
  );
}
