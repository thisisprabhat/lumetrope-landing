/* tslint:disable */
/* eslint-disable */

export class Engine {
    free(): void;
    [Symbol.dispose](): void;
    add_font(name: string, bytes: Uint8Array): boolean;
    /**
     * Run a catalogue tool with JSON args; returns `{"ok":…}` or `{"error":…}` JSON.
     */
    apply(tool: string, args_json: string): string;
    begin_batch(): void;
    can_redo(): boolean;
    can_undo(): boolean;
    catalog(): string;
    /**
     * GPU display list JSON for the Canvas2D executor.
     */
    display_list(frame: number, scale: number, tx: number, ty: number): string;
    end_batch(): void;
    /**
     * The project as a dotLottie v2 archive (animations, themes, state machines, images, fonts).
     */
    export_dotlottie(): Uint8Array;
    export_lottie(): string;
    /**
     * Names of fonts registered with add_font.
     */
    font_names(): string;
    /**
     * Topmost root layer id at a composition-space point ("" if none).
     */
    hit_test(x: number, y: number, frame: number): string;
    /**
     * `{asset id: data URI}` for embedded images.
     */
    image_assets(): string;
    info(): string;
    /**
     * Geometry JSON (bounds, corners, matrix, anchor) for a layer id, or "null".
     */
    layer_geometry(id: string, frame: number): string;
    /**
     * Load a `.json` (Lottie or project) or `.lottie` file. Returns info JSON.
     */
    load_file(name: string, bytes: Uint8Array): string;
    constructor();
    new_project(w: number, h: number, fr: number, frames: number): void;
    project_json(): string;
    redo(): boolean;
    /**
     * Straight-alpha RGBA pixels of the active animation at `frame`.
     */
    render(frame: number, w: number, h: number): Uint8Array;
    /**
     * Viewport render through a camera: screen = comp × scale + (tx, ty).
     */
    render_view(frame: number, w: number, h: number, scale: number, tx: number, ty: number): Uint8Array;
    revision(): number;
    set_project_json(s: string): void;
    /**
     * Show a nested scene on the canvas ("root" for the main scene).
     */
    set_view_scene(id: string): void;
    /**
     * Pointer event ("down" | "up" | "move" | "enter" | "exit" | "click") at a composition point.
     */
    sm_pointer(kind: string, x: number, y: number): string;
    /**
     * Set an input (JSON value) or fire an event (null).
     */
    sm_set_input(name: string, value_json: string): string;
    sm_snapshot(): string;
    /**
     * Start previewing a state machine; returns the snapshot JSON.
     */
    sm_start(id: string): string;
    sm_stop(): void;
    /**
     * Advance the running machine by `dt` seconds; returns snapshot + events JSON.
     */
    sm_tick(dt: number): string;
    undo(): boolean;
    vcs_branches(): string;
    /**
     * Commit the current project; returns the version id.
     */
    vcs_commit(message: string, author: string, ts: number): string;
    vcs_create_branch(name: string): void;
    vcs_diff(a: string, b: string): string;
    vcs_export(): Uint8Array;
    vcs_import(bytes: Uint8Array): void;
    vcs_log(): string;
    vcs_reset(): void;
    vcs_restore(id: string, ts: number): void;
    vcs_status(): string;
    vcs_switch(name: string, ts: number): void;
}

/**
 * Streams straight-alpha RGBA frames into an animated GIF.
 */
export class GifExporter {
    free(): void;
    [Symbol.dispose](): void;
    finish(): Uint8Array;
    constructor(w: number, h: number, fps: number, transparent: boolean, background: Uint8Array, matte: Uint8Array, alpha_threshold: number);
    push(rgba: Uint8Array): void;
}

/**
 * Writes WebCodecs-encoded VP8/VP9 frames (plus an optional alpha stream) into WebM.
 */
