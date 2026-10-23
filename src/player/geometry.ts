export interface Fit {
  scale: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Fit `content` into `box`, centred. `contain` letterboxes, `cover` fills and crops. */
export function fitRect(content: { w: number; h: number }, box: { w: number; h: number }, mode: "contain" | "cover"): Fit {
  const sx = box.w / content.w;
  const sy = box.h / content.h;
  const scale = mode === "cover" ? Math.max(sx, sy) : Math.min(sx, sy);
  const w = content.w * scale;
  const h = content.h * scale;
  return { scale, x: (box.w - w) / 2, y: (box.h - h) / 2, w, h };
}

/** Map a client-space point to composition space through the element rect and the fit. */
export function toComp(clientX: number, clientY: number, rect: { left: number; top: number }, fit: Fit): [number, number] {
  return [(clientX - rect.left - fit.x) / fit.scale, (clientY - rect.top - fit.y) / fit.scale];
}
