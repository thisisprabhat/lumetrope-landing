import { useEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent, PointerEvent } from "react";

const TAP_MS = 1200;

/**
 * `hover` for a player driven by its surrounding element. Mouse/pen use enter/leave; a touch tap
 * pulses hover for 1.2 s (pointerleave fires straight after pointerup on touch, so it is ignored);
 * keyboard focus holds it until blur.
 */
export function useHoverInput() {
  const [hover, setHover] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const inputs = useMemo(() => ({ hover }), [hover]);
  const handlers = useMemo(() => {
    const touch = (e: PointerEvent) => e.pointerType === "touch";
    return {
      onPointerEnter: (e: PointerEvent) => { if (!touch(e)) setHover(true); },
      onPointerLeave: (e: PointerEvent) => { if (!touch(e)) setHover(false); },
      onPointerDown: (e: PointerEvent) => {
        if (!touch(e)) return;
        setHover(true);
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setHover(false), TAP_MS);
      },
      onFocus: (_e: FocusEvent) => { clearTimeout(timer.current); setHover(true); },
      onBlur: (_e: FocusEvent) => setHover(false),
    };
  }, []);
  return { hover, inputs, handlers };
}
