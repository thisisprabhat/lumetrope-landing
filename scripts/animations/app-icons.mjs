// The Lumetrope app's own 16 px stroke icons, copied verbatim from
// apps/web/src/components/Icon.tsx in the Lumetrope repo (MIT, github.com/thisisprabhat/lumetrope),
// so the landing page's feature icons match the editor UI. Only the ones the site uses are kept.
export const APP_ICONS = {
  diamond: "M8 2.5L13.5 8 8 13.5 2.5 8z",
  graph: "M4 4h.01M12 4h.01M8 12h.01M4 4l8 0M4 4l4 8M12 4l-4 8",
  mcp: "M5.5 2.5v3M10.5 2.5v3M4 5.5h8v3a4 4 0 01-8 0zM8 12.5V14",
  bolt: "M9 1.5L3.5 9H8l-1 5.5L12.5 7H8z",
  history: "M2.5 8a5.5 5.5 0 101.6-3.9M2.5 2.5v2.6h2.6M8 5v3l2 1.5",
  export: "M8 10V2.5M5 5.5l3-3 3 3M3 9.5v4h10v-4",
  layers: "M8 2l6 3-6 3-6-3zM2 8l6 3 6-3M2 11l6 3 6-3",
  palette: "M8 2a6 6 0 100 12c.8 0 1-.6 1-1.1 0-.9-.6-1.2-.6-1.9 0-.6.5-1 1.1-1H11a3 3 0 003-3C14 4.5 11.3 2 8 2zM5 7.5h.01M7 5h.01M10 5h.01",
};
/** The app draws them at 1.35 px on a 16 px grid. */
export const APP_STROKE = 1.35;
