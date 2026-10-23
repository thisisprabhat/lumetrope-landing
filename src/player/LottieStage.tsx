import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import type { LumetropePlayer } from "./LumetropePlayer";

export interface StageHandle {
  setInput(name: string, v: boolean | number | string): void;
  fire(name: string): void;
}

export interface LottieStageProps {
  src: string;
  stateMachine?: string;
  poster: string;
  alt: string;
  fit?: "contain" | "cover";
  className?: string;
  onState?: (s: string) => void;
  inputs?: Record<string, boolean | number | string>;
  /** LCP poster: eager high-priority image, engine starts right after first paint. */
  priority?: boolean;
  /** Purely visual: no tab stop, role or label; pointer input still works. */
  decorative?: boolean;
  ref?: Ref<StageHandle>;
}

const fill = { position: "absolute", inset: 0, width: "100%", height: "100%" } as const;

export function LottieStage({ src, stateMachine, poster, alt, fit = "contain", className, onState, inputs, priority, decorative, ref }: LottieStageProps) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const player = useRef<LumetropePlayer | null>(null);
  const onStateRef = useRef(onState);
  onStateRef.current = onState;
  const inputsRef = useRef(inputs);
  inputsRef.current = inputs;
  const visible = useRef(!!priority);
  const tapTimer = useRef(0);
  const start = useRef<(() => void) | null>(null);
  const [state, setState] = useState("");
  const [shown, setShown] = useState(false);

  useImperativeHandle(ref, () => ({
    setInput: (n, v) => player.current?.setInput(n, v),
    fire: (n) => player.current?.fire(n),
  }));

  // Lazy start: only once near the viewport (or on click under reduced motion).
  useEffect(() => {
    let cancelled = false;
    let loading = false;
    const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const load = () => {
      if (loading || cancelled) return;
      loading = true;
      import("./LumetropePlayer")
        .then(({ LumetropePlayer }) => LumetropePlayer.create(canvas.current!, { src, stateMachine, fit, onState: (s) => { setState(s); onStateRef.current?.(s); } }))
        .then((p) => {
          if (cancelled || !canvas.current) return p.destroy();
          player.current = p;
          for (const [k, v] of Object.entries(inputsRef.current ?? {})) p.setInput(k, v);
          if (!visible.current) p.pause();
          setShown(true);
        })
        .catch(() => {
          loading = false; // poster stays; WASM or fetch unavailable
        });
    };
    start.current = load;
    let io: IntersectionObserver | undefined;
    const onVisible = (v: boolean) => {
      visible.current = v;
      if (player.current) v ? player.current.play() : player.current.pause();
      else if (v && !reduced) load();
    };
    if (typeof IntersectionObserver === "function") {
      io = new IntersectionObserver((es) => onVisible(es[es.length - 1]?.isIntersecting ?? false), { rootMargin: "200px" });
      io.observe(root.current!);
    } else {
      const id = setTimeout(() => onVisible(true), 200);
      io = { disconnect: () => clearTimeout(id) } as IntersectionObserver;
    }
    let kick = 0;
    if (priority && !reduced) kick = window.setTimeout(() => requestAnimationFrame ? requestAnimationFrame(load) : load(), 0);
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => player.current?.resize()) : null;
    ro?.observe(root.current!);
    return () => {
      cancelled = true;
      clearTimeout(kick);
      setShown(false);
      setState("");
      io?.disconnect();
      ro?.disconnect();
      clearTimeout(tapTimer.current);
      player.current?.destroy();
      player.current = null;
      start.current = null;
    };
  }, [src, stateMachine, fit, priority]);

  useEffect(() => {
    for (const [k, v] of Object.entries(inputs ?? {})) player.current?.setInput(k, v);
  }, [inputs]);

  const hover = (v: boolean) => player.current?.setInput("hover", v);
  const ptr = (kind: "move" | "down" | "up" | "click" | "enter" | "exit") => (e: React.PointerEvent | React.MouseEvent) => player.current?.pointer(kind, e.clientX, e.clientY);
  const isTouch = (e: React.PointerEvent) => e.pointerType === "touch";

  return (
    <div
      ref={root}
      className={className}
      data-state={state}
      {...(decorative ? { "aria-hidden": true } : { tabIndex: 0, role: "button", "aria-label": alt })}
      style={{ position: "relative", overflow: "hidden" }}
      onFocus={() => hover(true)}
      onBlur={() => hover(false)}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (!player.current) return start.current?.();
        const r = root.current!.getBoundingClientRect();
        player.current.pointer("click", r.left + r.width / 2, r.top + r.height / 2);
      }}
      onPointerEnter={(e) => {
        if (isTouch(e)) return;
        hover(true);
        ptr("enter")(e);
      }}
      onPointerLeave={(e) => {
        if (isTouch(e)) return;
        hover(false);
        ptr("exit")(e);
      }}
      onPointerMove={ptr("move")}
      onPointerDown={(e) => {
        if (isTouch(e)) {
          hover(true);
          clearTimeout(tapTimer.current);
          tapTimer.current = window.setTimeout(() => hover(false), 1200);
        }
        ptr("down")(e);
      }}
      onPointerUp={ptr("up")}
      onClick={(e) => (player.current ? ptr("click")(e) : start.current?.())}
    >
      <img src={poster} alt="" loading={priority ? "eager" : "lazy"} {...(priority ? { fetchPriority: "high" as const } : {})} decoding="async" style={{ ...fill, objectFit: fit === "cover" ? "cover" : "contain", opacity: shown ? 0 : 1, transition: "opacity .3s" }} />
      <canvas ref={canvas} aria-hidden="true" style={{ ...fill, opacity: shown ? 1 : 0, transition: "opacity .3s" }} />
    </div>
  );
}