export class WebmWriter {
    free(): void;
    [Symbol.dispose](): void;
    finish(duration_ms: number): Uint8Array;
    constructor(w: number, h: number, vp9: boolean, alpha: boolean);
    /**
     * `alpha` is empty when the file has no alpha stream.
     */
    push(data: Uint8Array, alpha: Uint8Array, key: boolean, ts_ms: number): void;
}

/**
 * Streams straight-alpha RGBA frames into a lossless animated WebP.
 */
export class WebpExporter {
    free(): void;
    [Symbol.dispose](): void;
    finish(): Uint8Array;
    constructor(w: number, h: number, fps: number, transparent: boolean, background: Uint8Array);
    push(rgba: Uint8Array): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_engine_free: (a: number, b: number) => void;
    readonly __wbg_gifexporter_free: (a: number, b: number) => void;
    readonly __wbg_webmwriter_free: (a: number, b: number) => void;
    readonly __wbg_webpexporter_free: (a: number, b: number) => void;
    readonly engine_add_font: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly engine_apply: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly engine_begin_batch: (a: number) => void;
    readonly engine_can_redo: (a: number) => number;
    readonly engine_can_undo: (a: number) => number;
    readonly engine_catalog: (a: number) => [number, number];
    readonly engine_display_list: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly engine_end_batch: (a: number) => void;
    readonly engine_export_dotlottie: (a: number) => [number, number, number, number];
    readonly engine_export_lottie: (a: number) => [number, number];
    readonly engine_font_names: (a: number) => [number, number];
    readonly engine_hit_test: (a: number, b: number, c: number, d: number) => [number, number];
    readonly engine_image_assets: (a: number) => [number, number];
    readonly engine_info: (a: number) => [number, number];
    readonly engine_layer_geometry: (a: number, b: number, c: number, d: number) => [number, number];
    readonly engine_load_file: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly engine_new: () => number;
    readonly engine_new_project: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly engine_project_json: (a: number) => [number, number];
    readonly engine_redo: (a: number) => number;
    readonly engine_render: (a: number, b: number, c: number, d: number) => [number, number];
    readonly engine_render_view: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly engine_revision: (a: number) => number;
    readonly engine_set_project_json: (a: number, b: number, c: number) => [number, number];
    readonly engine_set_view_scene: (a: number, b: number, c: number) => void;
    readonly engine_sm_pointer: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly engine_sm_set_input: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly engine_sm_snapshot: (a: number) => [number, number];
    readonly engine_sm_start: (a: number, b: number, c: number) => [number, number, number, number];
    readonly engine_sm_stop: (a: number) => void;
    readonly engine_sm_tick: (a: number, b: number) => [number, number];
    readonly engine_undo: (a: number) => number;
    readonly engine_vcs_branches: (a: number) => [number, number];
    readonly engine_vcs_commit: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly engine_vcs_create_branch: (a: number, b: number, c: number) => [number, number];
    readonly engine_vcs_diff: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly engine_vcs_export: (a: number) => [number, number];
    readonly engine_vcs_import: (a: number, b: number, c: number) => [number, number];
    readonly engine_vcs_log: (a: number) => [number, number];
    readonly engine_vcs_reset: (a: number) => void;
    readonly engine_vcs_restore: (a: number, b: number, c: number, d: number) => [number, number];
    readonly engine_vcs_status: (a: number) => [number, number];
    readonly engine_vcs_switch: (a: number, b: number, c: number, d: number) => [number, number];
    readonly gifexporter_finish: (a: number) => [number, number, number, number];
    readonly gifexporter_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number, number];
    readonly gifexporter_push: (a: number, b: number, c: number) => [number, number];
    readonly webmwriter_finish: (a: number, b: number) => [number, number];
    readonly webmwriter_new: (a: number, b: number, c: number, d: number) => number;
    readonly webmwriter_push: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly webpexporter_finish: (a: number) => [number, number, number, number];
    readonly webpexporter_new: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly webpexporter_push: (a: number, b: number, c: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
