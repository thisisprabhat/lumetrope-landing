/** Responsive screenshot variants written by scripts/capture/variants.mjs beside each 2880 px shot. */
export const SHOT_WIDTHS = [960, 1440] as const;
export const shotVariant = (src: string, w: (typeof SHOT_WIDTHS)[number]) => src.replace(/\.webp$/, `-${w}.webp`);
export const shotSrcSet = (src: string) => [...SHOT_WIDTHS.map((w) => `${shotVariant(src, w)} ${w}w`), `${src} 2880w`].join(", ");
/** The shots span the max-w-6xl content column (72rem less the side padding). */
export const SHOT_SIZES = "(min-width: 72rem) 1104px, calc(100vw - 2rem)";
