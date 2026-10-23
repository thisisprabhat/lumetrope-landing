/* @ts-self-types="./lumetrope_wasm.d.ts" */

export class Engine {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_engine_free(ptr, 0);
    }
    /**
     * @param {string} name
     * @param {Uint8Array} bytes
     * @returns {boolean}
     */
    add_font(name, bytes) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.engine_add_font(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret !== 0;
    }
    /**
     * Run a catalogue tool with JSON args; returns `{"ok":…}` or `{"error":…}` JSON.
     * @param {string} tool
     * @param {string} args_json
     * @returns {string}
     */
    apply(tool, args_json) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(tool, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(args_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.engine_apply(this.__wbg_ptr, ptr0, len0, ptr1, len1);
            deferred3_0 = ret[0];
            deferred3_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    begin_batch() {
        wasm.engine_begin_batch(this.__wbg_ptr);
    }
    /**
     * @returns {boolean}
     */
    can_redo() {
        const ret = wasm.engine_can_redo(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    can_undo() {
        const ret = wasm.engine_can_undo(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    catalog() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_catalog(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * GPU display list JSON for the Canvas2D executor.
     * @param {number} frame
     * @param {number} scale
     * @param {number} tx
     * @param {number} ty
     * @returns {string}
     */
    display_list(frame, scale, tx, ty) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_display_list(this.__wbg_ptr, frame, scale, tx, ty);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    end_batch() {
        wasm.engine_end_batch(this.__wbg_ptr);
    }
    /**
     * The project as a dotLottie v2 archive (animations, themes, state machines, images, fonts).
     * @returns {Uint8Array}
     */
    export_dotlottie() {
        const ret = wasm.engine_export_dotlottie(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {string}
     */
    export_lottie() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_export_lottie(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Names of fonts registered with add_font.
     * @returns {string}
     */
    font_names() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_font_names(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Topmost root layer id at a composition-space point ("" if none).
     * @param {number} x
     * @param {number} y
     * @param {number} frame
     * @returns {string}
     */
    hit_test(x, y, frame) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_hit_test(this.__wbg_ptr, x, y, frame);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * `{asset id: data URI}` for embedded images.
     * @returns {string}
     */
    image_assets() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_image_assets(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    info() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_info(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Geometry JSON (bounds, corners, matrix, anchor) for a layer id, or "null".
     * @param {string} id
     * @param {number} frame
     * @returns {string}
     */
    layer_geometry(id, frame) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.engine_layer_geometry(this.__wbg_ptr, ptr0, len0, frame);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Load a `.json` (Lottie or project) or `.lottie` file. Returns info JSON.
     * @param {string} name
     * @param {Uint8Array} bytes
     * @returns {string}
     */
    load_file(name, bytes) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.engine_load_file(this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    constructor() {
        const ret = wasm.engine_new();
        this.__wbg_ptr = ret;
        EngineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} w
     * @param {number} h
     * @param {number} fr
     * @param {number} frames
     */
    new_project(w, h, fr, frames) {
        wasm.engine_new_project(this.__wbg_ptr, w, h, fr, frames);
    }
    /**
     * @returns {string}
     */
    project_json() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_project_json(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {boolean}
     */
    redo() {
        const ret = wasm.engine_redo(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Straight-alpha RGBA pixels of the active animation at `frame`.
     * @param {number} frame
     * @param {number} w
     * @param {number} h
     * @returns {Uint8Array}
     */
    render(frame, w, h) {
        const ret = wasm.engine_render(this.__wbg_ptr, frame, w, h);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Viewport render through a camera: screen = comp × scale + (tx, ty).
     * @param {number} frame
     * @param {number} w
     * @param {number} h
     * @param {number} scale
     * @param {number} tx
     * @param {number} ty
     * @returns {Uint8Array}
     */
    render_view(frame, w, h, scale, tx, ty) {
        const ret = wasm.engine_render_view(this.__wbg_ptr, frame, w, h, scale, tx, ty);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {number}
     */
    revision() {
        const ret = wasm.engine_revision(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {string} s
     */
    set_project_json(s) {
        const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_set_project_json(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Show a nested scene on the canvas ("root" for the main scene).
     * @param {string} id
     */
    set_view_scene(id) {
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.engine_set_view_scene(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Pointer event ("down" | "up" | "move" | "enter" | "exit" | "click") at a composition point.
     * @param {string} kind
     * @param {number} x
     * @param {number} y
     * @returns {string}
     */
    sm_pointer(kind, x, y) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.engine_sm_pointer(this.__wbg_ptr, ptr0, len0, x, y);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Set an input (JSON value) or fire an event (null).
     * @param {string} name
     * @param {string} value_json
     * @returns {string}
     */
    sm_set_input(name, value_json) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(value_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.engine_sm_set_input(this.__wbg_ptr, ptr0, len0, ptr1, len1);
            deferred3_0 = ret[0];
            deferred3_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    sm_snapshot() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_sm_snapshot(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Start previewing a state machine; returns the snapshot JSON.
     * @param {string} id
     * @returns {string}
     */
    sm_start(id) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.engine_sm_start(this.__wbg_ptr, ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    sm_stop() {
        wasm.engine_sm_stop(this.__wbg_ptr);
    }
    /**
     * Advance the running machine by `dt` seconds; returns snapshot + events JSON.
     * @param {number} dt
     * @returns {string}
     */
    sm_tick(dt) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_sm_tick(this.__wbg_ptr, dt);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {boolean}
     */
    undo() {
        const ret = wasm.engine_undo(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    vcs_branches() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_vcs_branches(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Commit the current project; returns the version id.
     * @param {string} message
     * @param {string} author
     * @param {number} ts
     * @returns {string}
     */
    vcs_commit(message, author, ts) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(author, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.engine_vcs_commit(this.__wbg_ptr, ptr0, len0, ptr1, len1, ts);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} name
     */
    vcs_create_branch(name) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_vcs_create_branch(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} a
     * @param {string} b
     * @returns {string}
     */
    vcs_diff(a, b) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.engine_vcs_diff(this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @returns {Uint8Array}
     */
    vcs_export() {
        const ret = wasm.engine_vcs_export(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} bytes
     */
    vcs_import(bytes) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_vcs_import(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @returns {string}
     */
    vcs_log() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_vcs_log(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    vcs_reset() {
        wasm.engine_vcs_reset(this.__wbg_ptr);
    }
    /**
     * @param {string} id
     * @param {number} ts
     */
    vcs_restore(id, ts) {
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_vcs_restore(this.__wbg_ptr, ptr0, len0, ts);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @returns {string}
     */
    vcs_status() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.engine_vcs_status(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} name
     * @param {number} ts
     */
    vcs_switch(name, ts) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.engine_vcs_switch(this.__wbg_ptr, ptr0, len0, ts);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
}
if (Symbol.dispose) Engine.prototype[Symbol.dispose] = Engine.prototype.free;

/**
 * Streams straight-alpha RGBA frames into an animated GIF.
 */
export class GifExporter {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GifExporterFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_gifexporter_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    finish() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.gifexporter_finish(ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {number} w
     * @param {number} h
     * @param {number} fps
     * @param {boolean} transparent
     * @param {Uint8Array} background
     * @param {Uint8Array} matte
     * @param {number} alpha_threshold
     */
    constructor(w, h, fps, transparent, background, matte, alpha_threshold) {
        const ptr0 = passArray8ToWasm0(background, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(matte, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gifexporter_new(w, h, fps, transparent, ptr0, len0, ptr1, len1, alpha_threshold);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        GifExporterFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {Uint8Array} rgba
     */
    push(rgba) {
        const ptr0 = passArray8ToWasm0(rgba, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gifexporter_push(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
}
if (Symbol.dispose) GifExporter.prototype[Symbol.dispose] = GifExporter.prototype.free;

/**
 * Writes WebCodecs-encoded VP8/VP9 frames (plus an optional alpha stream) into WebM.
 */
export class WebmWriter {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WebmWriterFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_webmwriter_free(ptr, 0);
    }
    /**
     * @param {number} duration_ms
     * @returns {Uint8Array}
     */
    finish(duration_ms) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.webmwriter_finish(ptr, duration_ms);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {number} w
     * @param {number} h
     * @param {boolean} vp9
     * @param {boolean} alpha
     */
    constructor(w, h, vp9, alpha) {
        const ret = wasm.webmwriter_new(w, h, vp9, alpha);
        this.__wbg_ptr = ret;
        WebmWriterFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * `alpha` is empty when the file has no alpha stream.
     * @param {Uint8Array} data
     * @param {Uint8Array} alpha
     * @param {boolean} key
     * @param {number} ts_ms
     */
    push(data, alpha, key, ts_ms) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(alpha, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.webmwriter_push(this.__wbg_ptr, ptr0, len0, ptr1, len1, key, ts_ms);
    }
}
if (Symbol.dispose) WebmWriter.prototype[Symbol.dispose] = WebmWriter.prototype.free;

/**
 * Streams straight-alpha RGBA frames into a lossless animated WebP.
 */
export class WebpExporter {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WebpExporterFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_webpexporter_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    finish() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.webpexporter_finish(ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {number} w
     * @param {number} h
     * @param {number} fps
     * @param {boolean} transparent
     * @param {Uint8Array} background
     */
    constructor(w, h, fps, transparent, background) {
        const ptr0 = passArray8ToWasm0(background, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.webpexporter_new(w, h, fps, transparent, ptr0, len0);
        this.__wbg_ptr = ret;
        WebpExporterFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {Uint8Array} rgba
     */
    push(rgba) {
        const ptr0 = passArray8ToWasm0(rgba, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.webpexporter_push(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
}
if (Symbol.dispose) WebpExporter.prototype[Symbol.dispose] = WebpExporter.prototype.free;
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_41e9ee4f547fc59a: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_generic_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./lumetrope_wasm_bg.js": import0,
    };
}

const EngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_engine_free(ptr, 1));
const GifExporterFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gifexporter_free(ptr, 1));
const WebmWriterFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_webmwriter_free(ptr, 1));
const WebpExporterFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_webpexporter_free(ptr, 1));

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('lumetrope_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
