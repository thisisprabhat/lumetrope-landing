import init, { Engine } from "./vendor/lumetrope_wasm";

export { Engine, WebpExporter } from "./vendor/lumetrope_wasm";

let ready: Promise<void> | null = null;
let done = false;

/** Initialise the shared WASM module once. Pass bytes in Node; browsers default to the bundled .wasm. */
export function initEngine(wasm?: BufferSource | URL): Promise<void> {
  if (!ready) {
    const module_or_path = wasm ?? new URL("./vendor/lumetrope_wasm_bg.wasm", import.meta.url);
    ready = init({ module_or_path }).then(() => {
      done = true;
    });
    ready.catch(() => {
      ready = null; // allow retry after failure
    });
  }
  return ready;
}

export function createEngine(): Engine {
  if (!done) throw new Error("Engine not initialised: await initEngine() before createEngine()");
  return new Engine();
}
