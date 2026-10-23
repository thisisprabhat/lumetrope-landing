import { createEngine, initEngine, type Engine } from "../engine/engine";
import { CanvasRenderer } from "../engine/vendor/CanvasRenderer";
import { fitRect, toComp, type Fit } from "./geometry";

export type PointerKind = "move" | "down" | "up" | "click" | "enter" | "exit";
export interface PlayerOptions {
  src: string;
  /** State machine id or name; defaults to the first one in the file. */
  stateMachine?: string;
  fit?: "contain" | "cover";
  onState?: (s: string) => void;
}

interface Snapshot {
  state: string;
  frame: number;
}

// One shared engine init for every player on the page.
let ready: Promise<void> | null = null;
function ensureEngine(): Promise<void> {
  if (!ready) {
    ready = initEngine();
    ready.catch(() => {
      ready = null;
    });
  }
  return ready;
}

export class LumetropePlayer {
  private engine: Engine;
  private renderer = new CanvasRenderer();
  private ctx: CanvasRenderingContext2D | null;
  private info: { w: number; h: number };
  private fit: Fit = { scale: 1, x: 0, y: 0, w: 0, h: 0 };
  private raf = 0;
  private last = 0;
  private frame = 0;
  private paused = false;
  private destroyed = false;
  private _state: string | null = null;
  private onVis = () => this.schedule();

  private constructor(
    private canvas: HTMLCanvasElement,
    private o: PlayerOptions,
    engine: Engine,
  ) {
    this.engine = engine;
    this.ctx = canvas.getContext("2d");
    this.info = JSON.parse(engine.info());
  }

  static async create(canvas: HTMLCanvasElement, o: PlayerOptions): Promise<LumetropePlayer> {
    const [, res] = await Promise.all([ensureEngine(), fetch(o.src)]);
    if (!res.ok) throw new Error(`Failed to fetch ${o.src}: ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    const engine = createEngine();
    engine.load_file(o.src.split("/").pop()?.split("?")[0] || "anim.lottie", bytes);
    const p = new LumetropePlayer(canvas, o, engine);
    p.start();
    return p;
  }

  get state(): string | null {
    return this._state;
  }

  private start(): void {
    const projects = (JSON.parse(this.engine.project_json()).stateMachines ?? {}) as Record<string, { lmeta?: { name?: string } }>;
    const ids = Object.keys(projects);
    const want = this.o.stateMachine;
    const id = (want && ids.find((k) => k === want || projects[k]?.lmeta?.name === want)) || ids[0];
    if (id) {
      this.apply(this.engine.sm_start(id));
    }
    this.renderer.setImages(JSON.parse(this.engine.image_assets()));
    this.resize();
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", this.onVis);
    this.schedule();
  }

  private apply(json: string): void {
    const s = JSON.parse(json) as Snapshot | null;
    if (!s) return;
    this.frame = s.frame;
    if (s.state !== this._state) {
      this._state = s.state;
      this.o.onState?.(s.state);
    }
  }

  private safe(fn: () => string): void {
    if (this.destroyed) return;
    try {
      this.apply(fn());
    } catch {
      /* machine stopped or unknown input */
    }
    this.draw();
  }

  setInput(name: string, v: boolean | number | string): void {
    this.safe(() => this.engine.sm_set_input(name, JSON.stringify(v)));
  }

  fire(name: string): void {
    this.safe(() => this.engine.sm_set_input(name, "null"));
  }

  pointer(kind: PointerKind, clientX: number, clientY: number): void {
    const [x, y] = toComp(clientX, clientY, this.canvas.getBoundingClientRect(), this.fit);
    this.safe(() => this.engine.sm_pointer(kind, x, y));
  }

  play(): void {
    this.paused = false;
    this.schedule();
  }

  pause(): void {
    this.paused = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  resize(): void {
    const dpr = (typeof devicePixelRatio === "number" && devicePixelRatio) || 1;
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    const W = Math.max(1, Math.round(cw * dpr));
    const H = Math.max(1, Math.round(ch * dpr));
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W;
      this.canvas.height = H;
    }
    this.fit = fitRect(this.info, { w: cw, h: ch }, this.o.fit ?? "contain");
    this.draw();
  }

  /** Advance the machine by `dt` seconds and repaint. The rAF loop calls this. */
  step(dt: number): void {
    this.safe(() => this.engine.sm_tick(dt));
  }

  destroy(): void {
    if (this.destroyed) return;
    this.pause();
    this.destroyed = true;
    if (typeof document !== "undefined") document.removeEventListener("visibilitychange", this.onVis);
    try {
      this.engine.sm_stop();
    } catch {
      /* already stopped */
    }
    this.engine.free();
  }

  private draw(): void {
    if (!this.ctx || this.destroyed) return;
    const dpr = (typeof devicePixelRatio === "number" && devicePixelRatio) || 1;
    const { width: W, height: H } = this.canvas;
    const f = this.fit;
    this.ctx.clearRect(0, 0, W, H);
    this.renderer.render(this.ctx, JSON.parse(this.engine.display_list(this.frame, f.scale * dpr, f.x * dpr, f.y * dpr)), W, H, [0, 0, W, H]);
  }

  private get running(): boolean {
    return !this.paused && !this.destroyed && !(typeof document !== "undefined" && document.hidden);
  }

  private schedule(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (!this.running) return;
    this.last = 0;
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0;
      this.last = now;
      this.step(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
}
