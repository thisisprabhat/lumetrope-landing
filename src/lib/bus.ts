type Cb = (data?: unknown) => void;
const subs = new Map<string, Set<Cb>>();

/** Tiny event emitter shared across the page. */
export function emit(name: string, data?: unknown): void {
  subs.get(name)?.forEach((cb) => cb(data));
}

/** Subscribe; returns an `off` function. */
export function on(name: string, cb: Cb): () => void {
  let set = subs.get(name);
  if (!set) subs.set(name, (set = new Set()));
  set.add(cb);
  return () => {
    set!.delete(cb);
  };
}

export const bus = { emit, on };
